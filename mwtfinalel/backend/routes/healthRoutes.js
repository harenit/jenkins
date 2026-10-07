import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health
router.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    service: "PrepCycle Node backend",
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

export default router;
