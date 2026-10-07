import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { checkout, listOrders, getOrder, advanceOrder } from "../controllers/orderController.js";

const router = Router();
router.use(protect);
router.post("/checkout", asyncHandler(checkout));
router.get("/", asyncHandler(listOrders));
router.get("/:id", asyncHandler(getOrder));
router.post("/:id/advance", asyncHandler(advanceOrder));

export default router;
