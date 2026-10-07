import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { listExams, listCategories, getExam, registerForExam, unregisterFromExam } from "../controllers/examController.js";

const router = Router();

router.get("/categories", asyncHandler(listCategories));
router.get("/", optionalAuth, asyncHandler(listExams));
router.get("/:slug", optionalAuth, asyncHandler(getExam));
router.post("/:slug/register", protect, asyncHandler(registerForExam));
router.delete("/:slug/register", protect, asyncHandler(unregisterFromExam));

export default router;
