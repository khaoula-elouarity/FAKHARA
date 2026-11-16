import { Router } from "express";

import {
  createContactMessage,
} from "../controllers/contactController.js";
import { writeLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.post("/", writeLimiter, createContactMessage);

export default router;
