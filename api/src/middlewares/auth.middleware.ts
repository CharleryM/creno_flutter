import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { verifyAccessToken } from "../lib/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      message: "Authentification requise.",
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return response.status(401).json({
      message: "Token invalide ou expiré.",
    });
  }
}