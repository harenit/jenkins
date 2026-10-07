import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    examSlug: { type: String, default: "" },
    examName: { type: String, default: "" },
    subjectName: { type: String, default: "" },
    chapterName: { type: String, default: "" },
    topic: { type: String, required: true },
    quizTitle: { type: String, default: "" },
    sourceType: { type: String, default: "topic" },
    totalQuestions: { type: Number, required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    questions: [
      {
        question: String,
        options: [String],
        selectedAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
      },
    ],
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, topic: 1, attemptedAt: -1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
