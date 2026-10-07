import Exam from "../models/Exam.js";
import MockAttempt from "../models/MockAttempt.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { notifyMentorMockTest } from "../services/communicationService.js";

function findChapter(exam, subjectId, chapterId) {
  const subject = exam.subjects.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);
  return { subject, chapter };
}

export async function listChapterAttempts(req, res) {
  const { examSlug, chapterId } = req.params;
  const exam = await Exam.findOne({ slug: examSlug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const subjectForChapter = exam.subjects.find((subject) => subject.chapters.some((chapter) => chapter.id === chapterId));
  const chapter = subjectForChapter?.chapters.find((c) => c.id === chapterId);
  if (!subjectForChapter || !chapter) return res.status(404).json({ message: "Chapter not found." });

  // 1. Fetch direct mock attempts logged for this chapter or topic mocks
  const topicIds = (chapter.topics || []).map((t) => t.id);
  const topicNames = (chapter.topics || []).map((t) => t.name);

  const [attempts, quizAttempts] = await Promise.all([
    MockAttempt.find({
      user: req.user._id,
      examSlug,
      $or: [{ chapterId }, { chapterName: chapter.name }, { mockId: { $in: topicIds } }],
    }).sort({ attemptedAt: 1 }),
    QuizAttempt.find({
      user: req.user._id,
      $or: [
        { chapterName: chapter.name },
        { topic: { $in: topicNames } },
        { examSlug, subjectName: subjectForChapter.name },
      ],
    }).sort({ attemptedAt: 1 }),
  ]);

  const grouped = {};

  // Add recorded MockAttempts
  for (const a of attempts) {
    const key = a.mockId || a.mockName;
    if (!grouped[key]) grouped[key] = { mockId: key, mockName: a.mockName, mockUrl: a.mockUrl, type: "mock", attempts: [] };
    grouped[key].attempts.push({
      _id: a._id,
      mockId: key,
      mockName: a.mockName,
      questionsAttended: a.questionsAttended,
      marks: a.marks,
      maxMarks: a.maxMarks,
      scorePercent: Math.round((a.marks / a.maxMarks) * 100),
      attemptedAt: a.attemptedAt,
      type: "mock",
    });
  }

  // Convert and add QuizAttempts taken on this website for this chapter/topics
  for (const qa of quizAttempts) {
    const key = `quiz-${qa.topic || qa.quizTitle}`;
    const quizName = qa.quizTitle || `${qa.topic} Drill`;
    if (!grouped[key]) grouped[key] = { mockId: key, mockName: quizName, mockUrl: "", type: "quiz", attempts: [] };
    grouped[key].attempts.push({
      _id: qa._id,
      mockId: key,
      mockName: quizName,
      questionsAttended: qa.totalQuestions,
      marks: qa.score,
      maxMarks: qa.totalQuestions,
      scorePercent: qa.percentage,
      attemptedAt: qa.attemptedAt || qa.createdAt,
      type: qa.sourceType === "mock-test" ? "mock" : "quiz",
    });
  }

  // Chapter default mocks (if configured in exam schema)
  const chapterMocks = (chapter?.mockTests || []).map((m) => ({ ...m.toObject?.() || m }));
  for (const m of chapterMocks) {
    if (!grouped[m.id]) grouped[m.id] = { mockId: m.id, mockName: m.name, mockUrl: m.url, type: "cbt-portal", attempts: [] };
  }

  // Merge all attempts chronologically for the analysis graph
  const allAttempts = [];
  for (const g of Object.values(grouped)) {
    for (const att of g.attempts) {
      allAttempts.push(att);
    }
  }
  allAttempts.sort((a, b) => new Date(a.attemptedAt) - new Date(b.attemptedAt));

  const allPercentages = allAttempts.map((a) => a.scorePercent);
  const average = allPercentages.length ? Math.round(allPercentages.reduce((s, x) => s + x, 0) / allPercentages.length) : 0;
  const best = allPercentages.length ? Math.max(...allPercentages) : 0;

  res.json({
    mocks: Object.values(grouped),
    summary: { totalAttempts: allAttempts.length, average, best },
    attempts: allAttempts,
  });
}

export async function recordAttempt(req, res) {
  const { examSlug, chapterId } = req.params;
  const { subjectId, mockId, mockName, mockUrl, questionsAttended, marks, maxMarks = 100, attemptedAt } = req.body || {};
  if (!subjectId || !mockId || !mockName) return res.status(400).json({ message: "subjectId, mockId and mockName are required." });
  const q = Number(questionsAttended), score = Number(marks), max = Number(maxMarks);
  if (!Number.isFinite(q) || q < 0 || !Number.isFinite(score) || !Number.isFinite(max) || max <= 0 || score < 0 || score > max) {
    return res.status(400).json({ message: "Enter valid questions attended, marks and maximum marks." });
  }
  const exam = await Exam.findOne({ slug: examSlug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const { subject, chapter } = findChapter(exam, subjectId, chapterId);
  if (!subject || !chapter) return res.status(404).json({ message: "Chapter not found." });

  const attempt = await MockAttempt.create({
    user: req.user._id,
    examSlug,
    subjectId,
    subjectName: subject.name,
    chapterId,
    chapterName: chapter.name,
    mockId,
    mockName,
    mockUrl: mockUrl || "",
    questionsAttended: q,
    marks: score,
    maxMarks: max,
    attemptedAt: attemptedAt ? new Date(attemptedAt) : new Date(),
  });

  // Automatically update Progress streaks & daily logs
  try {
    const progressDoc = await Progress.findOne({ user: req.user._id, examSlug });
    if (progressDoc) {
      const today = new Date().toISOString().slice(0, 10);
      if (!progressDoc.studyDays.includes(today)) {
        progressDoc.studyDays.push(today);
      }
      progressDoc.dailyLogs.push({
        date: today,
        action: `Attempted Mock Test: ${mockName}`,
        details: `${score}/${max} (${Math.round((score / max) * 100)}%) · ${chapter.name}`,
        timestamp: new Date(),
      });
      await progressDoc.save();
    }
  } catch {}

  // Automatically notify assigned mentor via WhatsApp, SMS, Email, and In-App
  let mentorAlert = null;
  try {
    const student = await User.findById(req.user._id).populate("mentor");
    let mentor = student?.mentor;
    if (!mentor) {
      mentor = await User.findOne({ role: "mentor" });
    }
    if (mentor) {
      mentorAlert = await notifyMentorMockTest({
        student,
        mentor,
        examSlug,
        examName: exam.name,
        subjectName: subject.name,
        chapterName: chapter.name,
        mockName,
        score,
        maxMarks: max,
      });
    }
  } catch (err) {
    console.error("[mockAttempt] Failed to send mentor notification:", err.message);
  }

  res.status(201).json({ attempt, mentorAlert });
}
