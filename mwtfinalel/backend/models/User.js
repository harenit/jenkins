import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    password: {
      // Not required: social-login accounts have no local password.
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin", "delivery", "mentor"],
      default: "student",
    },
    studentId: { type: String, unique: true, sparse: true, index: true },
    phone: { type: String, trim: true, default: "" },
    whatsappNumber: { type: String, trim: true, default: "" },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    targetExam: { type: String, trim: true, default: "GATE CSE" },
    college: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    dailyGoalHours: { type: Number, default: 4 },
    bio: { type: String, trim: true, default: "" },
    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    // Phase 2 (Exam Explorer / My Progress) will populate this with exam IDs.
    registeredExams: [
      {
        type: String,
      },
    ],
    bookmarkedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function assignStudentId(next) {
  if (this.role === "student" && !this.studentId) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    this.studentId = `PC-STU-${suffix}`;
  }
  next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
