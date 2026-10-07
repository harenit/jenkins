import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    examSlug: { type: String, required: true, index: true },
    // topicId -> "pending" | "in_progress" | "completed"
    topicStatus: { type: Map, of: String, default: {} },
    studyDays: [{ type: String }], // "YYYY-MM-DD" strings, used for streak calculation
    dailyLogs: [
      {
        date: { type: String }, // "YYYY-MM-DD"
        action: { type: String }, // e.g. "Completed Topic: Relational Algebra", "Scored 14/15 in Mock Drill"
        details: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, examSlug: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
