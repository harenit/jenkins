import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import {
  listDiscussions, createDiscussion, voteDiscussion, replyToDiscussion, markBestReply,
} from "../controllers/communityController.js";

const router = Router();
router.get("/", optionalAuth, asyncHandler(listDiscussions));
router.post("/", protect, asyncHandler(createDiscussion));
router.post("/:id/vote", protect, asyncHandler(voteDiscussion));
router.post("/:id/reply", protect, asyncHandler(replyToDiscussion));
router.post("/:id/reply/:replyId/best", protect, asyncHandler(markBestReply));

export default router;
