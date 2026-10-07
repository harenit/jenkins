import mongoose from "mongoose";

/* ---------- Flashcard ---------- */
const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = built-in
    examSlug: { type: String, index: true },
    subjectName: String,
    question: String,
    answer: String,
    source: { type: String, enum: ["built-in", "user", "generated"], default: "user" },
  },
  { timestamps: true }
);
export const Flashcard = mongoose.model("Flashcard", flashcardSchema);

/* ---------- Note ---------- */
const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: String,
    content: String,
  },
  { timestamps: true }
);
export const Note = mongoose.model("Note", noteSchema);

/* ---------- Resource ---------- */
const resourceSchema = new mongoose.Schema(
  {
    examSlug: { type: String, index: true },
    subjectName: String,
    type: { type: String, enum: ["pdf", "video", "notes", "ebook", "practice"] },
    title: String,
    description: String,
    url: String,
    source: { type: String, enum: ["catalog", "user"], default: "catalog" },
    sharedBy: { type: String, default: null }, // name of the student who shared it, for peer "Share a PDF" uploads
  },
  { timestamps: true }
);
export const Resource = mongoose.model("Resource", resourceSchema);

/* ---------- Product (marketplace) ---------- */
const productSchema = new mongoose.Schema(
  {
    examSlug: { type: String, index: true },
    subjectName: String,
    title: String,
    description: String,
    category: String,
    price: Number,
    rating: Number,
    reviewsCount: Number,
    stock: { type: Number, default: 25 },
    source: { type: String, enum: ["catalog", "user", "donation"], default: "catalog" },
    listedBy: { type: String, default: null }, // name of the student who listed it, for peer "Sell a Book" listings
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    condition: { type: String, default: "Good" },
    isDonation: { type: Boolean, default: false },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);
export const Product = mongoose.model("Product", productSchema);

/* ---------- Order ---------- */
const ORDER_STAGES = ["Confirmed", "Packed", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: Number,
    paymentMethod: { type: String, default: "Card" },
    paymentStatus: { type: String, enum: ["paid", "pending"], default: "paid" },
    status: { type: String, enum: ORDER_STAGES, default: "Confirmed" },
    carrier: { type: String, default: "PrepCycle Logistics" },
    trackingId: String,
    eta: String,
    deliveryAddress: String,
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryPartnerName: { type: String, default: "Ramesh Kumar (PrepCycle Logistics)" },
    deliveryPartnerId: { type: String, default: "" },
    deliveryPartnerPhone: { type: String, default: "+91 98765 43210" },
    deliveryPartnerVehicle: { type: String, default: "TN 09 BX 4521 (Electric Van)" },
    verificationOtp: { type: String, default: "" },
    timeline: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
export const Order = mongoose.model("Order", orderSchema);
export { ORDER_STAGES };

/* ---------- Discussion (community) ---------- */
const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
    body: String,
    votes: { type: Number, default: 0 },
    isBest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
    examSlug: String,
    title: String,
    body: String,
    votes: { type: Number, default: 0 },
    replies: [replySchema],
  },
  { timestamps: true }
);
export const Discussion = mongoose.model("Discussion", discussionSchema);
