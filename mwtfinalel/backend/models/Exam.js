import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  { id: String, name: String },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    weightage: { type: String, enum: ["High", "Medium", "Low"] },
    topics: [topicSchema],
    mockTests: [{ id: String, name: String, url: String }],
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    chapters: [chapterSchema],
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    name: String,
    category: { type: String, index: true },
    authority: String,
    description: String,
    eligibility: String,
    officialUrl: String,
    applicationUrl: String,
    sourceVerifiedAt: String,

    timeline: {
      notification: String,
      registrationStart: String,
      registrationEnd: String,
      correction: String,
      admitCard: String,
      examDate: String,
      answerKey: String,
      result: String,
    },

    applicationProcedure: [String],

    examPattern: {
      subjectsCovered: [String],
      sections: [String],
      questionType: String,
      duration: String,
      marking: String,
      mode: String,
    },

    dressCode: [String],

    updatesNote: {
      type: String,
      default: "Check the official examination authority portal for the latest notification.",
    },

    subjects: [subjectSchema],
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
