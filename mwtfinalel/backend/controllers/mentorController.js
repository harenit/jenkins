import User from "../models/User.js";
import Progress from "../models/Progress.js";
import MockAttempt from "../models/MockAttempt.js";
import Exam from "../models/Exam.js";
import Notification from "../models/Notification.js";
import { sendCommunication } from "../services/communicationService.js";

/**
 * Returns all students assigned to the logged-in mentor.
 * Gathers each student's exam roadmaps, completion percentage, completed subjects, and recent mock attempts.
 */
export async function getMentorStudents(req, res) {
  const mentorId = req.user._id;

  // Find students assigned to this mentor, or if empty, list all active students
  let students = await User.find({
    role: "student",
    mentor: mentorId,
  }).select("name email phone whatsappNumber studentId targetExam registeredExams createdAt");

  if (!students.length) {
    // If no explicit assignments yet, also check assignedStudents array or fallback to students for preview
    const mentor = await User.findById(mentorId);
    if (mentor?.assignedStudents?.length) {
      students = await User.find({
        _id: { $in: mentor.assignedStudents },
      }).select("name email phone whatsappNumber studentId targetExam registeredExams createdAt");
    } else {
      // Return student pool so mentor has visibility
      students = await User.find({ role: "student" })
        .limit(10)
        .select("name email phone whatsappNumber studentId targetExam registeredExams createdAt");
    }
  }

  const allExams = await Exam.find().select("slug name subjects");
  const examMap = Object.fromEntries(allExams.map((e) => [e.slug, e]));

  const enrichedStudents = await Promise.all(
    students.map(async (student) => {
      const studentObj = student.toObject();

      // Fetch progress records
      const progressDocs = await Progress.find({ user: student._id });
      
      let totalTopics = 0;
      let completedTopics = 0;
      const completedSubjectsList = [];

      for (const p of progressDocs) {
        const exam = examMap[p.examSlug];
        if (!exam) continue;

        for (const s of exam.subjects) {
          let sTotal = 0;
          let sDone = 0;
          for (const c of s.chapters) {
            for (const t of c.topics) {
              sTotal += 1;
              totalTopics += 1;
              if (p.topicStatus.get(t.id) === "completed") {
                sDone += 1;
                completedTopics += 1;
              }
            }
          }
          if (sTotal > 0 && sDone === sTotal) {
            completedSubjectsList.push({ exam: exam.name, subject: s.name });
          }
        }
      }

      const overallPercent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Fetch recent mock test attempts
      const mockAttempts = await MockAttempt.find({ user: student._id })
        .sort({ attemptedAt: -1 })
        .limit(10);

      const recentMocks = mockAttempts.map((m) => ({
        _id: m._id,
        mockName: m.mockName,
        examSlug: m.examSlug,
        subjectName: m.subjectName,
        chapterName: m.chapterName,
        score: m.marks,
        maxMarks: m.maxMarks,
        percentage: Math.round((m.marks / m.maxMarks) * 100),
        attemptedAt: m.attemptedAt,
      }));

      // Generate direct WhatsApp link to student
      const studentPhone = (student.phone || student.whatsappNumber || "").replace(/[^0-9+]/g, "");
      let studentWhatsAppLink = "";
      if (studentPhone) {
        const digits = studentPhone.replace(/^\+/, "");
        const prefilled = `Hello ${student.name}! This is your PrepCycle Mentor ${req.user.name}. How is your exam preparation going?`;
        studentWhatsAppLink = `https://wa.me/${digits}?text=${encodeURIComponent(prefilled)}`;
      }

      return {
        ...studentObj,
        progress: {
          overallPercent,
          completedTopics,
          totalTopics,
          completedSubjects: completedSubjectsList,
        },
        recentMocks,
        studentWhatsAppLink,
      };
    })
  );

  res.json({ students: enrichedStudents });
}

/**
 * Returns mentor profile including contact details and active WhatsApp number.
 */
export async function getMentorProfile(req, res) {
  const user = await User.findById(req.user._id).select("name email phone whatsappNumber bio role assignedStudents");
  res.json({ mentor: user });
}

/**
 * Updates mentor profile (phone, whatsappNumber, bio).
 */
export async function updateMentorProfile(req, res) {
  const { phone, whatsappNumber, bio } = req.body || {};
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Mentor not found." });

  if (phone !== undefined) user.phone = phone;
  if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  res.json({ message: "Mentor profile updated.", mentor: user });
}

/**
 * Mentor sends direct encouragement or message to student.
 */
export async function sendStudentMessage(req, res) {
  const { studentId, message, channel = "whatsapp" } = req.body || {};
  if (!studentId || !message) {
    return res.status(400).json({ message: "studentId and message are required." });
  }

  const student = await User.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found." });

  const mentor = req.user;
  const studentPhone = (student.phone || student.whatsappNumber || "").replace(/[^0-9+]/g, "");
  let waUrl = "";
  if (studentPhone) {
    const digits = studentPhone.replace(/^\+/, "");
    waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(`[Mentor ${mentor.name}]: ${message}`)}`;
  }

  // Also create in-app notification for the student
  await Notification.create({
    user: student._id,
    recipient: student._id,
    type: "message",
    title: `💬 Message from Mentor ${mentor.name}`,
    body: message,
    fromUser: mentor._id,
    fromName: mentor.name,
  }).catch((e) => console.error("Student message notification error:", e));

  // Log in communications table
  await sendCommunication({
    user: student,
    channel: channel === "email" ? "email" : "whatsapp",
    messageType: "mentor_direct_message",
    recipient: channel === "email" ? student.email : studentPhone || student.email,
    subject: `PrepCycle: Message from Mentor ${mentor.name}`,
    content: message,
  }).catch(() => {});

  res.json({
    message: "Message dispatched to student.",
    whatsappUrl: waUrl,
  });
}
