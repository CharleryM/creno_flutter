import type {
  Request,
  Response,
} from "express";

import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import {
  preparePaymentSchema,
  reservationPaymentSchema,
} from "../schemas/payment.schema.js";

class PaymentError extends Error {
  statusCode: number;

  constructor(
    statusCode: number,
    message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function getOrCreatePendingReservation(
  userId: string,
  courseId: string,
) {
  return prisma.$transaction(
    async (transaction) => {
      const course =
        await transaction.course.findUnique({
          where: {
            id: courseId,
          },

          select: {
            id: true,
            startAt: true,
            priceCents: true,
            capacity: true,
            status: true,
          },
        });

      if (!course) {
        throw new PaymentError(
          404,
          "Cours introuvable.",
        );
      }

      if (
        course.status !== "PUBLISHED"
      ) {
        throw new PaymentError(
          409,
          "Ce cours n'est pas disponible à la réservation.",
        );
      }

      if (
        course.startAt.getTime() <=
        Date.now()
      ) {
        throw new PaymentError(
          409,
          "Ce cours a déjà commencé.",
        );
      }

      const existingReservation =
        await transaction.reservation.findUnique(
          {
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
          },
        );

      if (
        existingReservation?.status ===
        "PAID"
      ) {
        throw new PaymentError(
          409,
          "Tu as déjà payé ce cours.",
        );
      }

      if (
        existingReservation?.status ===
        "PENDING"
      ) {
        return existingReservation;
      }

      const occupiedPlaces =
        await transaction.reservation.count({
          where: {
            courseId,

            status: {
              in: [
                "PENDING",
                "PAID",
              ],
            },
          },
        });

      if (
        occupiedPlaces >=
        course.capacity
      ) {
        throw new PaymentError(
          409,
          "Ce cours est complet.",
        );
      }

      if (existingReservation) {
        return transaction.reservation.update(
          {
            where: {
              id: existingReservation.id,
            },

            data: {
              status: "PENDING",
              amountCents:
                course.priceCents,
              stripePaymentIntentId:
                null,
            },
          },
        );
      }

      return transaction.reservation.create({
        data: {
          userId,
          courseId,
          status: "PENDING",
          amountCents:
            course.priceCents,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function preparePayment(
  request: Request,
  response: Response,
) {
  if (!request.auth) {
    return response.status(401).json({
      message:
        "Authentification requise.",
    });
  }

  const validation =
    preparePaymentSchema.safeParse(
      request.body,
    );

  if (!validation.success) {
    return response.status(400).json({
      message:
        "Les données envoyées sont invalides.",

      errors:
        validation.error.issues.map(
          (issue) => ({
            field:
              issue.path.join("."),
            message: issue.message,
          }),
        ),
    });
  }

  const userId =
    request.auth.userId;

  const { courseId } =
    validation.data;

  try {
    const reservation =
      await getOrCreatePendingReservation(
        userId,
        courseId,
      );

    if (
      reservation.stripePaymentIntentId
    ) {
      const existingPaymentIntent =
        await stripe.paymentIntents.retrieve(
          reservation.stripePaymentIntentId,
        );

      if (
        existingPaymentIntent.status ===
        "succeeded"
      ) {
        await prisma.reservation.update({
          where: {
            id: reservation.id,
          },

          data: {
            status: "PAID",
          },
        });

        return response
          .status(200)
          .json({
            alreadyPaid: true,
            reservationId:
              reservation.id,
            clientSecret: null,
            amountCents:
              reservation.amountCents,
          });
      }

      if (
        existingPaymentIntent.status ===
        "processing"
      ) {
        throw new PaymentError(
          409,
          "Le paiement est encore en cours de traitement.",
        );
      }

      if (
        existingPaymentIntent.status !==
          "canceled" &&
        existingPaymentIntent.client_secret
      ) {
        return response
          .status(200)
          .json({
            alreadyPaid: false,
            reservationId:
              reservation.id,
            clientSecret:
              existingPaymentIntent.client_secret,
            amountCents:
              reservation.amountCents,
          });
      }
    }

    const paymentIntent =
      await stripe.paymentIntents.create({
        amount:
          reservation.amountCents,

        currency: "eur",

        payment_method_types: [
          "card",
        ],

        metadata: {
          reservationId:
            reservation.id,
          userId,
          courseId,
        },
      });

    if (!paymentIntent.client_secret) {
      throw new Error(
        "Stripe n'a pas renvoyé de client secret.",
      );
    }

    await prisma.reservation.update({
      where: {
        id: reservation.id,
      },

      data: {
        stripePaymentIntentId:
          paymentIntent.id,
      },
    });

    return response.status(200).json({
      alreadyPaid: false,
      reservationId:
        reservation.id,
      clientSecret:
        paymentIntent.client_secret,
      amountCents:
        reservation.amountCents,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      return response
        .status(error.statusCode)
        .json({
          message: error.message,
        });
    }

    console.error(
      "Erreur lors de la préparation du paiement :",
      error,
    );

    return response.status(500).json({
      message:
        "Impossible de préparer le paiement.",
    });
  }
}

export async function confirmPayment(
  request: Request,
  response: Response,
) {
  if (!request.auth) {
    return response.status(401).json({
      message:
        "Authentification requise.",
    });
  }

  const validation =
    reservationPaymentSchema.safeParse(
      request.body,
    );

  if (!validation.success) {
    return response.status(400).json({
      message:
        "Les données envoyées sont invalides.",
    });
  }

  const { reservationId } =
    validation.data;

  try {
    const reservation =
      await prisma.reservation.findFirst(
        {
          where: {
            id: reservationId,
            userId:
              request.auth.userId,
          },
        },
      );

    if (!reservation) {
      return response.status(404).json({
        message:
          "Réservation introuvable.",
      });
    }

    if (
      reservation.status === "PAID"
    ) {
      return response.status(200).json({
        message:
          "Le paiement est déjà confirmé.",

        reservation: {
          id: reservation.id,
          status: reservation.status,
          amountCents:
            reservation.amountCents,
        },
      });
    }

    if (
      !reservation.stripePaymentIntentId
    ) {
      return response.status(409).json({
        message:
          "Aucun paiement Stripe n'est associé à cette réservation.",
      });
    }

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        reservation.stripePaymentIntentId,
      );

    if (
      paymentIntent.metadata
        .reservationId !==
        reservation.id ||
      paymentIntent.amount !==
        reservation.amountCents ||
      paymentIntent.currency !== "eur"
    ) {
      return response.status(409).json({
        message:
          "Les informations du paiement ne correspondent pas à la réservation.",
      });
    }

    if (
      paymentIntent.status !==
      "succeeded"
    ) {
      return response.status(409).json({
        message:
          "Le paiement n'est pas encore confirmé.",
      });
    }

    const paidReservation =
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },

        data: {
          status: "PAID",
        },
      });

    return response.status(200).json({
      message:
        "Paiement confirmé avec succès.",

      reservation: {
        id: paidReservation.id,
        status:
          paidReservation.status,
        amountCents:
          paidReservation.amountCents,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la confirmation du paiement :",
      error,
    );

    return response.status(500).json({
      message:
        "Impossible de confirmer le paiement.",
    });
  }
}

export async function cancelPayment(
  request: Request,
  response: Response,
) {
  if (!request.auth) {
    return response.status(401).json({
      message:
        "Authentification requise.",
    });
  }

  const validation =
    reservationPaymentSchema.safeParse(
      request.body,
    );

  if (!validation.success) {
    return response.status(400).json({
      message:
        "Les données envoyées sont invalides.",
    });
  }

  const { reservationId } =
    validation.data;

  try {
    const reservation =
      await prisma.reservation.findFirst(
        {
          where: {
            id: reservationId,
            userId:
              request.auth.userId,
          },
        },
      );

    if (!reservation) {
      return response.status(404).json({
        message:
          "Réservation introuvable.",
      });
    }

    if (
      reservation.status ===
      "CANCELLED"
    ) {
      return response.status(200).json({
        message:
          "La réservation est déjà annulée.",
      });
    }

    if (
      reservation.status === "PAID"
    ) {
      return response.status(409).json({
        message:
          "Une réservation payée ne peut pas être annulée ici.",
      });
    }

    if (
      reservation.stripePaymentIntentId
    ) {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(
          reservation.stripePaymentIntentId,
        );

      if (
        paymentIntent.status ===
        "succeeded"
      ) {
        await prisma.reservation.update({
          where: {
            id: reservation.id,
          },

          data: {
            status: "PAID",
          },
        });

        return response.status(409).json({
          message:
            "Le paiement a déjà été effectué.",
        });
      }

      if (
        paymentIntent.status ===
        "processing"
      ) {
        return response.status(409).json({
          message:
            "Le paiement est encore en cours de traitement.",
        });
      }

      if (
        paymentIntent.status !==
        "canceled"
      ) {
        await stripe.paymentIntents.cancel(
          paymentIntent.id,
        );
      }
    }

    await prisma.reservation.update({
      where: {
        id: reservation.id,
      },

      data: {
        status: "CANCELLED",
        stripePaymentIntentId: null,
      },
    });

    return response.status(200).json({
      message: "Paiement annulé.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'annulation du paiement :",
      error,
    );

    return response.status(500).json({
      message:
        "Impossible d'annuler le paiement.",
    });
  }
}