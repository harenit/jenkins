import { Note } from "../models/catalogModels.js";

// GET /api/notes
export async function listNotes(req, res) {
  const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json({ notes });
}

// POST /api/notes  Body: { title, content }
export async function createNote(req, res) {
  const { title, content } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required." });
  const note = await Note.create({ user: req.user._id, title, content: content || "" });
  res.status(201).json({ note });
}

// PATCH /api/notes/:id  Body: { title?, content? }
export async function updateNote(req, res) {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ message: "Note not found." });
  const { title, content } = req.body || {};
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  await note.save();
  res.json({ note });
}

// DELETE /api/notes/:id
export async function deleteNote(req, res) {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ message: "Note not found." });
  await note.deleteOne();
  res.json({ message: "Deleted." });
}
