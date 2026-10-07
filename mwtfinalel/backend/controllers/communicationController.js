import CommunicationLog from "../models/CommunicationLog.js";
import { sendCommunication } from "../services/communicationService.js";

// GET /api/communications/logs
export async function listCommunicationLogs(req, res) {
  const { channel, messageType, status, search = "", page = 1, limit = 50 } = req.query;
  const filter = {};
  if (channel) filter.channel = channel;
  if (messageType) filter.messageType = messageType;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { recipient: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [total, logs] = await Promise.all([
    CommunicationLog.countDocuments(filter),
    CommunicationLog.find(filter)
      .populate("user", "name email studentId")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit)),
  ]);

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    logs,
  });
}

// POST /api/communications/send (Admin test send)
export async function testSendCommunication(req, res) {
  const { channel, messageType = "admin_test", recipient, subject = "PrepCycle Alert", content } = req.body || {};
  if (!channel || !recipient || !content) {
    return res.status(400).json({ message: "channel, recipient, and content are required." });
  }

  const log = await sendCommunication({
    user: req.user,
    channel,
    messageType,
    recipient,
    subject,
    content,
  });

  res.status(201).json({ log, message: `Notification processed for channel: ${channel}` });
}
