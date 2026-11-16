import { Router } from "express";

import {
  createProductReview,
  getProductReviews,
} from "../controllers/reviewController.js";
import { writeLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", writeLimiter, createProductReview);

export default router;
