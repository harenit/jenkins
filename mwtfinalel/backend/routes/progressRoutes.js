import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { getRoadmap, getAllProgressSummaries, setTopicStatus, resetProgress } from "../controllers/progressController.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(getAllProgressSummaries));
router.get("/:examSlug", asyncHandler(getRoadmap));
router.patch("/:examSlug/topic/:topicId", asyncHandler(setTopicStatus));
router.post("/:examSlug/reset", asyncHandler(resetProgress));

export default router;
