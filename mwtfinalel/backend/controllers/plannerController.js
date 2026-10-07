import Exam from "../models/Exam.js";
import Progress from "../models/Progress.js";
import MockAttempt from "../models/MockAttempt.js";
import QuizAttempt from "../models/QuizAttempt.js";

const WEIGHTAGE_ORDER = { High: 0, Medium: 1, Low: 2 };
const SUGGESTED_MINUTES = { High: 90, Medium: 60, Low: 30 };

// GET /api/planner?days=1|7|14|21|30|60|90|180|365|custom
export async function getTodaysPlan(req, res) {
  const { days = 1, exam: examFilter = "" } = req.query;
  const parsedDays = parseInt(days, 10);
  const planDays = Math.max(1, Math.min(730, isNaN(parsedDays) ? 1 : parsedDays));

  // Strictly filter to the exams registered by the student
  const registeredSlugs = req.user.registeredExams || [];
  const targetSlugs = examFilter
    ? registeredSlugs.filter((s) => s.toLowerCase() === examFilter.toLowerCase() || s.includes(examFilter.toLowerCase()))
    : registeredSlugs;

  const [progresses, mockAttempts, quizAttempts] = await Promise.all([
    Progress.find({ user: req.user._id, examSlug: { $in: targetSlugs } }),
    MockAttempt.find({ user: req.user._id, ...(targetSlugs.length ? { examSlug: { $in: targetSlugs } } : {}) }).sort({ attemptedAt: -1 }).limit(100),
    QuizAttempt.find({ user: req.user._id }).sort({ attemptedAt: -1 }).limit(100),
  ]);

  const exams = await Exam.find({ slug: { $in: targetSlugs } });
  const examBySlug = Object.fromEntries(exams.map((e) => [e.slug, e]));

  // Calculate weak chapters & topics based on mock scores AND quiz scores (< 60%)
  const chapterScores = {};
  for (const a of mockAttempts) {
    if (a.chapterId) {
      if (!chapterScores[a.chapterId]) chapterScores[a.chapterId] = { total: 0, count: 0 };
      chapterScores[a.chapterId].total += (a.marks / (a.maxMarks || 100)) * 100;
      chapterScores[a.chapterId].count += 1;
    }
  }

  const topicScores = {};
  for (const qa of quizAttempts) {
    const tKey = qa.topic?.toLowerCase();
    if (tKey) {
      if (!topicScores[tKey]) topicScores[tKey] = { total: 0, count: 0 };
      topicScores[tKey].total += qa.percentage;
      topicScores[tKey].count += 1;
    }
  }

  const tasks = [];

  for (const progress of progresses) {
    const exam = examBySlug[progress.examSlug];
    if (!exam) continue;

    for (const subject of exam.subjects) {
      for (const chapter of subject.chapters) {
        const perf = chapterScores[chapter.id];
        const chapterAvg = perf && perf.count > 0 ? Math.round(perf.total / perf.count) : null;

        for (const topic of chapter.topics) {
          const status = progress.topicStatus.get(topic.id) || "pending";
          if (status === "completed") continue;

          const tPerf = topicScores[topic.name.toLowerCase()];
          const topicAvg = tPerf && tPerf.count > 0 ? Math.round(tPerf.total / tPerf.count) : null;
          const isWeak = (chapterAvg !== null && chapterAvg < 60) || (topicAvg !== null && topicAvg < 60);

          tasks.push({
            examSlug: exam.slug,
            examName: exam.name,
            subjectId: subject.id,
            subjectName: subject.name,
            chapterId: chapter.id,
            chapterName: chapter.name,
            topicId: topic.id,
            topicName: topic.name,
            weightage: chapter.weightage,
            isWeakArea: isWeak,
            weakScore: topicAvg !== null ? topicAvg : chapterAvg,
            status,
            suggestedMinutes: SUGGESTED_MINUTES[chapter.weightage] || 45,
          });
        }
      }
    }
  }

  // Prioritize weak areas first, then High/Medium/Low weightage, then in_progress
  tasks.sort((a, b) => {
    if (a.isWeakArea && !b.isWeakArea) return -1;
    if (!a.isWeakArea && b.isWeakArea) return 1;
    const w = (WEIGHTAGE_ORDER[a.weightage] ?? 1) - (WEIGHTAGE_ORDER[b.weightage] ?? 1);
    if (w !== 0) return w;
    if (a.status !== b.status) return a.status === "in_progress" ? -1 : 1;
    return 0;
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + t.suggestedMinutes, 0);
  const totalEstimatedHours = Math.round((totalMinutes / 60) * 10) / 10;

  if (planDays === 1) {
    const plan = tasks.slice(0, 12);
    return res.json({
      plan,
      totalIncomplete: tasks.length,
      planDays: 1,
      totalEstimatedHours,
      registeredExams: exams.map((e) => ({ slug: e.slug, name: e.name })),
      activeExamFilter: examFilter,
    });
  }

  // Multi-day plan (supports 7, 14, 21, 30, 60, 90, 180 / 6 months, 365, etc.)
  // Allocate study days vs weekly revision/mock days
  const schedule = [];
  const activeStudyDays = [];
  for (let d = 1; d <= planDays; d++) {
    // If multi-week plan, make every 7th day a structured revision day
    if (planDays >= 14 && d % 7 === 0) {
      continue;
    }
    activeStudyDays.push(d);
  }

  const studyDayCount = activeStudyDays.length || planDays;
  const topicsPerDay = Math.max(1, Math.ceil(tasks.length / studyDayCount));

  let taskCursor = 0;
  for (let day = 1; day <= planDays; day++) {
    const isRevisionDay = planDays >= 14 && day % 7 === 0;
    if (isRevisionDay) {
      schedule.push({
        dayNumber: day,
        title: `Day ${day} Milestone: Weekly Revision & Mock Test`,
        isRevisionDay: true,
        tasks: [],
        note: "Review all topics completed this week, take chapter quizzes, and resolve lingering weak areas.",
        totalMinutes: 120,
      });
    } else {
      const dayTasks = tasks.slice(taskCursor, taskCursor + topicsPerDay);
      taskCursor += dayTasks.length;
      schedule.push({
        dayNumber: day,
        title: `Day ${day} Focus`,
        isRevisionDay: false,
        tasks: dayTasks,
        totalMinutes: dayTasks.reduce((sum, t) => sum + t.suggestedMinutes, 0),
      });
    }
  }

  // Generate structured preparation phases for multi-month plans
  let phases = [];
  if (planDays >= 30) {
    const p1End = Math.round(planDays * 0.25);
    const p2End = Math.round(planDays * 0.60);
    const p3End = Math.round(planDays * 0.85);

    const phase1Tasks = tasks.slice(0, Math.round(tasks.length * 0.25));
    const phase2Tasks = tasks.slice(Math.round(tasks.length * 0.25), Math.round(tasks.length * 0.60));
    const phase3Tasks = tasks.slice(Math.round(tasks.length * 0.60), Math.round(tasks.length * 0.85));
    const phase4Tasks = tasks.slice(Math.round(tasks.length * 0.85));

    phases = [
      {
        phaseNumber: 1,
        title: "Phase 1: Foundations & Core Mathematical / Conceptual Base",
        dayRange: `Days 1 – ${p1End}`,
        milestone: "Build solid fundamentals, clear prerequisites, and eliminate foundational weak areas.",
        taskCount: phase1Tasks.length,
        tasks: phase1Tasks,
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Core Engineering Architecture, Data Structures & Systems",
        dayRange: `Days ${p1End + 1} – ${p2End}`,
        milestone: "Master high-weightage core subjects, implementation patterns, and problem-solving techniques.",
        taskCount: phase2Tasks.length,
        tasks: phase2Tasks,
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Advanced Computing, Network Architectures & Formal Theory",
        dayRange: `Days ${p2End + 1} – ${p3End}`,
        milestone: "Complete remaining syllabus topics, study protocols, system design, and advanced algorithms.",
        taskCount: phase3Tasks.length,
        tasks: phase3Tasks,
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Intensive PYQ Solving, Full-Length Mocks & Revision",
        dayRange: `Days ${p3End + 1} – ${planDays}`,
        milestone: "Timed exam practice, error analysis, formula revision, and exam-day speed mastery.",
        taskCount: phase4Tasks.length,
        tasks: phase4Tasks,
      },
    ];
  }

  // Week-by-week aggregation for convenient roadmap navigation
  const totalWeeks = Math.ceil(planDays / 7);
  const weeks = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const startDay = (w - 1) * 7 + 1;
    const endDay = Math.min(planDays, w * 7);
    const weekDays = schedule.filter((s) => s.dayNumber >= startDay && s.dayNumber <= endDay);
    const weekTasks = weekDays.flatMap((d) => d.tasks);
    weeks.push({
      weekNumber: w,
      title: `Week ${w} (Days ${startDay}–${endDay})`,
      taskCount: weekTasks.length,
      days: weekDays,
      totalMinutes: weekDays.reduce((sum, d) => sum + (d.totalMinutes || 0), 0),
    });
  }

  res.json({
    plan: tasks.slice(0, topicsPerDay),
    schedule,
    phases,
    weeks,
    totalIncomplete: tasks.length,
    planDays,
    topicsPerDay,
    totalEstimatedHours,
    registeredExams: exams.map((e) => ({ slug: e.slug, name: e.name })),
    activeExamFilter: examFilter,
  });
}
