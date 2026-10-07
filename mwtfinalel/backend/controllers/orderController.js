import { Product, Order, ORDER_STAGES } from "../models/catalogModels.js";
import User from "../models/User.js";
import { notifyEvent } from "../services/communicationService.js";

function randomTrackingId() {
  return `PC${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
}

function etaString(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toDateString();
}

// POST /api/orders/checkout  Body: { paymentMethod, deliveryAddress }
export async function checkout(req, res) {
  const user = req.user;
  const cart = user.cart || [];
  if (cart.length === 0) return res.status(400).json({ message: "Your cart is empty." });

  const products = await Product.find({ _id: { $in: cart.map((c) => c.product) } });
  const productById = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  const items = cart
    .filter((c) => productById[c.product.toString()])
    .map((c) => {
      const p = productById[c.product.toString()];
      return { product: p._id, title: p.title, price: p.price, quantity: c.quantity };
    });

  if (items.length === 0) return res.status(400).json({ message: "Cart items are no longer available." });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { paymentMethod = "Card", deliveryAddress = "" } = req.body || {};
  const allowedPayments = ["Cash on Delivery", "UPI", "Google Pay", "Credit / Debit Card", "Net Banking"];
  if (!allowedPayments.includes(paymentMethod)) return res.status(400).json({ message: "Choose a supported payment method." });
  if (!deliveryAddress.trim()) return res.status(400).json({ message: "Delivery address is required." });
  const deliveryPartner = await User.findOne({ role: "delivery" }).sort({ createdAt: 1 });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const order = await Order.create({
    user: user._id,
    items,
    total,
    paymentMethod,
    paymentStatus: "pending",
    status: "Confirmed",
    carrier: "PrepCycle Logistics",
    trackingId: randomTrackingId(),
    eta: etaString(5),
    deliveryAddress,
    deliveryPartner: deliveryPartner?._id || null,
    deliveryPartnerName: deliveryPartner?.name || "Ramesh Kumar (PrepCycle Logistics)",
    deliveryPartnerId: deliveryPartner?.studentId || "DLV-042",
    deliveryPartnerPhone: deliveryPartner?.phone || "+91 98765 43210",
    deliveryPartnerVehicle: "TN 09 BX 4521 (Electric Van)",
    verificationOtp: otp,
    timeline: [{ status: "Confirmed", at: new Date() }],
  });

  user.cart = [];
  await user.save();

  notifyEvent(user, "order_confirmation", { trackingId: order.trackingId, total: order.total }).catch(() => {});

  res.status(201).json({ order, message: "Order confirmed successfully." });
}

// GET /api/orders
function syncOrder(order) {
  let changed = false;
  while (order.status !== ORDER_STAGES[ORDER_STAGES.length - 1]) {
    const idx = ORDER_STAGES.indexOf(order.status);
    const lastEvent = order.timeline?.[order.timeline.length - 1]?.at || order.createdAt || new Date();
    if (Date.now() - new Date(lastEvent).getTime() < 10000) break;
    const nextStatus = ORDER_STAGES[idx + 1];
    order.status = nextStatus;
    order.timeline.push({ status: nextStatus, at: new Date(new Date(lastEvent).getTime() + 10000) });
    changed = true;
  }
  return changed;
}

export async function listOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).populate("deliveryPartner", "name studentId phone").sort({ createdAt: -1 });
  for (const order of orders) {
    let touched = false;
    if (!order.verificationOtp) {
      order.verificationOtp = Math.floor(1000 + Math.random() * 9000).toString();
      touched = true;
    }
    if (!order.deliveryPartnerPhone) {
      order.deliveryPartnerPhone = "+91 98765 43210";
      touched = true;
    }
    if (!order.deliveryPartnerVehicle) {
      order.deliveryPartnerVehicle = "TN 09 BX 4521 (Electric Van)";
      touched = true;
    }
    if (syncOrder(order)) touched = true;
    if (touched) await order.save();
  }
  res.json({ orders });
}

// GET /api/orders/:id
export async function getOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json({ order });
}

// POST /api/orders/:id/advance - compatibility endpoint for the next stage
export async function advanceOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });

  const currentIdx = ORDER_STAGES.indexOf(order.status);
  if (currentIdx === -1 || currentIdx === ORDER_STAGES.length - 1) {
    return res.status(400).json({ message: "Order is already at its final status." });
  }

  const nextStatus = ORDER_STAGES[currentIdx + 1];
  order.status = nextStatus;
  order.timeline.push({ status: nextStatus, at: new Date() });
  await order.save();

  res.json({ order });
}
