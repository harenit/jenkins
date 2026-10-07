import mongoose from "mongoose";

const recentAccessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  target: { type: String, default: "" },
  accessedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

recentAccessSchema.index({ user: 1, accessedAt: -1 });
export default mongoose.model("RecentAccess", recentAccessSchema);
