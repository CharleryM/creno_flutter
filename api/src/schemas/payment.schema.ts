import { z } from "zod";

export const preparePaymentSchema = z.object({
  courseId: z
    .string()
    .uuid(
      "L'identifiant du cours est invalide.",
    ),
});

export const reservationPaymentSchema =
  z.object({
    reservationId: z
      .string()
      .uuid(
        "L'identifiant de la réservation est invalide.",
      ),
  });