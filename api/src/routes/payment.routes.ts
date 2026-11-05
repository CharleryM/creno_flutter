import { Router } from "express";

import {
  cancelPayment,
  confirmPayment,
  preparePayment,
} from "../controllers/payment.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/prepare",
  requireAuth,
  preparePayment,
);

paymentRouter.post(
  "/confirm",
  requireAuth,
  confirmPayment,
);

paymentRouter.post(
  "/cancel",
  requireAuth,
  cancelPayment,
);