import { unlink } from "node:fs";
import path from "node:path";

import env from "../config/env.js";
import { deleteCloudinaryImage } from "./cloudinary.js";

export const uploadsDir = path.join(env.dataDir, "uploads");

export function isUploadedImage(url) {
  return (
    typeof url === "string" &&
    (url.startsWith("/uploads/") ||
      url.startsWith(
        `https://res.cloudinary.com/${env.cloudinary.cloudName}/image/upload/`
      ))
  );
}

/**
 * Best-effort removal of an image previously uploaded through the admin API.
 * Only generated files inside the uploads directory can be removed; external
 * URLs and path traversal attempts are ignored.
 */
export async function removeUploadedImage(url) {
  if (!isUploadedImage(url)) {
    return;
  }

  if (url.startsWith("https://res.cloudinary.com/")) {
    try {
      await deleteCloudinaryImage(url);
    } catch {
      // Keep database edits successful when the storage provider is
      // temporarily unavailable. Orphaned files can be cleaned up later.
      console.warn("Could not remove an image from Cloudinary.");
    }
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

export async function removeUploadedImages(urls) {
  await Promise.all(
    [...new Set(urls.filter(Boolean))].map((url) => removeUploadedImage(url))
  );
}
