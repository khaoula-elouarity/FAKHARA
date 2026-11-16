import { Router } from "express";

import {
  createCustomizationRequest,
} from "../controllers/customizationController.js";
import { writeLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.post("/", writeLimiter, createCustomizationRequest);

export default router;
