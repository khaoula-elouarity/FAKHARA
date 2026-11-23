import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

import multer from "multer";

import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";
import { uploadsDir } from "../utils/uploads.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

const diskStorage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    mkdirSync(uploadsDir, { recursive: true });
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension =
      MIME_EXTENSIONS.get(file.mimetype) ||
      path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const uploader = multer({
  // Production forwards the image bytes to durable object storage. Local disk
  // storage remains available for development only.
  storage: env.nodeEnv === "production" ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!MIME_EXTENSIONS.has(file.mimetype)) {
      callback(
        ApiError.badRequest("invalid_image_type", {
          allowed: [...MIME_EXTENSIONS.keys()],
        })
      );
      return;
    }

    callback(null, true);
  },
});

/**
 * Accepts a single image in the `image` multipart field.
 * All failures are translated into clean 400 responses.
 */
export function uploadImage(request, response, next) {
  uploader.single("image")(request, response, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(
          ApiError.badRequest("image_too_large", {
            maxBytes: MAX_IMAGE_BYTES,
          })
        );
        return;
      }

      next(ApiError.badRequest("invalid_upload", { code: error.code }));
      return;
    }

    next(error instanceof ApiError ? error : ApiError.badRequest("invalid_image"));
  });
}

export default uploadImage;
