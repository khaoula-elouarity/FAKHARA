import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadProductImage = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw ApiError.badRequest("image_required");
  }

  response.status(201).json({
    success: true,
    image: {
      url: `/uploads/${request.file.filename}`,
      fileName: request.file.filename,
      mimeType: request.file.mimetype,
      size: request.file.size,
    },
  });
});
