import { createHash } from "node:crypto";

import env, { requireCloudinaryConfig } from "../config/env.js";

function signParameters(parameters) {
  const values = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${values}${env.cloudinary.apiSecret}`)
    .digest("hex");
}

async function cloudinaryRequest(action, parameters, file) {
  requireCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParameters = { ...parameters, timestamp };
  const form = new FormData();

  for (const [key, value] of Object.entries(signedParameters)) {
    form.append(key, String(value));
  }
  form.append("api_key", env.cloudinary.apiKey);
  form.append("signature", signParameters(signedParameters));

  if (file) {
    form.append(
      "file",
      new Blob([file.buffer], { type: file.mimetype }),
      file.originalname || "product-image"
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudinary.cloudName)}/image/${action}`;
  const response = await fetch(endpoint, { method: "POST", body: form });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Cloudinary request failed with status ${response.status}.`);
  }

  return payload;
}

export async function uploadImageToCloudinary(file) {
  const payload = await cloudinaryRequest(
    "upload",
    { folder: "fakhara" },
    file
  );

  if (!payload?.secure_url || !payload?.public_id) {
    throw new Error("Cloudinary returned an incomplete upload result.");
  }

  return {
    url: payload.secure_url,
    fileName: payload.public_id.split("/").at(-1),
    publicId: payload.public_id,
    size: payload.bytes,
    mimeType: file.mimetype,
  };
}

function getCloudinaryPublicId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") {
      return "";
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex(
      (part, index) => part === "upload" && parts[index - 1] === "image"
    );
    if (uploadIndex === -1) {
      return "";
    }

    const publicParts = parts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(publicParts[0] || "")) {
      publicParts.shift();
    }
    const last = publicParts.at(-1) || "";
    publicParts[publicParts.length - 1] = last.replace(/\.[^.]+$/, "");
    return publicParts.join("/");
  } catch {
    return "";
  }
}

export async function deleteCloudinaryImage(url) {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) {
    return false;
  }

  const result = await cloudinaryRequest("destroy", { public_id: publicId });
  return result?.result === "ok" || result?.result === "not found";
}
