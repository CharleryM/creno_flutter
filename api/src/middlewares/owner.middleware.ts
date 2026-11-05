import type {
  NextFunction,
  Request,
  Response,
} from "express";

export function requireOwner(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!request.auth) {
    return response.status(401).json({
      message: "Authentification requise.",
    });
  }

  if (request.auth.role !== "OWNER") {
    return response.status(403).json({
      message: "Cette action est réservée aux propriétaires de studios.",
    });
  }

  next();
}