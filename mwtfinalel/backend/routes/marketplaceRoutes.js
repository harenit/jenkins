import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import {
  listProducts,
  listDonatedProducts,
  claimDonatedProduct,
  listMyListings,
  listMyDonations,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  createUserListing,
} from "../controllers/marketplaceController.js";

const router = Router();

router.get("/products", asyncHandler(listProducts));
router.get("/donations", asyncHandler(listDonatedProducts));
router.post("/donations/:id/claim", protect, asyncHandler(claimDonatedProduct));
router.get("/my-listings", protect, asyncHandler(listMyListings));
router.get("/my-donations", protect, asyncHandler(listMyDonations));
router.post("/products", protect, asyncHandler(createUserListing));
router.get("/cart", protect, asyncHandler(getCart));
router.post("/cart", protect, asyncHandler(addToCart));
router.patch("/cart/:productId", protect, asyncHandler(updateCartItem));
router.delete("/cart/:productId", protect, asyncHandler(removeFromCart));

export default router;
