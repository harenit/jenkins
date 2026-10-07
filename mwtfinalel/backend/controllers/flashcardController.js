import { Flashcard } from "../models/catalogModels.js";

// GET /api/flashcards?examSlug=&subjectName=  - built-in cards + this user's own cards
export async function listFlashcards(req, res) {
  const { examSlug, subjectName } = req.query;
  const filter = { $or: [{ source: "built-in" }, { user: req.user._id }] };
  if (examSlug) filter.examSlug = examSlug;
  if (subjectName) filter.subjectName = subjectName;

  const cards = await Flashcard.find(filter).sort({ createdAt: -1 });
  res.json({ cards });
}

// POST /api/flashcards  Body: { examSlug?, subjectName?, question, answer }
export async function createFlashcard(req, res) {
  const { examSlug, subjectName, question, answer } = req.body || {};
  if (!question || !answer) {
    return res.status(400).json({ message: "question and answer are required." });
  }
  const card = await Flashcard.create({
    user: req.user._id,
    examSlug: examSlug || null,
    subjectName: subjectName || null,
    question,
    answer,
    source: "user",
  });
  res.status(201).json({ card });
}

// DELETE /api/flashcards/:id  - only the owning user can delete their own card
export async function deleteFlashcard(req, res) {
  const card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: "Flashcard not found." });
  await card.deleteOne();
  res.json({ message: "Deleted." });
}

/**
 * Rule-based (NOT AI) flashcard generator. Structured so a real LLM call
 * could replace generateCardsFromText() later without touching the route
 * or the frontend contract. See spec section 33.
 */
function generateCardsFromText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4);

  const cards = [];

  for (const line of lines) {
    if (cards.length >= 40) break;

    // Pattern 1: "Term: Definition" or "Term - Definition"
    const colonMatch = line.match(/^(.{3,70}?)\s*[:\u2013-]\s+(.{3,300})$/);
    if (colonMatch) {
      const [, term, definition] = colonMatch;
      cards.push({ question: `What is ${term.trim()}?`, answer: definition.trim() });
      continue;
    }

    // Pattern 2: sentences using definitional language
    const defWordMatch = line.match(/^(.{3,60}?)\s+(is defined as|refers to|means)\s+(.{3,300})$/i);
    if (defWordMatch) {
      const [, subject] = defWordMatch;
      cards.push({ question: `Define: ${subject.trim()}`, answer: line });
      continue;
    }

    // Fallback: longer standalone lines become a recall prompt
    if (line.length > 40) {
      const excerpt = line.slice(0, 55).trim();
      cards.push({ question: `Recall: "${excerpt}${line.length > 55 ? "…" : ""}"`, answer: line });
    }
  }

  return cards;
}

// POST /api/flashcards/generate  Body: { text, examSlug?, subjectName? }
// Text is extracted client-side (readAsText for txt/md/csv) and sent here as plain text.
export async function generateFromNotes(req, res) {
  const { text, examSlug, subjectName } = req.body || {};
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ message: "Provide at least a few lines of note text." });
  }

  const generated = generateCardsFromText(text);
  if (generated.length === 0) {
    return res.status(422).json({
      message: "Couldn't extract any question/answer pairs from this text. Try notes with clearer term/definition lines.",
    });
  }

  // Return for review/edit first - nothing is saved until the user confirms via POST /save
  res.json({
    generated,
    method: "rule-based (pattern matching on colons and definitional phrases) — not AI-generated",
    examSlug: examSlug || null,
    subjectName: subjectName || null,
  });
}

// POST /api/flashcards/generate/save  Body: { cards: [{question, answer}], examSlug?, subjectName? }
export async function saveGeneratedCards(req, res) {
  const { cards, examSlug, subjectName } = req.body || {};
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ message: "cards array is required." });
  }

  const docs = cards
    .filter((c) => c.question && c.answer)
    .map((c) => ({
      user: req.user._id,
      examSlug: examSlug || null,
      subjectName: subjectName || null,
      question: c.question,
      answer: c.answer,
      source: "generated",
    }));

  const saved = await Flashcard.insertMany(docs);
  res.status(201).json({ saved: saved.length, cards: saved });
}
