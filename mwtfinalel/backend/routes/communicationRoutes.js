import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { listCommunicationLogs, testSendCommunication } from "../controllers/communicationController.js";

const router = Router();
router.use(protect);
router.use(requireRole("admin"));

router.get("/logs", asyncHandler(listCommunicationLogs));
router.post("/send", asyncHandler(testSendCommunication));

export default router;
