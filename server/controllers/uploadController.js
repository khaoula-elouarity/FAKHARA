import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadProductImage = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw ApiError.badRequest("image_required");
  }

  const storedImage =
    env.nodeEnv === "production"
      ? await uploadImageToCloudinary(request.file).catch((error) => {
          console.error("Product image upload failed:", error?.message || error);
          throw new ApiError(503, "image_storage_unavailable");
        })
      : {
          url: `/uploads/${request.file.filename}`,
          fileName: request.file.filename,
          mimeType: request.file.mimetype,
          size: request.file.size,
        };

  response.status(201).json({
    success: true,
    image: storedImage,
  });
});
