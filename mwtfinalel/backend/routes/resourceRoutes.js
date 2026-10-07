import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { listResources, toggleBookmark, createUserResource } from "../controllers/resourceController.js";

const router = Router();
router.get("/", optionalAuth, asyncHandler(listResources));
router.post("/", protect, asyncHandler(createUserResource));
router.post("/:id/bookmark", protect, asyncHandler(toggleBookmark));

export default router;
