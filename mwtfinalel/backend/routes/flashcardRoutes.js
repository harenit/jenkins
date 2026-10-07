import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import {
  listFlashcards, createFlashcard, deleteFlashcard, generateFromNotes, saveGeneratedCards,
} from "../controllers/flashcardController.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listFlashcards));
router.post("/", asyncHandler(createFlashcard));
router.delete("/:id", asyncHandler(deleteFlashcard));
router.post("/generate", asyncHandler(generateFromNotes));
router.post("/generate/save", asyncHandler(saveGeneratedCards));

export default router;
