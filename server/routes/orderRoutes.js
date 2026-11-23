import { Router } from "express";

import {
  confirmOrderReceipt,
  createOrder,
  trackOrder,
} from "../controllers/orderController.js";
import {
  trackingLimiter,
  writeLimiter,
} from "../middleware/rateLimits.js";

const router = Router();

router.post("/track", trackingLimiter, trackOrder);
router.post("/confirm-receipt", trackingLimiter, confirmOrderReceipt);
router.post("/", writeLimiter, createOrder);

export default router;
