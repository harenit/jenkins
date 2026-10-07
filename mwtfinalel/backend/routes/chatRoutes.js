import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { chat } from "../controllers/chatController.js";
const router = Router();
router.use(protect);
router.post("/", asyncHandler(chat));
export default router;
