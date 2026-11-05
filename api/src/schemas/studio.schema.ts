import { z } from "zod";

export const createStudioSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom du studio est trop court.")
    .max(100, "Le nom du studio est trop long."),

  description: z
    .string()
    .trim()
    .max(2000, "La description est trop longue.")
    .optional(),

  address: z
    .string()
    .trim()
    .min(3, "L'adresse est obligatoire.")
    .max(191, "L'adresse est trop longue."),

  postalCode: z
    .string()
    .trim()
    .min(2, "Le code postal est obligatoire.")
    .max(20, "Le code postal est trop long."),

  city: z
    .string()
    .trim()
    .min(2, "La ville est obligatoire.")
    .max(100, "La ville est trop longue."),

  phone: z
    .string()
    .trim()
    .max(30, "Le numéro de téléphone est trop long.")
    .optional(),
});

export const updateStudioSchema = createStudioSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Au moins un champ doit être fourni.",
    },
  );