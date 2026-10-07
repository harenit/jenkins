import mongoose from "mongoose";

const communicationLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    channel: {
      type: String,
      enum: ["email", "sms", "whatsapp", "notification", "website"],
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["delivered", "pending", "failed", "not_configured"],
      default: "pending",
      index: true,
    },
    provider: {
      type: String,
      default: "",
    },
    providerMessageId: {
      type: String,
      default: "",
    },
    previewUrl: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

communicationLogSchema.index({ channel: 1, messageType: 1, timestamp: -1 });

export default mongoose.model("CommunicationLog", communicationLogSchema);
