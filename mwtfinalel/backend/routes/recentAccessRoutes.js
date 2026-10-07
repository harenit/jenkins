import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listRecentAccess, recordRecentAccess } from "../controllers/recentAccessController.js";
const router = Router();
router.use(protect);
router.get("/", asyncHandler(listRecentAccess));
router.post("/", asyncHandler(recordRecentAccess));
export default router;
