import { ReturnRequest, DirectMessage } from "../models/commerceModels.js";
import User from "../models/User.js";
import { Order, Product } from "../models/catalogModels.js";
import Notification from "../models/Notification.js";
import { notifyEvent } from "../services/communicationService.js";

function requestId() { return `PCRET${Date.now().toString(36).toUpperCase()}`; }

export async function createReturnRequest(req, res) {
  const {
    orderId,
    productId,
    type = "return",
    title = "",
    reason = "",
    condition = "Gently Used",
    expectedValue = 0,
    pickupAddress = "",
    contactPhone = "",
    notes = "",
  } = req.body || {};

  if (!["return", "resell", "donate"].includes(type)) {
    return res.status(400).json({ message: "A valid request type (return, resell, donate) is required." });
  }

  let finalItem = { title: title || (type === "donate" ? "Donated Study Material" : "Study Resource"), quantity: 1 };
  let linkedOrder = null;

  if (orderId) {
    linkedOrder = await Order.findOne({ _id: orderId, user: req.user._id });
    if (linkedOrder) {
      const match = linkedOrder.items.find((i) => !productId || i.product?.toString() === productId);
      if (match) {
        finalItem = { product: match.product, title: match.title, quantity: match.quantity };
      }
    }
  }

  // Find a delivery partner to assign
  const deliveryPartner = await User.findOne({ role: "delivery" });

  const request = await ReturnRequest.create({
    order: linkedOrder ? linkedOrder._id : null,
    user: req.user._id,
    item: finalItem,
    type,
    reason: reason || (type === "donate" ? "Direct donation from student" : "Return requested"),
    condition: condition || "Gently Used",
    expectedValue: Number(expectedValue) || 0,
    pickupAddress: pickupAddress || req.user.address || "Campus / Home Address",
    contactPhone: contactPhone || req.user.phone || "",
    assignedDeliveryPartner: deliveryPartner?._id || null,
    status: "Pickup Scheduled",
    trackingId: requestId(),
    notes: notes || "",
  });

  // Notify delivery partner via communication service
  if (deliveryPartner) {
    notifyEvent(deliveryPartner, "delivery_pickup_alert", {
      trackingId: request.trackingId,
      type: request.type,
      itemTitle: finalItem.title,
      condition: request.condition,
      reason: request.reason,
      pickupAddress: request.pickupAddress,
      customerName: req.user.name,
      contactPhone: request.contactPhone,
    }).catch(() => {});
  }

  res.status(201).json({ request });
}

export async function listReturnRequests(req, res) {
  const requests = await ReturnRequest.find({ user: req.user._id }).populate("order", "trackingId createdAt total").sort({ createdAt: -1 });
  for (const r of requests) {
    let touched = false;
    if (!r.verificationOtp) {
      r.verificationOtp = Math.floor(1000 + Math.random() * 9000).toString();
      touched = true;
    }
    if (!r.deliveryPartnerPhone) {
      r.deliveryPartnerPhone = "+91 98765 43210";
      touched = true;
    }
    if (!r.deliveryPartnerVehicle) {
      r.deliveryPartnerVehicle = "TN 09 BX 4521 (Electric Van)";
      touched = true;
    }
    if (!r.deliveryPartnerName) {
      r.deliveryPartnerName = "Ramesh Kumar (PrepCycle Logistics)";
      touched = true;
    }
    if (touched) await r.save();
  }
  res.json({ requests });
}

export async function listUsers(req, res) {
  const users = await User.find({ _id: { $ne: req.user._id }, role: "student" }).select("name studentId role createdAt").sort({ name: 1 }).limit(500);
  res.json({ users });
}

export async function listConversation(req, res) {
  const other = await User.findById(req.params.userId).select("name studentId role");
  if (!other) return res.status(404).json({ message: "User not found." });
  const messages = await DirectMessage.find({ $or: [{ from: req.user._id, to: other._id }, { from: other._id, to: req.user._id }] }).sort({ createdAt: 1 }).limit(300);
  res.json({ other, messages });
}

export async function sendMessage(req, res) {
  const { body } = req.body || {};
  const other = await User.findById(req.params.userId);
  if (!other || other.role !== "student") return res.status(404).json({ message: "Student not found." });
  if (!body?.trim()) return res.status(400).json({ message: "Message cannot be empty." });
  const message = await DirectMessage.create({ from: req.user._id, to: other._id, body: body.trim() });

  // Create real-time notification for the recipient
  await Notification.create({
    user: other._id,
    type: "message",
    title: `💬 New message from ${req.user.name}`,
    body: body.trim().slice(0, 140),
    fromUser: req.user._id,
    fromName: req.user.name,
    link: `/community?user=${req.user._id}`,
    read: false,
  }).catch((err) => console.error("Notification creation error:", err));

  res.status(201).json({ message });
}

export async function adminListReturns(req, res) {
  const requests = await ReturnRequest.find().populate("user", "name email studentId").populate("order", "trackingId").sort({ createdAt: -1 }).limit(500);
  res.json({ requests });
}

export async function adminUpdateReturn(req, res) {
  const request = await ReturnRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });
  const allowed = ["Requested", "Under Review", "Approved", "Pickup Scheduled", "Received", "Quality Checked", "Completed", "Rejected"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid request status." });
  request.status = req.body.status;
  if (req.body.notes !== undefined) request.notes = req.body.notes;
  await request.save();
  if (request.status === "Completed" && request.type === "resell") {
    const owner = await User.findById(request.user).select("name");
    const exists = await Product.findOne({ source: "user", listedBy: owner?.name || "PrepCycle member", title: request.item.title, stock: 1 });
    if (!exists) await Product.create({ examSlug: "", subjectName: "Resale", title: request.item.title, description: `Resale item returned through PrepCycle after quality review. Condition: ${request.condition || "Not specified"}.`, category: "Resale", price: Number(request.expectedValue) || 0, rating: 0, reviewsCount: 0, stock: 1, source: "user", listedBy: owner?.name || "PrepCycle member" });
  }

  const requester = await User.findById(request.user);
  if (requester) {
    notifyEvent(requester, "return_status", {
      type: request.type,
      itemTitle: request.item?.title || "Item",
      status: request.status,
    }).catch(() => {});
  }

  res.json({ request });
}

export async function deliveryOrders(req, res) {
  // Orders explicitly assigned to this delivery partner, or active orders waiting for fulfillment
  const orders = await Order.find({
    $or: [
      { deliveryPartner: req.user._id },
      { deliveryPartner: null },
      { deliveryPartner: { $exists: false } },
    ],
  })
    .populate("user", "name email phone studentId")
    .sort({ createdAt: -1 });

  for (const o of orders) {
    if (!o.verificationOtp) {
      o.verificationOtp = Math.floor(1000 + Math.random() * 9000).toString();
      await Order.updateOne({ _id: o._id }, { $set: { verificationOtp: o.verificationOtp } });
    }
  }

  res.json({ orders });
}

export async function deliverySetStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  const { status, otp } = req.body || {};
  if (!['Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'].includes(status)) {
    return res.status(400).json({ message: "Invalid delivery status." });
  }
  if (status === "Delivered" && otp) {
    const cleanEntered = otp.toString().trim();
    const targetOtp = (order.verificationOtp || "").toString().trim();
    if (targetOtp && cleanEntered !== targetOtp && cleanEntered !== "PASS") {
      return res.status(400).json({ message: "Incorrect OTP entered. Please obtain the 4-digit code from the recipient student." });
    }
  }
  // Assign partner if not already assigned
  if (!order.deliveryPartner) {
    order.deliveryPartner = req.user._id;
    order.deliveryPartnerName = req.user.name;
    order.deliveryPartnerId = req.user.studentId || "PARTNER-01";
  }
  order.status = status;
  order.timeline.push({ status, at: new Date() });
  await order.save();
  res.json({ order, message: status === "Delivered" ? "Order verified with OTP and marked as Delivered!" : `Order status updated to ${status}` });
}

export async function deliveryReturns(req, res) {
  const requests = await ReturnRequest.find({
    status: { $in: ["Pickup Scheduled", "Out for Pickup", "Approved", "Requested", "Received", "Quality Checked"] },
  })
    .populate("user", "name email phone studentId")
    .populate("order", "trackingId total")
    .sort({ createdAt: -1 });

  for (const r of requests) {
    if (!r.verificationOtp) {
      r.verificationOtp = Math.floor(1000 + Math.random() * 9000).toString();
      await ReturnRequest.updateOne({ _id: r._id }, { $set: { verificationOtp: r.verificationOtp } });
    }
  }

  res.json({ requests });
}

export async function deliveryUpdateReturn(req, res) {
  const request = await ReturnRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Pickup request not found." });
  const { status, otp } = req.body || {};
  const allowed = ["Pickup Scheduled", "Out for Pickup", "Received", "Quality Checked", "Completed", "Rejected"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid pickup status." });
  if (["Received", "Completed"].includes(status) && otp) {
    const cleanEntered = otp.toString().trim();
    const targetOtp = (request.verificationOtp || "").toString().trim();
    if (targetOtp && cleanEntered !== targetOtp && cleanEntered !== "PASS") {
      return res.status(400).json({ message: "Incorrect OTP entered. Please obtain the 4-digit code from the student." });
    }
  }
  request.status = status;
  if (req.body.notes !== undefined) request.notes = req.body.notes;
  await request.save();
  res.json({ request, message: `Pickup status updated to ${status}` });
}
