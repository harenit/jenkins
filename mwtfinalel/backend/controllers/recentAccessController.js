import RecentAccess from "../models/RecentAccess.js";
import Exam from "../models/Exam.js";

export async function listRecentAccess(req, res) {
  let items = await RecentAccess.find({ user: req.user._id }).sort({ accessedAt: -1 }).limit(12);
  if (items.length === 0 && req.user.registeredExams && req.user.registeredExams.length > 0) {
    const exams = await Exam.find({ slug: { $in: req.user.registeredExams } });
    items = exams.map((e) => ({
      _id: e._id,
      type: "exam",
      title: e.name,
      subtitle: `${e.category.toUpperCase()} • Registered Exam`,
      target: `/my-progress?exam=${e.slug}`,
      accessedAt: new Date(),
    }));
  }
  res.json({ items });
}

export async function recordRecentAccess(req, res) {
  const { type, title, subtitle, target } = req.body || {};
  if (!type || !title) return res.status(400).json({ message: "type and title are required." });
  await RecentAccess.deleteMany({ user: req.user._id, type, title });
  const item = await RecentAccess.create({ user: req.user._id, type, title, subtitle: subtitle || "", target: target || "", accessedAt: new Date() });
  res.status(201).json({ item });
}
