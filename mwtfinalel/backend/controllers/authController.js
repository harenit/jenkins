import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { notifyEvent } from "../services/communicationService.js";
import jwt from "jsonwebtoken";

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email || "");
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, confirmPassword }
 */
export async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "name, email, password and confirmPassword are all required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: "student",
    authProvider: "local",
  });

  const token = signToken(user);
  notifyEvent(user, "account_registration").catch(() => {});
  return res.status(201).json({ user, token, message: "Account created successfully." });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || user.authProvider !== "local") {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user);
  return res.status(200).json({ user, token });
}

/**
 * GET /api/auth/me
 * Requires Authorization: Bearer <token>
 */
export async function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}

/**
 * PUT /api/auth/profile
 * Updates user profile details
 */
export async function updateProfile(req, res) {
  const { name, phone, targetExam, college, state, dailyGoalHours, bio } = req.body || {};
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found." });

  if (name && typeof name === "string") user.name = name.trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (targetExam !== undefined) user.targetExam = String(targetExam).trim();
  if (college !== undefined) user.college = String(college).trim();
  if (state !== undefined) user.state = String(state).trim();
  if (dailyGoalHours !== undefined) user.dailyGoalHours = Math.max(1, Math.min(18, Number(dailyGoalHours) || 4));
  if (bio !== undefined) user.bio = String(bio).trim();

  await user.save();
  return res.status(200).json({ message: "Profile updated successfully.", user });
}

/**
 * PUT /api/auth/change-password
 * Changes the user's password after verifying the current password
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long." });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found." });

  // If user has a local password, verify current password
  if (user.password) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password does not match our records." });
    }
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return res.status(200).json({ message: "Password changed successfully." });
}


export function googleOAuthStart(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/oauth/google/callback";
  if (!clientId) return res.status(503).send("Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  res.redirect(url.toString());
}

export async function googleOAuthCallback(req, res) {
  const client = process.env.CLIENT_URL || "http://localhost:5173";
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { code, error } = req.query;
    if (error) {
      return res.redirect(`${client}/login?oauth_error=${encodeURIComponent(`Google sign-in canceled or failed: ${error}`)}`);
    }
    if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${client}/login?oauth_error=${encodeURIComponent("Google OAuth credentials or authorization code missing.")}`);
    }

    const redirect = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/oauth/google/callback";
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirect,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResp.json();
    if (!tokenResp.ok) {
      return res.redirect(`${client}/login?oauth_error=${encodeURIComponent(tokens.error_description || tokens.error || "Failed to exchange token with Google.")}`);
    }

    const profileResp = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResp.json();
    if (!profile.email) {
      return res.redirect(`${client}/login?oauth_error=${encodeURIComponent("Google account did not provide a verified email address.")}`);
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        role: "student",
        authProvider: "google",
      });
    }

    const token = signToken(user);
    res.redirect(`${client}/login?oauth_token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("[OAuth Error]:", err);
    res.redirect(`${client}/login?oauth_error=${encodeURIComponent(err.message || "Google sign-in encountered an internal error.")}`);
  }
}

export function appleOAuthStart(req, res) {
  const clientId = process.env.APPLE_CLIENT_ID;
  const redirect = process.env.APPLE_CALLBACK_URL || "http://localhost:5000/api/auth/oauth/apple/callback";
  if (!clientId) return res.status(503).send("Apple OAuth is not configured. Add APPLE_CLIENT_ID and Apple signing settings to backend/.env.");
  const url = new URL("https://appleid.apple.com/auth/authorize");
  url.searchParams.set("client_id", clientId); url.searchParams.set("redirect_uri", redirect); url.searchParams.set("response_type", "code"); url.searchParams.set("response_mode", "form_post"); url.searchParams.set("scope", "name email");
  res.redirect(url.toString());
}

export async function appleOAuthCallback(req, res) {
  const { code } = req.body || req.query || {};
  const clientId = process.env.APPLE_CLIENT_ID, teamId = process.env.APPLE_TEAM_ID, keyId = process.env.APPLE_KEY_ID, privateKey = process.env.APPLE_PRIVATE_KEY;
  if (!code || !clientId || !teamId || !keyId || !privateKey) return res.status(503).send("Apple OAuth is not fully configured. Add APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID and APPLE_PRIVATE_KEY.");
  const clientSecret = jwt.sign({}, privateKey.replace(/\\n/g,"\n"), { algorithm:"ES256", keyid:keyId, issuer:teamId, subject:clientId, audience:"https://appleid.apple.com", expiresIn:"180d" });
  const redirect = process.env.APPLE_CALLBACK_URL || "http://localhost:5000/api/auth/oauth/apple/callback";
  const tokenResp = await fetch("https://appleid.apple.com/auth/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({code, client_id:clientId, client_secret:clientSecret, redirect_uri:redirect, grant_type:"authorization_code"}) });
  const tokens = await tokenResp.json();
  if (!tokenResp.ok) return res.status(400).json({message: tokens.error_description || "Apple token exchange failed."});
  const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
  if (!payload.email) return res.status(400).send("Apple did not return an email address.");
  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) user = await User.create({ name: payload.email.split("@")[0], email: payload.email.toLowerCase(), role:"student", authProvider:"apple" });
  const token = signToken(user); const client = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(`${client}/login?oauth_token=${encodeURIComponent(token)}`);
}
