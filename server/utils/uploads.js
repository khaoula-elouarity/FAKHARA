import { mkdirSync, unlink } from "node:fs";
import path from "node:path";

import env from "../config/env.js";

export const uploadsDir = path.join(env.dataDir, "uploads");

mkdirSync(uploadsDir, { recursive: true });

export function isUploadedImage(url) {
  return typeof url === "string" && url.startsWith("/uploads/");
}

/**
 * Best-effort removal of an image previously uploaded through the admin API.
 * Only generated files inside the uploads directory can be removed; external
 * URLs and path traversal attempts are ignored.
 */
export function removeUploadedImage(url) {
  if (!isUploadedImage(url)) {
    return;
  }

  const fileName = path.basename(url);

  if (!fileName || fileName === "." || fileName === "..") {
    return;
  }

  const filePath = path.join(uploadsDir, fileName);

  if (path.dirname(filePath) !== uploadsDir) {
    return;
  }

  unlink(filePath, () => {
    // The file may already be gone; nothing else to do.
  });
}

export function removeUploadedImages(urls) {
  for (const url of new Set(urls.filter(Boolean))) {
    removeUploadedImage(url);
  }
}
