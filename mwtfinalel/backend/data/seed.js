import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

/**
 * Ensures default accounts exist for testing:
 * - 5 Student accounts: student1@prepcycle.test to student5@prepcycle.test (Student@12345)
 * - Admin account: admin@prepcycle.com (Admin@12345)
 * - Delivery partner: delivery@prepcycle.com (Delivery@12345)
 */
export async function seedStudents() {
  const students = [1, 2, 3, 4, 5].map((i) => ({
    name: `PrepCycle Student ${i}`,
    email: `student${i}@prepcycle.test`,
    password: `Student@12345`,
    role: "student",
    studentId: `PC-STU-${100000 + i}`,
    authProvider: "local",
  }));

  for (const student of students) {
    const existing = await User.findOne({ email: student.email });
    if (!existing) {
      await User.create(student);
    } else {
      let changed = false;
      if (!existing.studentId || !existing.studentId.startsWith("PC-STU-")) {
        existing.studentId = student.studentId;
        changed = true;
      }
      if (changed) await existing.save();
    }
  }

  const deliveryEmails = ["delivery@prepcycle.com", "delivery@prepcycle.test"];
  const deliveryPassword = process.env.DEFAULT_DELIVERY_PASSWORD || "Delivery@12345";
  for (const email of deliveryEmails) {
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        name: "PrepCycle Delivery Partner",
        email,
        password: deliveryPassword,
        role: "delivery",
        authProvider: "local",
      });
    }
  }

  console.log(`[seed] Delivery partner accounts ready: delivery@prepcycle.test / delivery@prepcycle.com (password: ${deliveryPassword})`);
  console.log("[seed] Five student test accounts ready: student1@prepcycle.test through student5@prepcycle.test (password: Student@12345)");
}

export async function seedMentors() {
  const mentors = [
    {
      name: "Dr. Rajesh Sharma (Senior Mentor)",
      email: "mentor@prepcycle.com",
      password: process.env.DEFAULT_MENTOR_PASSWORD || "Mentor@12345",
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
      role: "mentor",
      bio: "Senior Academic Mentor & Competitive Exam Strategist (GATE / UPSC / JEE)",
      authProvider: "local",
    },
    {
      name: "Prof. Ananya Sen (Aptitude & Science Mentor)",
      email: "mentor1@prepcycle.test",
      password: "Mentor@12345",
      phone: "+919876543211",
      whatsappNumber: "+919876543211",
      role: "mentor",
      bio: "IIT-M Alumnus, 8+ years guiding engineering and science aspirants",
      authProvider: "local",
    },
  ];

  let primaryMentor = null;
  for (const m of mentors) {
    let existing = await User.findOne({ email: m.email });
    if (!existing) {
      existing = await User.create(m);
      console.log(`[seed] Mentor created -> email: ${m.email}, phone/wa: ${m.whatsappNumber}`);
    } else {
      let changed = false;
      if (existing.role !== "mentor") {
        existing.role = "mentor";
        changed = true;
      }
      if (!existing.whatsappNumber) {
        existing.whatsappNumber = m.whatsappNumber;
        changed = true;
      }
      if (changed) await existing.save();
    }
    if (!primaryMentor) primaryMentor = existing;
  }

  // Link primary mentor to test students if not already assigned
  if (primaryMentor) {
    const students = await User.find({ role: "student" });
    for (const student of students) {
      if (!student.mentor) {
        student.mentor = primaryMentor._id;
        await student.save();
        if (!primaryMentor.assignedStudents.includes(student._id)) {
          primaryMentor.assignedStudents.push(student._id);
        }
      }
    }
    await primaryMentor.save();
    console.log(`[seed] Assigned students linked to mentor: ${primaryMentor.email}`);
  }
}

export async function seedDefaultAdmin() {
  const adminEmails = ["admin@prepcycle.com", "admin@prepcycle.test"];
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@12345";

  for (const email of adminEmails) {
    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      await User.create({
        name: "PrepCycle Admin",
        email,
        password,
        role: "admin",
        authProvider: "local",
      });
      console.log(`[seed] Default admin created -> email: ${email}, password: ${password}`);
    } else {
      console.log(`[seed] Admin account ready -> email: ${email}`);
    }
  }
}

// Allow running directly: `npm run seed` or `node data/seed.js`
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  connectDB()
    .then(async () => {
      await seedDefaultAdmin();
      await seedStudents();
      await seedMentors();
    })
    .then(() => mongoose.connection.close())
    .then(() => {
      console.log("[seed] Database seeding completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[seed] Failed:", err);
      process.exit(1);
    });
}
