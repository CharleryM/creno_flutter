import type {
  Request,
  Response,
} from "express";

import { prisma } from "../lib/prisma.js";
import { createReservationSchema } from "../schemas/reservation.schema.js";

class ReservationError extends Error {
  statusCode: number;

  constructor(
    statusCode: number,
    message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createReservation(
  request: Request,
  response: Response,
) {
  if (!request.auth) {
    return response.status(401).json({
      message: "Authentification requise.",
    });
  }

  const validation =
    createReservationSchema.safeParse(
      request.body,
    );

  if (!validation.success) {
    return response.status(400).json({
      message:
        "Les données envoyées sont invalides.",
      errors: validation.error.issues.map(
        (issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }),
      ),
    });
  }

  const userId = request.auth.userId;
  const { courseId } = validation.data;

  try {
    const reservation =
      await prisma.$transaction(
        async (transaction) => {
          const course =
            await transaction.course.findUnique({
              where: {
                id: courseId,
              },

              select: {
                id: true,
                title: true,
                startAt: true,
                priceCents: true,
                capacity: true,
                status: true,
              },
            });

          if (!course) {
            throw new ReservationError(
              404,
              "Cours introuvable.",
            );
          }

          if (course.status !== "PUBLISHED") {
            throw new ReservationError(
              409,
              "Ce cours n'est pas disponible à la réservation.",
            );
          }

          if (
            course.startAt.getTime() <=
            Date.now()
          ) {
            throw new ReservationError(
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

          if (existingReservation) {
            throw new ReservationError(
              409,
              "Tu as déjà réservé ce cours.",
            );
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
            throw new ReservationError(
              409,
              "Ce cours est complet.",
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

            select: {
              id: true,
              status: true,
              amountCents: true,
              createdAt: true,

              course: {
                select: {
                  id: true,
                  title: true,
                  discipline: true,
                  startAt: true,
                  durationMinutes: true,

                  studio: {
                    select: {
                      id: true,
                      name: true,
                      city: true,
                    },
                  },
                },
              },
            },
          });
        },
        {
          isolationLevel:
            "Serializable",
        },
      );

    return response.status(201).json({
      message:
        "Réservation créée avec succès.",
      reservation,
    });
  } catch (error) {
    if (error instanceof ReservationError) {
      return response
        .status(error.statusCode)
        .json({
          message: error.message,
        });
    }

    console.error(
      "Erreur lors de la réservation :",
      error,
    );

    return response.status(500).json({
      message:
        "Une erreur interne est survenue.",
    });
  }
}

export async function getMyReservations(
  request: Request,
  response: Response,
) {
  if (!request.auth) {
    return response.status(401).json({
      message: "Authentification requise.",
    });
  }

  try {
    const reservations =
      await prisma.reservation.findMany({
        where: {
          userId: request.auth.userId,
        },

        select: {
          id: true,
          status: true,
          amountCents: true,
          createdAt: true,
          updatedAt: true,

          course: {
            select: {
              id: true,
              title: true,
              discipline: true,
              startAt: true,
              durationMinutes: true,
              status: true,

              studio: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return response.status(200).json({
      reservations,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des réservations :",
      error,
    );

    return response.status(500).json({
      message:
        "Une erreur interne est survenue.",
    });
  }
}