import { Router } from "express";

import {
  createCourse,
  getCourseById,
  getMyCourses,
  getPublicCourses,
  updateCourse,
} from "../controllers/course.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireOwner } from "../middlewares/owner.middleware.js";

export const courseRouter = Router();

courseRouter.post(
  "/",
  requireAuth,
  requireOwner,
  createCourse,
);

courseRouter.get(
  "/mine",
  requireAuth,
  requireOwner,
  getMyCourses,
);

courseRouter.get(
  "/",
  getPublicCourses,
);

courseRouter.patch(
  "/:id",
  requireAuth,
  requireOwner,
  updateCourse,
);

courseRouter.get(
  "/:id",
  getCourseById,
);