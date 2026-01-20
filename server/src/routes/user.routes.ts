import { Router } from "express";
import { searchUserByEmail } from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Tüm rotalar giriş yapmış olmayı gerektirir
router.use(authMiddleware);

router.get("/search", searchUserByEmail);

export default router;