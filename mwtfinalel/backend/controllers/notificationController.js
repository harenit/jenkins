import Notification from "../models/Notification.js";

// GET /api/notifications
export async function getMyNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications, unreadCount });
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found." });
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notification, unreadCount });
}

// POST /api/notifications/mark-all-read
export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true, unreadCount: 0 });
}
