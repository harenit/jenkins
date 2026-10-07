import { Router } from "express";
import { register, login, getMe, updateProfile, changePassword, googleOAuthStart, googleOAuthCallback, appleOAuthStart, appleOAuthCallback } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/oauth/google", googleOAuthStart);
router.get("/oauth/google/callback", asyncHandler(googleOAuthCallback));
router.get("/oauth/apple", appleOAuthStart);
router.post("/oauth/apple/callback", asyncHandler(appleOAuthCallback));
router.get("/oauth/apple/callback", asyncHandler(appleOAuthCallback));

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(getMe));
router.put("/profile", protect, asyncHandler(updateProfile));
router.put("/change-password", protect, asyncHandler(changePassword));

// Small local helper so every controller doesn't need its own try/catch.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default router;
