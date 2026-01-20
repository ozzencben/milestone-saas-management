import { Router } from "express";
import { getMyProfile, login, register, } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMyProfile);
export default router;
