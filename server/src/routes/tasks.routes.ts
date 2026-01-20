import { Router } from "express";
import {
  createPersonalTask,
  deletePersonalTask,
  getCalendarTasks,
  getPersonalTasks,
  updatePersonalTask,
} from "../controllers/tasks.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/calendar", getCalendarTasks);
router.get("/", getPersonalTasks);
router.post("/", createPersonalTask);
router.patch("/:id", updatePersonalTask);
router.delete("/:id", deletePersonalTask);

export default router;
