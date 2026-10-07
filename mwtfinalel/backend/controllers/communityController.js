import { Discussion } from "../models/catalogModels.js";

// GET /api/community?examSlug=
export async function listDiscussions(req, res) {
  const { examSlug } = req.query;
  const filter = {};
  if (examSlug) filter.examSlug = examSlug;
  const discussions = await Discussion.find(filter).sort({ createdAt: -1 });
  res.json({ discussions });
}

// POST /api/community  Body: { title, body, examSlug? }
export async function createDiscussion(req, res) {
  const { title, body, examSlug } = req.body || {};
  if (!title || !body) return res.status(400).json({ message: "title and body are required." });

  const discussion = await Discussion.create({
    user: req.user._id,
    userName: req.user.name,
    examSlug: examSlug || null,
    title,
    body,
  });
  res.status(201).json({ discussion });
}

// POST /api/community/:id/vote  Body: { direction: "up" | "down" }
export async function voteDiscussion(req, res) {
  const { direction = "up" } = req.body || {};
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ message: "Discussion not found." });
  discussion.votes += direction === "down" ? -1 : 1;
  await discussion.save();
  res.json({ votes: discussion.votes });
}

// POST /api/community/:id/reply  Body: { body }
export async function replyToDiscussion(req, res) {
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ message: "body is required." });

  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ message: "Discussion not found." });

  discussion.replies.push({ user: req.user._id, userName: req.user.name, body });
  await discussion.save();
  res.status(201).json({ discussion });
}

// POST /api/community/:id/reply/:replyId/best  - marks a reply as the best answer (author only)
export async function markBestReply(req, res) {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ message: "Discussion not found." });
  if (!discussion.user || !discussion.user.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the discussion author can mark a best answer." });
  }
  discussion.replies.forEach((r) => {
    r.isBest = r._id.toString() === req.params.replyId;
  });
  await discussion.save();
  res.json({ discussion });
}
