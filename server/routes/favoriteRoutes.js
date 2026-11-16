import { Router } from "express";

import {
  addFavorite,
  listFavorites,
  removeFavorite,
} from "../controllers/favoriteController.js";
import { writeLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.get("/", listFavorites);
router.post("/:productId", writeLimiter, addFavorite);
router.delete("/:productId", writeLimiter, removeFavorite);

export default router;
