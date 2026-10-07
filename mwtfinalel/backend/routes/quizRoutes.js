import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { generateQuiz, recordQuizAttempt, listQuizAttempts } from "../controllers/quizController.js";

const router = Router();
router.use(protect);

router.post("/generate", asyncHandler(generateQuiz));
router.post("/attempt", asyncHandler(recordQuizAttempt));
router.get("/attempts", asyncHandler(listQuizAttempts));

export default router;
