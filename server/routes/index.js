import { Router } from "express";
import mongoose from "mongoose";

import adminRoutes from "./adminRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import contactRoutes from "./contactRoutes.js";
import customizationRoutes from "./customizationRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import orderRoutes from "./orderRoutes.js";
import productRoutes from "./productRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import userRoutes from "./userRoutes.js";
import { attachUser } from "../middleware/userAuth.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({
    success: true,
    service: "FAKHARA API",
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Resolves the signed-in customer (when there is one) for routes that accept
// both guests and registered customers.
router.use(attachUser);

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/settings", settingsRoutes);
router.use("/orders", orderRoutes);
router.use("/contact", contactRoutes);
router.use("/customizations", customizationRoutes);
router.use("/ratings", reviewRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);

export default router;
