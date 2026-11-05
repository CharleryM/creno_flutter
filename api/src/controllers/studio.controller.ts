import type {
  Request,
  Response,
} from "express";

import { prisma } from "../lib/prisma.js";
import {
  createStudioSchema,
  updateStudioSchema,
} from "../schemas/studio.schema.js";

export async function createStudio(
  request: Request,
  response: Response,
) {
  try {
    if (!request.auth) {
      return response.status(401).json({
        message: "Authentification requise.",
      });
    }

    const validation = createStudioSchema.safeParse(
      request.body,
    );

    if (!validation.success) {
      return response.status(400).json({
        message: "Les données envoyées sont invalides.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      name,
      description,
      address,
      postalCode,
      city,
      phone,
    } = validation.data;

    const studio = await prisma.studio.create({
      data: {
        ownerId: request.auth.userId,
        name,
        description: description ?? null,
        address,
        postalCode,
        city,
        phone: phone ?? null,
      },
    });

    return response.status(201).json({
      message: "Studio créé avec succès.",
      studio,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du studio :",
      error,
    );

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}

export async function getMyStudios(
  request: Request,
  response: Response,
) {
  try {
    if (!request.auth) {
      return response.status(401).json({
        message: "Authentification requise.",
      });
    }

    const studios = await prisma.studio.findMany({
      where: {
        ownerId: request.auth.userId,
      },

      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return response.status(200).json({
      studios,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des studios :",
      error,
    );

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}

export async function getStudioById(
  request: Request,
  response: Response,
) {
  try {
    const { id } = request.params;

    if (typeof id !== "string") {
      return response.status(400).json({
        message: "Identifiant de studio invalide.",
      });
    }

    const studio = await prisma.studio.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        postalCode: true,
        city: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!studio) {
      return response.status(404).json({
        message: "Studio introuvable.",
      });
    }

    return response.status(200).json({
      studio,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du studio :",
      error,
    );

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}

export async function updateStudio(
  request: Request,
  response: Response,
) {
  try {
    if (!request.auth) {
      return response.status(401).json({
        message: "Authentification requise.",
      });
    }
    const { id } = request.params;

    if (typeof id !== "string") {
    return response.status(400).json({
        message: "Identifiant de studio invalide.",
    });
    }

    const validation = updateStudioSchema.safeParse(
      request.body,
    );

    if (!validation.success) {
      return response.status(400).json({
        message: "Les données envoyées sont invalides.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existingStudio =
    await prisma.studio.findFirst({
        where: {
        id,
        ownerId: request.auth.userId,
        },
    });

    if (!existingStudio) {
      return response.status(404).json({
        message: "Studio introuvable.",
      });
    }

    const studio = await prisma.studio.update({
      where: {
        id: existingStudio.id,
      },

      data: validation.data,
    });

    return response.status(200).json({
      message: "Studio modifié avec succès.",
      studio,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la modification du studio :",
      error,
    );

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}