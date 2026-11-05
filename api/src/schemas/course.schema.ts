import { z } from "zod";

const editableCourseFields = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Le titre du cours est trop court.")
    .max(100, "Le titre du cours est trop long."),

  discipline: z
    .string()
    .trim()
    .min(2, "La discipline est obligatoire.")
    .max(100, "La discipline est trop longue."),

  description: z
    .string()
    .trim()
    .max(2000, "La description est trop longue.")
    .optional(),

  startAt: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "La date du cours est invalide.",
    )
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      "Le cours doit être planifié dans le futur.",
    ),

  durationMinutes: z
    .number()
    .int("La durée doit être un nombre entier.")
    .min(15, "Un cours doit durer au moins 15 minutes.")
    .max(300, "La durée du cours est trop élevée."),

  priceCents: z
    .number()
    .int("Le prix doit être exprimé en centimes.")
    .min(0, "Le prix ne peut pas être négatif."),

  capacity: z
    .number()
    .int("La capacité doit être un nombre entier.")
    .min(1, "Le cours doit accepter au moins une personne.")
    .max(500, "La capacité du cours est trop élevée."),

  status: z
    .enum(["DRAFT", "PUBLISHED", "CANCELLED"])
    .optional(),
});

export const createCourseSchema = editableCourseFields.extend({
  studioId: z
    .string()
    .uuid("L'identifiant du studio est invalide."),
});

export const updateCourseSchema = editableCourseFields
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Au moins un champ doit être fourni.",
    },
  );