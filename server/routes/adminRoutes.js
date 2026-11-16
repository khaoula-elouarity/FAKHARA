import { Router } from "express";

import {
  createAdmin,
  login,
  logout,
  me,
} from "../controllers/authController.js";
import {
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import {
  deleteCustomizationRequest,
  listCustomizationRequests,
  updateCustomizationStatus,
} from "../controllers/customizationController.js";
import {
  createProduct,
  deleteProduct,
  listAdminProducts,
  updateProduct,
} from "../controllers/productController.js";
import {
  deleteOrder,
  getCustomer,
  getOrder,
  listCustomers,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { getDashboardStats } from "../controllers/adminController.js";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/settingsController.js";
import { uploadProductImage } from "../controllers/uploadController.js";
import { loginLimiter } from "../middleware/rateLimits.js";
import { uploadImage } from "../middleware/upload.js";
import {
  authorize,
  protectAdmin,
  requireAnyPermission,
  requirePermission,
} from "../middleware/auth.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);

// Every route below requires a valid administrator session.
router.use(protectAdmin);

router.get("/me", me);

// Public storefront settings are editable by any authenticated administrator.
router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

router.post("/admins", authorize("superadmin"), createAdmin);

router.get("/stats", requirePermission("orders:read"), getDashboardStats);

// Shared image upload for products and categories. Files are validated,
// renamed and stored under server/data/uploads (never inside the client).
router.post(
  "/uploads",
  requireAnyPermission("products:write", "categories:write"),
  uploadImage,
  uploadProductImage
);

router.get("/products", requirePermission("products:read"), listAdminProducts);
router.post("/products", requirePermission("products:write"), createProduct);
router.put(
  "/products/:productId",
  requirePermission("products:write"),
  updateProduct
);
router.delete(
  "/products/:productId",
  requirePermission("products:write"),
  deleteProduct
);

router.get(
  "/categories",
  requirePermission("categories:read"),
  listCategories
);
router.post(
  "/categories",
  requirePermission("categories:write"),
  createCategory
);
router.put(
  "/categories/:categoryId",
  requirePermission("categories:write"),
  updateCategory
);
router.delete(
  "/categories/:categoryId",
  requirePermission("categories:write"),
  deleteCategory
);

router.get("/orders", requirePermission("orders:read"), listOrders);
router.get("/orders/:orderId", requirePermission("orders:read"), getOrder);
router.patch(
  "/orders/:orderId/status",
  requirePermission("orders:write"),
  updateOrderStatus
);
router.delete(
  "/orders/:orderId",
  requirePermission("orders:write"),
  deleteOrder
);

router.get("/customers", requirePermission("customers:read"), listCustomers);
router.get(
  "/customers/:customerId",
  requirePermission("customers:read"),
  getCustomer
);

router.get(
  "/contacts",
  requirePermission("contacts:read"),
  listContactMessages
);
router.patch(
  "/contacts/:messageId/status",
  requirePermission("contacts:write"),
  updateContactStatus
);
router.delete(
  "/contacts/:messageId",
  requirePermission("contacts:write"),
  deleteContactMessage
);

router.get(
  "/customizations",
  requirePermission("customizations:read"),
  listCustomizationRequests
);
router.patch(
  "/customizations/:requestId/status",
  requirePermission("customizations:write"),
  updateCustomizationStatus
);
router.delete(
  "/customizations/:requestId",
  requirePermission("customizations:write"),
  deleteCustomizationRequest
);

export default router;
