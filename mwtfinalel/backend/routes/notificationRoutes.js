import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = Router();
router.use(protect);

router.get("/", asyncHandler(getMyNotifications));
router.patch("/:id/read", asyncHandler(markNotificationRead));
router.post("/mark-all-read", asyncHandler(markAllNotificationsRead));

export default router;
