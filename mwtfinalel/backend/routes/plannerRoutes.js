import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { getTodaysPlan } from "../controllers/plannerController.js";

const router = Router();
router.get("/", protect, asyncHandler(getTodaysPlan));
export default router;
