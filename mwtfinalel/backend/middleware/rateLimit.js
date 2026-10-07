const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 120, key = (req) => req.ip || "unknown" } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    const item = buckets.get(id);
    if (!item || now - item.started >= windowMs) {
      buckets.set(id, { started: now, count: 1 });
      return next();
    }
    item.count += 1;
    if (item.count > max) {
      res.set("Retry-After", Math.ceil((windowMs - (now - item.started)) / 1000));
      return res.status(429).json({ message: "Too many requests. Please try again shortly." });
    }
    next();
  };
}
