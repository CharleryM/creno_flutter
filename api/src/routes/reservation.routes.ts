import { Router } from "express";

import {
  createReservation,
  getMyReservations,
} from "../controllers/reservation.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

export const reservationRouter =
  Router();

reservationRouter.post(
  "/",
  requireAuth,
  createReservation,
);

reservationRouter.get(
  "/mine",
  requireAuth,
  getMyReservations,
);