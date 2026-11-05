import express, { type Request, type Response } from "express";

import { prisma } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.routes.js";
import { studioRouter } from "./routes/studio.routes.js";
import { courseRouter } from "./routes/course.routes.js";
import { reservationRouter } from "./routes/reservation.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    status: "ok",
    message: "Creno API is running",
  });
});

app.get(
  "/health/database",
  async (_request: Request, response: Response) => {
    try {
      const usersCount = await prisma.user.count();

      response.status(200).json({
        status: "ok",
        database: "connected",
        usersCount,
      });
    } catch (error) {
      console.error(error);

      response.status(500).json({
        status: "error",
        database: "disconnected",
      });
    }
  },
);

app.use("/auth", authRouter);
app.use("/studios", studioRouter);
app.use("/courses", courseRouter);
app.use(
  "/reservations",
  reservationRouter,
);
app.use("/payments", paymentRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Creno API démarrée sur le port ${PORT}`);
});