import { z } from "zod";

export const createReservationSchema = z.object({
  courseId: z
    .string()
    .uuid("L'identifiant du cours est invalide."),
});