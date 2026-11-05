import { Router } from "express";

import {
  createStudio,
  getMyStudios,
  getStudioById,
  updateStudio,
} from "../controllers/studio.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireOwner } from "../middlewares/owner.middleware.js";

export const studioRouter = Router();

studioRouter.post(
  "/",
  requireAuth,
  requireOwner,
  createStudio,
);

studioRouter.get(
  "/mine",
  requireAuth,
  requireOwner,
  getMyStudios,
);

studioRouter.patch(
  "/:id",
  requireAuth,
  requireOwner,
  updateStudio,
);

studioRouter.get(
  "/:id",
  getStudioById,
);