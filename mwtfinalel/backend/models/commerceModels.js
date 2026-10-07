import mongoose from "mongoose";
import "./User.js";
import "./catalogModels.js";

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  item: { product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, title: String, quantity: Number },
  type: { type: String, enum: ["return", "resell", "donate"], required: true },
  reason: { type: String, default: "" },
  condition: { type: String, default: "Gently Used" },
  expectedValue: { type: Number, default: 0 },
  pickupAddress: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  assignedDeliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryPartnerName: { type: String, default: "Ramesh Kumar (PrepCycle Logistics)" },
  deliveryPartnerPhone: { type: String, default: "+91 98765 43210" },
  deliveryPartnerVehicle: { type: String, default: "TN 09 BX 4521 (Electric Van)" },
  verificationOtp: { type: String, default: "" },
  status: { type: String, enum: ["Requested", "Under Review", "Approved", "Pickup Scheduled", "Out for Pickup", "Received", "Quality Checked", "Completed", "Rejected"], default: "Requested" },
  trackingId: { type: String, default: "" },
  notes: { type: String, default: "" },
}, { timestamps: true });
export const ReturnRequest = mongoose.model("ReturnRequest", returnSchema);

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });
messageSchema.index({ from: 1, to: 1, createdAt: 1 });
messageSchema.index({ to: 1, from: 1, createdAt: 1 });
export const DirectMessage = mongoose.model("DirectMessage", messageSchema);
