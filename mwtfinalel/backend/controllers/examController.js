import Exam from "../models/Exam.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";

// GET /api/exams?search=&category=
export async function listExams(req, res) {
  const { search = "", category = "" } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { authority: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;

  const exams = await Exam.find(filter, {
    slug: 1, name: 1, category: 1, authority: 1, description: 1, eligibility: 1, officialUrl: 1, applicationUrl: 1, sourceVerifiedAt: 1, subjects: 1,
  }).sort({ name: 1 });

  let registeredSlugs = [];
  if (req.user) registeredSlugs = req.user.registeredExams;

  res.json({
    exams: exams.map((e) => ({ ...e.toObject(), isRegistered: registeredSlugs.includes(e.slug) })),
  });
}

// GET /api/exams/categories
export async function listCategories(req, res) {
  const categories = await Exam.distinct("category");
  res.json({ categories });
}

// GET /api/exams/:slug
export async function getExam(req, res) {
  const exam = await Exam.findOne({ slug: req.params.slug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });

  const isRegistered = req.user ? req.user.registeredExams.includes(exam.slug) : false;
  res.json({ exam, isRegistered });
}

// POST /api/exams/:slug/register  (auth required)
export async function registerForExam(req, res) {
  const exam = await Exam.findOne({ slug: req.params.slug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });

  const user = req.user;
  if (!user.registeredExams.includes(exam.slug)) {
    user.registeredExams.push(exam.slug);
    await user.save();
  }

  // Initialize a Progress document with every topic set to "pending".
  const topicStatus = {};
  for (const subject of exam.subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        topicStatus[topic.id] = "pending";
      }
    }
  }

  await Progress.findOneAndUpdate(
    { user: user._id, examSlug: exam.slug },
    { $setOnInsert: { topicStatus, studyDays: [] } },
    { upsert: true, new: true }
  );

  res.status(200).json({ message: `Registered for ${exam.name}.`, user });
}

// DELETE /api/exams/:slug/register (unregister - removes from registered exams and deletes progress document)
export async function unregisterFromExam(req, res) {
  const user = req.user;
  user.registeredExams = user.registeredExams.filter((s) => s !== req.params.slug);
  await user.save();
  await Progress.deleteMany({ user: user._id, examSlug: req.params.slug });
  res.status(200).json({ message: "Unregistered.", user });
}
