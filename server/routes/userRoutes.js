import { Router } from "express";

import {
  createAddress,
  deleteAddress,
  forgotPassword,
  getMyOrder,
  listAddresses,
  listMyOrders,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateAddress,
  updateProfile,
} from "../controllers/userController.js";
import { loginLimiter, writeLimiter } from "../middleware/rateLimits.js";
import { protectUser } from "../middleware/userAuth.js";

const router = Router();

router.post("/register", writeLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", loginLimiter, forgotPassword);
router.post("/reset-password", loginLimiter, resetPassword);

router.get("/me", protectUser, me);
router.patch("/me", protectUser, updateProfile);
router.get("/orders", protectUser, listMyOrders);
router.get("/orders/:orderId", protectUser, getMyOrder);
router.get("/addresses", protectUser, listAddresses);
router.post("/addresses", protectUser, createAddress);
router.patch("/addresses/:addressId", protectUser, updateAddress);
router.delete("/addresses/:addressId", protectUser, deleteAddress);

export default router;
