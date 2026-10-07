import { adminListReturns, adminUpdateReturn } from "../controllers/adminController.js";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getOverview,
  adminListExams, adminCreateExam, adminUpdateExam, adminDeleteExam,
  adminListResources, adminCreateResource, adminDeleteResource,
  adminListProducts, adminCreateProduct, adminDeleteProduct,
  adminListUsers, adminSetUserRole, adminDeleteUser,
  adminListMentors, adminCreateMentor, adminAssignMentor,
  adminListOrders, adminSetOrderStatus,
} from "../controllers/adminController.js";

const router = Router();
router.use(protect, adminOnly);

router.get("/overview", asyncHandler(getOverview));

router.get("/exams", asyncHandler(adminListExams));
router.post("/exams", asyncHandler(adminCreateExam));
router.patch("/exams/:slug", asyncHandler(adminUpdateExam));
router.delete("/exams/:slug", asyncHandler(adminDeleteExam));

router.get("/resources", asyncHandler(adminListResources));
router.post("/resources", asyncHandler(adminCreateResource));
router.delete("/resources/:id", asyncHandler(adminDeleteResource));

router.get("/products", asyncHandler(adminListProducts));
router.post("/products", asyncHandler(adminCreateProduct));
router.delete("/products/:id", asyncHandler(adminDeleteProduct));

router.get("/users", asyncHandler(adminListUsers));
router.patch("/users/:id/role", asyncHandler(adminSetUserRole));
router.delete("/users/:id", asyncHandler(adminDeleteUser));

router.get("/mentors", asyncHandler(adminListMentors));
router.post("/mentors", asyncHandler(adminCreateMentor));
router.post("/assign-mentor", asyncHandler(adminAssignMentor));

router.get("/returns", asyncHandler(adminListReturns));
router.patch("/returns/:id", asyncHandler(adminUpdateReturn));
router.get("/orders", asyncHandler(adminListOrders));
router.patch("/orders/:id/status", asyncHandler(adminSetOrderStatus));

export default router;
