import Exam from "../models/Exam.js";
import User from "../models/User.js";
import { Resource, Product, Order, ORDER_STAGES, Discussion, Flashcard } from "../models/catalogModels.js";
import { ReturnRequest } from "../models/commerceModels.js";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET /api/admin/overview
export async function getOverview(req, res) {
  const [users, exams, resources, products, orders, discussions] = await Promise.all([
    User.countDocuments(),
    Exam.countDocuments(),
    Resource.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Discussion.countDocuments(),
  ]);
  res.json({ users, exams, resources, products, orders, discussions });
}

/* ---------- Exams ---------- */
export async function adminListExams(req, res) {
  const exams = await Exam.find({}, { name: 1, slug: 1, category: 1, authority: 1, subjects: 1 }).sort({ name: 1 });
  res.json({ exams: exams.map((e) => ({ ...e.toObject(), subjectCount: e.subjects.length })) });
}

export async function adminCreateExam(req, res) {
  const { name, category, authority, description, eligibility, officialUrl } = req.body || {};
  if (!name) return res.status(400).json({ message: "name is required." });

  const slug = slugify(name);
  const existing = await Exam.findOne({ slug });
  if (existing) return res.status(409).json({ message: "An exam with this name already exists." });

  const exam = await Exam.create({
    slug,
    name,
    category: category || "general",
    authority: authority || "",
    description: description || "",
    eligibility: eligibility || "",
    officialUrl: officialUrl || "",
    timeline: {},
    applicationProcedure: [],
    examPattern: {},
    dressCode: [],
    subjects: [],
  });
  res.status(201).json({ exam });
}

export async function adminUpdateExam(req, res) {
  const exam = await Exam.findOne({ slug: req.params.slug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });

  const { name, category, authority, description, eligibility, officialUrl } = req.body || {};
  if (name !== undefined) exam.name = name;
  if (category !== undefined) exam.category = category;
  if (authority !== undefined) exam.authority = authority;
  if (description !== undefined) exam.description = description;
  if (eligibility !== undefined) exam.eligibility = eligibility;
  if (officialUrl !== undefined) {
    exam.officialUrl = officialUrl;
  }
  await exam.save();
  res.json({ exam });
}

export async function adminDeleteExam(req, res) {
  const exam = await Exam.findOneAndDelete({ slug: req.params.slug });
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  res.json({ message: "Exam deleted." });
}

/* ---------- Resources ---------- */
export async function adminListResources(req, res) {
  const resources = await Resource.find().sort({ createdAt: -1 }).limit(500);
  res.json({ resources });
}

export async function adminCreateResource(req, res) {
  const { examSlug, subjectName, type, title, description, url } = req.body || {};
  if (!examSlug || !type || !title || !url) return res.status(400).json({ message: "examSlug, type, title, and url are required." });
  const resource = await Resource.create({
    examSlug, subjectName: subjectName || "", type, title, description: description || "",
    url,
  });
  res.status(201).json({ resource });
}

export async function adminDeleteResource(req, res) {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found." });
  res.json({ message: "Resource deleted." });
}

/* ---------- Products ---------- */
export async function adminListProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 }).limit(500);
  res.json({ products });
}

export async function adminCreateProduct(req, res) {
  const { examSlug, subjectName, title, description, category, price, stock } = req.body || {};
  if (!title || price === undefined) return res.status(400).json({ message: "title and price are required." });
  const product = await Product.create({
    examSlug: examSlug || "", subjectName: subjectName || "", title,
    description: description || "", category: category || "General",
    price: Number(price), rating: 4.2, reviewsCount: 0, stock: stock !== undefined ? Number(stock) : 25,
  });
  res.status(201).json({ product });
}

export async function adminDeleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ message: "Product deleted." });
}

/* ---------- Users & Mentors ---------- */
export async function adminListUsers(req, res) {
  const users = await User.find()
    .select("-cart -bookmarkedResources")
    .populate("mentor", "name email phone whatsappNumber")
    .sort({ createdAt: -1 });
  res.json({ users });
}

export async function adminSetUserRole(req, res) {
  const { role } = req.body || {};
  if (!["student", "admin", "delivery", "mentor"].includes(role)) {
    return res.status(400).json({ message: "role must be student, admin, delivery, or mentor." });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  user.role = role;
  await user.save();
  res.json({ user });
}

export async function adminListMentors(req, res) {
  const mentors = await User.find({ role: "mentor" })
    .populate("assignedStudents", "name email studentId phone targetExam")
    .sort({ name: 1 });
  res.json({ mentors });
}

export async function adminCreateMentor(req, res) {
  const { name, email, password, phone, whatsappNumber, bio } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }
  const mentor = await User.create({
    name,
    email,
    password,
    phone: phone || whatsappNumber || "",
    whatsappNumber: whatsappNumber || phone || "",
    bio: bio || "",
    role: "mentor",
    authProvider: "local",
  });
  res.status(201).json({ mentor });
}

export async function adminAssignMentor(req, res) {
  const { studentId, mentorId } = req.body || {};
  const student = await User.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }
  if (!mentorId) {
    if (student.mentor) {
      await User.findByIdAndUpdate(student.mentor, { $pull: { assignedStudents: student._id } });
    }
    student.mentor = null;
    await student.save();
    return res.json({ message: "Mentor unassigned successfully.", student });
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== "mentor") {
    return res.status(404).json({ message: "Mentor not found or user is not a mentor." });
  }

  if (student.mentor && student.mentor.toString() !== mentor._id.toString()) {
    await User.findByIdAndUpdate(student.mentor, { $pull: { assignedStudents: student._id } });
  }

  student.mentor = mentor._id;
  await student.save();

  if (!mentor.assignedStudents.includes(student._id)) {
    mentor.assignedStudents.push(student._id);
    await mentor.save();
  }

  res.json({
    message: `Assigned mentor ${mentor.name} to student ${student.name}`,
    student,
    mentor,
  });
}

export async function adminDeleteUser(req, res) {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account while logged in." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User deleted." });
}

/* ---------- Orders ---------- */
export async function adminListOrders(req, res) {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(300);
  res.json({ orders });
}

export async function adminSetOrderStatus(req, res) {
  const { status } = req.body || {};
  if (!ORDER_STAGES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${ORDER_STAGES.join(", ")}` });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  order.status = status;
  order.timeline.push({ status, at: new Date() });
  await order.save();
  res.json({ order });
}

export async function adminListReturns(req, res) { const requests = await ReturnRequest.find().populate("user", "name email studentId").populate("order", "trackingId").sort({createdAt:-1}).limit(500); res.json({ requests }); }
export async function adminUpdateReturn(req, res) { const request = await ReturnRequest.findById(req.params.id); if(!request) return res.status(404).json({message:"Request not found."}); request.status=req.body.status; if(req.body.notes!==undefined) request.notes=req.body.notes; await request.save(); res.json({request}); }
