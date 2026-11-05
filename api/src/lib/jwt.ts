import jwt, { type JwtPayload } from "jsonwebtoken";

import type { UserRole } from "../generated/prisma/client.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("La variable JWT_SECRET est manquante.");
  }

  return secret;
}

const jwtSecret = getJwtSecret();

type AuthTokenPayload = JwtPayload & {
  sub: string;
  role: UserRole;
};

export function createAccessToken(
  userId: string,
  role: UserRole,
): string {
  return jwt.sign(
    {
      role,
    },
    jwtSecret,
    {
      subject: userId,
      expiresIn: "1d",
    },
  );
}

export function verifyAccessToken(
  token: string,
): AuthTokenPayload {
  const payload = jwt.verify(token, jwtSecret);

  if (typeof payload === "string") {
    throw new Error("Token invalide.");
  }

  if (typeof payload.sub !== "string") {
    throw new Error("Token invalide.");
  }

  if (
    payload.role !== "USER" &&
    payload.role !== "OWNER"
  ) {
    throw new Error("Token invalide.");
  }

  return {
    ...payload,
    sub: payload.sub,
    role: payload.role,
  };
}