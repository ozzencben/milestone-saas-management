import { Router } from "express";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Tüm rotalar giriş yapmış olmayı gerektirir
router.use(authMiddleware);

router.get("/", getMyNotifications);
router.patch("/mark-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export default router;
