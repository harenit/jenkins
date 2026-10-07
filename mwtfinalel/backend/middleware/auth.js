import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verifies the Bearer JWT on the request and attaches the user document
 * (minus password) to req.user. Responds 401 on any failure.
 */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User for this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * Like protect(), but never rejects the request - if a valid token is
 * present it attaches req.user, otherwise req.user stays undefined and
 * the request proceeds. Used for routes that behave slightly differently
 * for logged-in users (e.g. flagging which exams they've registered for)
 * but are still browsable while logged out.
 */
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // invalid/expired token on an optional route - just proceed as logged-out
  }
  next();
}

/**
 * Must be used AFTER protect(). Restricts a route to admin-role users.
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function roleOnly(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "You do not have permission for this area." });
    next();
  };
}

export const requireRole = roleOnly;
