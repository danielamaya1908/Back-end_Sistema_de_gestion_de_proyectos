import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markAsRead);

export default router;
