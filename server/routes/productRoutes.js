import { Router } from "express";

import {
  getProduct,
  listProducts,
  searchProducts,
} from "../controllers/productController.js";

const router = Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/:productId", getProduct);

export default router;
