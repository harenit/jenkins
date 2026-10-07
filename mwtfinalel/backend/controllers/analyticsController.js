import Exam from "../models/Exam.js";
import Progress from "../models/Progress.js";
import { buildRoadmapResponse } from "./progressController.js";

// GET /api/analytics
export async function getAnalytics(req, res) {
  const progresses = await Progress.find({ user: req.user._id });
  const exams = await Exam.find({ slug: { $in: progresses.map((p) => p.examSlug) } });
  const examBySlug = Object.fromEntries(exams.map((e) => [e.slug, e]));

  let totalTopics = 0;
  let completedTopics = 0;
  let bestCurrentStreak = 0;
  let bestLongestStreak = 0;
  const allStudyDays = new Set();

  const perExam = progresses
    .filter((p) => examBySlug[p.examSlug])
    .map((p) => {
      const roadmap = buildRoadmapResponse(examBySlug[p.examSlug], p);
      totalTopics += roadmap.completion.total;
      completedTopics += roadmap.completion.completed;
      bestCurrentStreak = Math.max(bestCurrentStreak, roadmap.streak.current);
      bestLongestStreak = Math.max(bestLongestStreak, roadmap.streak.longest);
      for (const d of p.studyDays) allStudyDays.add(d);

      return {
        examSlug: p.examSlug,
        examName: examBySlug[p.examSlug].name,
        completion: roadmap.completion,
        subjects: roadmap.subjects.map((s) => ({ name: s.name, completion: s.completion })),
      };
    });

  res.json({
    overall: {
      totalTopics,
      completedTopics,
      pendingTopics: totalTopics - completedTopics,
      percent: totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0,
    },
    streak: { current: bestCurrentStreak, longest: bestLongestStreak },
    activeStudyDays: [...allStudyDays].sort(),
    perExam,
  });
}
