import mongoose from "mongoose";

const mockAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  examSlug: { type: String, required: true, index: true },
  subjectId: { type: String, required: true },
  subjectName: { type: String, required: true },
  chapterId: { type: String, required: true, index: true },
  chapterName: { type: String, required: true },
  mockId: { type: String, required: true },
  mockName: { type: String, required: true },
  mockUrl: { type: String, default: "" },
  questionsAttended: { type: Number, min: 0, required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, min: 1, default: 100 },
  attemptedAt: { type: Date, default: Date.now },
}, { timestamps: true });

mockAttemptSchema.index({ user: 1, chapterId: 1, mockId: 1, attemptedAt: 1 });
export default mongoose.model("MockAttempt", mockAttemptSchema);
