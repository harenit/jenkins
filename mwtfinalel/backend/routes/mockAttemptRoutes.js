import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listChapterAttempts, recordAttempt } from "../controllers/mockAttemptController.js";
const router = Router();
router.use(protect);
router.get("/:examSlug/chapter/:chapterId", asyncHandler(listChapterAttempts));
router.post("/:examSlug/chapter/:chapterId", asyncHandler(recordAttempt));
export default router;
