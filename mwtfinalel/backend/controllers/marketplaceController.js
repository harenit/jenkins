import { Product, Order } from "../models/catalogModels.js";
import { ReturnRequest } from "../models/commerceModels.js";
import User from "../models/User.js";

// GET /api/marketplace/products?examSlug=&subjectName=&category=&search=
export async function listProducts(req, res) {
  const { examSlug, subjectName, category, search = "" } = req.query;
  const filter = { isDonation: { $ne: true } };
  if (examSlug) filter.examSlug = examSlug;
  if (subjectName) filter.subjectName = subjectName;
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };

  const products = await Product.find(filter).limit(300).sort({ createdAt: -1 });
  res.json({ products });
}

// GET /api/marketplace/donations
export async function listDonatedProducts(req, res) {
  const { search = "", examSlug } = req.query;
  const filter = {
    $or: [
      { isDonation: true },
      { price: 0 },
    ],
    stock: { $gt: 0 },
    claimedBy: null,
  };
  if (examSlug) filter.examSlug = examSlug;
  if (search) filter.title = { $regex: search, $options: "i" };

  const donations = await Product.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ donations });
}

// POST /api/marketplace/products  (student "Sell a Book" listing)
export async function createUserListing(req, res) {
  const { examSlug, subjectName, title, description, category, price, condition } = req.body || {};
  if (!title || price === undefined) return res.status(400).json({ message: "title and price are required." });

  const product = await Product.create({
    examSlug: examSlug || "",
    subjectName: subjectName || "",
    title,
    description: description || "",
    category: category || "Resale",
    condition: condition || "Gently Used",
    price: Number(price),
    rating: 0,
    reviewsCount: 0,
    stock: 1,
    source: "user",
    listedBy: req.user.name,
    seller: req.user._id,
  });
  res.status(201).json({ product });
}

// GET /api/marketplace/my-listings
export async function listMyListings(req, res) {
  const listings = await Product.find({
    $or: [{ seller: req.user._id }, { listedBy: req.user.name }],
    isDonation: { $ne: true },
  }).sort({ createdAt: -1 });

  res.json({ listings });
}

// GET /api/marketplace/my-donations
export async function listMyDonations(req, res) {
  const [returnDonations, productDonations] = await Promise.all([
    ReturnRequest.find({ user: req.user._id, type: "donate" })
      .populate("assignedDeliveryPartner", "name phone studentId")
      .sort({ createdAt: -1 }),
    Product.find({
      $or: [{ donor: req.user._id }, { listedBy: req.user.name, isDonation: true }],
    })
      .populate("claimedBy", "name studentId")
      .sort({ createdAt: -1 }),
  ]);

  res.json({ returnDonations, productDonations });
}

// POST /api/marketplace/donations/:id/claim  (claim a free donated book)
export async function claimDonatedProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product || (!product.isDonation && product.price > 0)) {
    return res.status(404).json({ message: "Donated book not found." });
  }
  if (product.stock <= 0 || product.claimedBy) {
    return res.status(400).json({ message: "This donated book has already been claimed by another aspirant." });
  }

  const { deliveryAddress } = req.body || {};
  const finalAddress = deliveryAddress || req.user.address || "Campus / Hostel Address";

  // Assign delivery partner
  const deliveryPartner = await User.findOne({ role: "delivery" });

  const randomTracking = `PC-DON-${Date.now().toString(36).toUpperCase()}`;

  // Create ₹0 order for the claiming student
  const order = await Order.create({
    user: req.user._id,
    items: [{ product: product._id, title: product.title, price: 0, quantity: 1 }],
    total: 0,
    paymentMethod: "Free Student Donation (PrepCycle Care)",
    paymentStatus: "paid",
    status: "Confirmed",
    carrier: "PrepCycle Free Student Logistics",
    trackingId: randomTracking,
    eta: "3-4 Business Days",
    deliveryAddress: finalAddress,
    deliveryPartner: deliveryPartner?._id || null,
    deliveryPartnerName: deliveryPartner?.name || "PrepCycle Volunteer Courier",
    deliveryPartnerId: deliveryPartner?.studentId || "DON-SUPPORT",
    timeline: [
      { status: "Confirmed", at: new Date() },
      { status: "Dispatched from Hub", at: new Date() },
    ],
  });

  // Mark product claimed
  product.stock = 0;
  product.claimedBy = req.user._id;
  await product.save();

  res.status(201).json({
    message: "Congratulations! You have successfully claimed this book for free.",
    order,
    product,
  });
}

export async function getCart(req, res) {
  const user = req.user;
  const cart = user.cart || [];
  const products = await Product.find({ _id: { $in: cart.map((c) => c.product) } });
  const productById = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  const items = cart
    .filter((c) => productById[c.product.toString()])
    .map((c) => {
      const product = productById[c.product.toString()];
      return {
        product: { id: product._id, title: product.title, price: product.price },
        quantity: c.quantity,
        subtotal: product.price * c.quantity,
      };
    });

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  res.json({ items, total });
}

// POST /api/marketplace/cart  Body: { productId, quantity }
export async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body || {};
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const user = req.user;
  user.cart = user.cart || [];
  const existing = user.cart.find((c) => c.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }
  await user.save();
  res.status(201).json({ message: "Added to cart." });
}

// PATCH /api/marketplace/cart/:productId  Body: { quantity }
export async function updateCartItem(req, res) {
  const { quantity } = req.body || {};
  const user = req.user;
  user.cart = user.cart || [];
  const item = user.cart.find((c) => c.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not in cart." });

  if (quantity <= 0) {
    user.cart = user.cart.filter((c) => c.product.toString() !== req.params.productId);
  } else {
    item.quantity = quantity;
  }
  await user.save();
  res.json({ message: "Cart updated." });
}

// DELETE /api/marketplace/cart/:productId
export async function removeFromCart(req, res) {
  const user = req.user;
  user.cart = (user.cart || []).filter((c) => c.product.toString() !== req.params.productId);
  await user.save();
  res.json({ message: "Removed from cart." });
}
