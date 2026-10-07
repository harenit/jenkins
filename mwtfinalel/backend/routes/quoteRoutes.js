import { Router } from "express";
import { QUOTES, QUOTE_INTERVAL_MS } from "../data/quotes.js";

const router = Router();

// GET /api/quotes
router.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({
    quotes: QUOTES,
    intervalMs: QUOTE_INTERVAL_MS,
  });
});

export default router;
