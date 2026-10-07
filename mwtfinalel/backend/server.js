import dotenv from "dotenv";
dotenv.config();

// Prevent Windows local SSL inspection / corporate antivirus cert proxy from breaking Node.js fetch
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err);
});

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { seedDefaultAdmin, seedStudents, seedMentors } from "./data/seed.js";
import { seedCatalog } from "./data/seedCatalog.js";

import mentorRoutes from "./routes/mentorRoutes.js";

import healthRoutes from "./routes/healthRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mockAttemptRoutes from "./routes/mockAttemptRoutes.js";
import recentAccessRoutes from "./routes/recentAccessRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import commerceRoutes from "./routes/commerceRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { rateLimit } from "./middleware/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(rateLimit({ windowMs: 60_000, max: 180 }));

// All API responses are non-cacheable per spec section 5.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Database readiness check for API requests (returns 503 instead of buffering/timing out)
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database connection is initializing. If using MongoDB Atlas, check your network connection or IP access rules.",
      dbState: mongoose.connection.readyState,
    });
  }
  next();
});

app.use("/api/health", healthRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mock-attempts", mockAttemptRoutes);
app.use("/api/recently-accessed", recentAccessRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/commerce", commerceRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 for unknown API routes (kept distinct from the frontend catch-all below).
app.use("/api", (req, res) => {
  res.status(404).json({ message: `No API route: ${req.method} ${req.originalUrl}` });
});

// ---- Production: serve the built React app ----
// `npm run build` outputs frontend/dist. In production the same Node
// process serves both the API (/api/*) and the static frontend, so only
// one server needs to be deployed/hosted.
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Centralized error handler (catches anything passed to next(err)).
app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

async function runSeeds() {
  try {
    await seedDefaultAdmin();
    await seedStudents();
    await seedMentors();
    await seedCatalog();
    const { Order } = await import("./models/catalogModels.js");
    const { ReturnRequest } = await import("./models/commerceModels.js");
    const orders = await Order.find({ $or: [{ verificationOtp: "" }, { verificationOtp: { $exists: false } }, { verificationOtp: null }] });
    for (const o of orders) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      await Order.updateOne({ _id: o._id }, { $set: { verificationOtp: code } });
    }
    const returns = await ReturnRequest.find({ $or: [{ verificationOtp: "" }, { verificationOtp: { $exists: false } }, { verificationOtp: null }] });
    for (const r of returns) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      await ReturnRequest.updateOne({ _id: r._id }, { $set: { verificationOtp: code } });
    }
    console.log("[server] All seed data initialized.");
  } catch (err) {
    console.error("[server] Seed execution notice:", err.message);
  }
}

async function start() {
  app.listen(PORT, async () => {
    console.log(`[server] PrepCycle backend listening on http://localhost:${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV || "development"}`);
    await connectDB(runSeeds);
  });
}

start();
