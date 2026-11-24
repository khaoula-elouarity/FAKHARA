import { existsSync } from "node:fs";
import path from "node:path";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import env from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import {
  apiLimiter,
} from "./middleware/rateLimits.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";
import { uploadsDir } from "./utils/uploads.js";

/**
 * In development the frontend may be opened through localhost, 127.0.0.1 or
 * ::1, and Vite can fall back to another port when the default one is busy.
 * Allowing every loopback origin avoids confusing CORS failures while still
 * keeping production locked to the explicitly configured CLIENT_URL list.
 */
function isDevelopmentLoopbackOrigin(origin) {
  if (env.nodeEnv === "production") {
    return false;
  }

  try {
    const url = new URL(origin);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (
    env.clientOrigins.includes(origin) ||
    isDevelopmentLoopbackOrigin(origin)
  ) {
    callback(null, true);
    return;
  }

  // Reject without throwing: throwing from the CORS callback turns a simple
  // origin mismatch into an opaque HTTP 500 and hides the real problem.
  if (env.nodeEnv !== "production") {
    console.warn(`Blocked request from unauthorised origin: ${origin}`);
  }

  callback(null, false);
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  if (process.env.TRUST_PROXY) {
    app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })
  );
  app.use(compression());
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    morgan(env.nodeEnv === "production" ? "combined" : "dev", {
      skip: (request) => request.path === "/api/health",
    })
  );

  app.use("/api", async (request, _response, next) => {
    if (request.path === "/health") {
      next();
      return;
    }

    try {
      await connectDatabase();
      next();
    } catch (error) {
      next(error);
    }
  });
  app.use("/api", apiLimiter, apiRoutes);
  app.use("/api", notFoundHandler);

  // Product/category images uploaded from the admin dashboard.
  if (env.nodeEnv !== "production") {
    app.use(
      "/uploads",
      express.static(uploadsDir, {
        index: false,
        maxAge: "7d",
      })
    );
    app.use("/uploads", (_request, response) => {
      response.status(404).json({
        success: false,
        error: "image_not_found",
        message: "Image not found.",
      });
    });
  }

  const distDir = path.join(env.projectDir, "dist");
  const indexFile = path.join(distDir, "index.html");

  if (existsSync(indexFile)) {
    app.use(express.static(distDir, { index: false }));
    app.use((request, response, next) => {
      if (
        request.method !== "GET" ||
        request.path.startsWith("/api") ||
        !request.accepts("html")
      ) {
        next();
        return;
      }

      response.sendFile(indexFile);
    });
  } else {
    app.get("/", (_request, response) => {
      response.json({
        success: true,
        message:
          "FAKHARA API is running. Start the React development server with npm run dev:client.",
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
