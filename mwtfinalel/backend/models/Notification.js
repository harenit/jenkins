import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["message", "admin_broadcast", "order", "system"],
      default: "message",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fromName: { type: String, default: "" },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.pre("validate", function (next) {
  if (!this.user && this.get("recipient")) {
    this.user = this.get("recipient");
  }
  next();
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
