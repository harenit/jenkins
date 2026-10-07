// Quotes served to the frontend mascot via GET /api/quotes.
// Kept on the backend (not hardcoded in the frontend) so the source of
// truth for quote content + rotation interval lives in one place.

export const QUOTES = [
  "You are closer to your goal than you think!",
  "Small steps every day lead to big dreams. Keep going!",
  "One chapter at a time. You've got this!",
  "Discipline today builds the results you'll thank yourself for tomorrow.",
  "Every topic you finish is one less thing standing between you and your goal.",
  "Progress, not perfection. Keep moving forward.",
  "Your future self is counting on the effort you put in right now.",
  "Consistency beats intensity. Show up today, even for 20 minutes.",
  "Hard days build strong toppers. This is one of them.",
  "You don't have to be perfect, you just have to keep going.",
  "Revision is where knowledge becomes confidence.",
  "Rest when you need to, but don't quit.",
  "The syllabus feels big because your effort is about to be bigger.",
  "Believe in the work you put in — it always shows up on exam day.",
  "One more topic. One more page. That's how it's done.",
];

export const QUOTE_INTERVAL_MS = 60000;
