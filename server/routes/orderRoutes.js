import { Router } from "express";

import { createOrder } from "../controllers/orderController.js";
import { writeLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.post("/", writeLimiter, createOrder);

export default router;
