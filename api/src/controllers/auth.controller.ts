import bcrypt from "bcryptjs";
import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { createAccessToken } from "../lib/jwt.js";


export async function register(
  request: Request,
  response: Response,
) {
  try {
    const validation = registerSchema.safeParse(request.body);

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
      firstName,
      lastName,
      password,
      role,
    } = validation.data;

    const email = validation.data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return response.status(409).json({
        message: "Un compte existe déjà avec cette adresse email.",
      });
    }

    if (bcrypt.truncates(password)) {
      return response.status(400).json({
        message: "Le mot de passe est trop long.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return response.status(201).json({
      message: "Compte créé avec succès.",
      user,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}

export async function login(
  request: Request,
  response: Response,
) {
  try {
    const validation = loginSchema.safeParse(request.body);

    if (!validation.success) {
      return response.status(400).json({
        message: "Les données envoyées sont invalides.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const email = validation.data.email.toLowerCase();
    const password = validation.data.password;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return response.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      return response.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
    );

    return response.status(200).json({
      message: "Connexion réussie.",

      accessToken,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}

export async function me(
  request: Request,
  response: Response,
) {
  try {
    if (!request.auth) {
      return response.status(401).json({
        message: "Authentification requise.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: request.auth.userId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return response.status(401).json({
        message: "Utilisateur introuvable.",
      });
    }

    return response.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil :",
      error,
    );

    return response.status(500).json({
      message: "Une erreur interne est survenue.",
    });
  }
}