import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getMentorStudents,
  getMentorProfile,
  updateMentorProfile,
  sendStudentMessage,
} from "../controllers/mentorController.js";

const router = Router();
router.use(protect);

// Ensure user has mentor or admin access
function mentorOnly(req, res, next) {
  if (req.user?.role !== "mentor" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access restricted to Mentors and Administrators." });
  }
  next();
}

router.use(mentorOnly);

router.get("/students", asyncHandler(getMentorStudents));
router.get("/profile", asyncHandler(getMentorProfile));
router.patch("/profile", asyncHandler(updateMentorProfile));
router.post("/message", asyncHandler(sendStudentMessage));

export default router;
