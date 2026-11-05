import type { UserRole } from "../generated/prisma/client.js";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId: string;
      role: UserRole;
    };
  }
}

export {};