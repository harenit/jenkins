import Exam from "../models/Exam.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { notifyMentorSubjectCompleted } from "../services/communicationService.js";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Combines an exam's static roadmap with a user's Progress document into
 * one response: every subject/chapter/topic, each topic's status, and
 * completion percentages computed at topic, chapter, subject, and overall
 * exam level. Chapters and topics are NEVER filtered out by weightage -
 * weightage is purely informational (spec section 23).
 */
function buildRoadmapResponse(exam, progressDoc) {
  const topicStatus = progressDoc ? Object.fromEntries(progressDoc.topicStatus) : {};

  let examTotal = 0;
  let examCompleted = 0;

  const subjects = exam.subjects.map((subject) => {
    let subjectTotal = 0;
    let subjectCompleted = 0;

    const weightRank = { High: 0, Medium: 1, Low: 2 };
    const chapters = [...subject.chapters].sort((a,b) => (weightRank[a.weightage] ?? 9) - (weightRank[b.weightage] ?? 9)).map((chapter) => {
      const topics = chapter.topics.map((topic) => {
        const status = topicStatus[topic.id] || "pending";
        subjectTotal += 1;
        examTotal += 1;
        if (status === "completed") {
          subjectCompleted += 1;
          examCompleted += 1;
        }
        return { id: topic.id, name: topic.name, status };
      });

      const chapterCompleted = topics.filter((t) => t.status === "completed").length;
      return {
        id: chapter.id,
        name: chapter.name,
        weightage: chapter.weightage,
        roadmapOrder: chapter.weightage === "High" ? 1 : chapter.weightage === "Medium" ? 2 : 3,
        topics,
        completion: {
          completed: chapterCompleted,
          total: topics.length,
          percent: topics.length ? Math.round((chapterCompleted / topics.length) * 100) : 0,
        },
      };
    });

    return {
      id: subject.id,
      name: subject.name,
      chapters,
      completion: {
        completed: subjectCompleted,
        total: subjectTotal,
        percent: subjectTotal ? Math.round((subjectCompleted / subjectTotal) * 100) : 0,
      },
    };
  });

  return {
    exam: { slug: exam.slug, name: exam.name, authority: exam.authority },
    subjects,
    completion: {
      completed: examCompleted,
      total: examTotal,
      percent: examTotal ? Math.round((examCompleted / examTotal) * 100) : 0,
    },
    streak: computeStreak(progressDoc?.studyDays || []),
    dailyLogs: (progressDoc?.dailyLogs || []).slice(-25).reverse(),
  };
}

function computeStreak(studyDays) {
  const daysSet = new Set(studyDays);
  const sorted = [...daysSet].sort();

  // current streak: consecutive days ending today or yesterday
  let current = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (daysSet.has(key)) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // longest streak across all recorded days
  let longest = 0;
  let running = 0;
  let prev = null;
  for (const day of sorted) {
    if (prev) {
      const diffDays = (new Date(day) - new Date(prev)) / 86400000;
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    longest = Math.max(longest, running);
    prev = day;
  }

  return { current, longest, recentDays: sorted.slice(-30) };
}

// GET /api/progress/:examSlug
export async function getRoadmap(req, res) {
  const exam = await Exam.findOne({ slug: req.params.examSlug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });

  const isRegistered = req.user.registeredExams && req.user.registeredExams.includes(exam.slug);
  if (!isRegistered) {
    return res.status(404).json({ message: "You are not registered for this exam." });
  }

  const progressDoc = await Progress.findOne({ user: req.user._id, examSlug: exam.slug });
  if (!progressDoc) {
    return res.status(404).json({ message: "You are not registered for this exam yet." });
  }

  res.json(buildRoadmapResponse(exam, progressDoc));
}

// GET /api/progress  (summary across all registered exams - for dashboard/analytics)
export async function getAllProgressSummaries(req, res) {
  const registeredSlugs = req.user.registeredExams || [];
  const progresses = await Progress.find({ user: req.user._id, examSlug: { $in: registeredSlugs } });
  const exams = await Exam.find({ slug: { $in: registeredSlugs } });
  const examBySlug = Object.fromEntries(exams.map((e) => [e.slug, e]));

  const summaries = progresses
    .filter((p) => registeredSlugs.includes(p.examSlug) && examBySlug[p.examSlug])
    .map((p) => {
      const roadmap = buildRoadmapResponse(examBySlug[p.examSlug], p);
      return {
        examSlug: p.examSlug,
        examName: examBySlug[p.examSlug].name,
        completion: roadmap.completion,
        streak: roadmap.streak,
        dailyLogs: roadmap.dailyLogs,
        subjects: roadmap.subjects.map((s) => ({ name: s.name, completion: s.completion })),
      };
    });

  res.json({ summaries });
}

// PATCH /api/progress/:examSlug/topic/:topicId  Body: { status: "completed" | "in_progress" | "pending" }
export async function setTopicStatus(req, res) {
  const { status } = req.body || {};
  if (!["pending", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "status must be pending, in_progress, or completed." });
  }

  const progressDoc = await Progress.findOne({ user: req.user._id, examSlug: req.params.examSlug });
  if (!progressDoc) return res.status(404).json({ message: "You are not registered for this exam." });

  progressDoc.topicStatus.set(req.params.topicId, status);

  const today = todayStr();
  if (!progressDoc.studyDays.includes(today)) {
    progressDoc.studyDays.push(today);
  }

  // Find topic name from exam
  const exam = await Exam.findOne({ slug: req.params.examSlug });
  let foundTopicName = req.params.topicId;
  if (exam) {
    for (const s of exam.subjects) {
      for (const c of s.chapters) {
        const t = c.topics.find((tp) => tp.id === req.params.topicId);
        if (t) {
          foundTopicName = `${t.name} (${c.name})`;
          break;
        }
      }
    }
  }

  progressDoc.dailyLogs.push({
    date: today,
    action: status === "completed" ? "Marked Topic Completed" : status === "in_progress" ? "Started Study Topic" : "Reset Topic Status",
    details: foundTopicName,
    timestamp: new Date(),
  });

  await progressDoc.save();

  // Check if subject was completed and notify mentor
  let mentorAlert = null;
  if (status === "completed" && exam) {
    let completedSubject = null;
    for (const s of exam.subjects) {
      const containsTopic = s.chapters.some((c) => c.topics.some((tp) => tp.id === req.params.topicId));
      if (containsTopic) {
        const allTopics = s.chapters.flatMap((c) => c.topics);
        const allDone = allTopics.every((tp) => progressDoc.topicStatus.get(tp.id) === "completed");
        if (allDone) {
          completedSubject = s;
        }
        break;
      }
    }

    if (completedSubject) {
      try {
        const student = await User.findById(req.user._id).populate("mentor");
        let mentor = student?.mentor;
        if (!mentor) {
          mentor = await User.findOne({ role: "mentor" });
        }
        if (mentor) {
          mentorAlert = await notifyMentorSubjectCompleted({
            student,
            mentor,
            examSlug: exam.slug,
            examName: exam.name,
            subjectName: completedSubject.name,
          });
        }
      } catch (e) {
        console.error("[progress] Failed to notify mentor on subject completion:", e.message);
      }
    }
  }

  const response = buildRoadmapResponse(exam, progressDoc);
  if (mentorAlert) response.mentorAlert = mentorAlert;
  res.json(response);
}

// POST /api/progress/:examSlug/reset  Body: { topicId? }  - resets one topic, or the whole exam if omitted
export async function resetProgress(req, res) {
  const { topicId } = req.body || {};
  const progressDoc = await Progress.findOne({ user: req.user._id, examSlug: req.params.examSlug });
  if (!progressDoc) return res.status(404).json({ message: "You are not registered for this exam." });

  if (topicId) {
    progressDoc.topicStatus.set(topicId, "pending");
  } else {
    for (const key of progressDoc.topicStatus.keys()) {
      progressDoc.topicStatus.set(key, "pending");
    }
  }
  await progressDoc.save();

  const exam = await Exam.findOne({ slug: req.params.examSlug });
  res.json(buildRoadmapResponse(exam, progressDoc));
}

export { buildRoadmapResponse };
