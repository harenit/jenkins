import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { listNotes, createNote, updateNote, deleteNote } from "../controllers/noteController.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listNotes));
router.post("/", asyncHandler(createNote));
router.patch("/:id", asyncHandler(updateNote));
router.delete("/:id", asyncHandler(deleteNote));

export default router;
