import CustomizationRequest, {
  CUSTOMIZATION_STATUSES,
} from "../models/CustomizationRequest.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  readEmail,
  readNumber,
  readPhone,
  readString,
} from "../utils/validation.js";

export const createCustomizationRequest = asyncHandler(
  async (request, response) => {
    const language = ["ar", "fr", "en"].includes(request.body?.language)
      ? request.body.language
      : "ar";

    const productName = readString(request.body?.product, "product", { max: 160 });
    const product = await Product.findOne({
      $or: [{ productId: productName }, { "name.en": productName }],
    }).select("_id");

    const customizationRequest = new CustomizationRequest({
      product: productName,
      productRef: product?._id || null,
      color: readString(request.body?.color, "color", { max: 160 }),
      decoration: readString(request.body?.decoration, "decoration", {
        max: 160,
      }),
      customText: readString(request.body?.customText, "customText", {
        required: false,
        max: 200,
      }),
      notes: readString(request.body?.notes, "notes", {
        required: false,
        max: 2000,
      }),
      quantity: readNumber(request.body?.quantity, "quantity", {
        required: false,
        min: 1,
        max: 50,
        fallback: 1,
      }),
      language,
      customer: {
        fullName: readString(request.body?.customer?.fullName ?? request.body?.fullName, "customer.fullName", {
          required: false,
          max: 120,
        }),
        email: readEmail(
          request.body?.customer?.email ?? request.body?.email,
          "customer.email",
          { required: false }
        ),
        phone: readPhone(
          request.body?.customer?.phone ?? request.body?.phone,
          false
        ),
      },
      user: request.user?._id || null,
      referenceImage: readString(request.body?.referenceImage, "referenceImage", {
        required: false,
        max: 500,
      }),
      status: "pending",
    });

    await customizationRequest.save();

    response.status(201).json({
      success: true,
      request: customizationRequest.toJSON(),
    });
  }
);

export const listCustomizationRequests = asyncHandler(
  async (request, response) => {
    const filter = {};

    if (request.query.status) {
      const status = String(request.query.status);

      if (!CUSTOMIZATION_STATUSES.includes(status)) {
        throw ApiError.badRequest("invalid_status");
      }

      filter.status = status;
    }

    const requests = await CustomizationRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);

    response.json({
      success: true,
      requests: requests.map((item) => item.toJSON()),
    });
  }
);

export const updateCustomizationStatus = asyncHandler(
  async (request, response) => {
    const status = readString(request.body?.status, "status", {
      max: 30,
    });

    if (!CUSTOMIZATION_STATUSES.includes(status)) {
      throw ApiError.badRequest("invalid_status", {
        allowed: CUSTOMIZATION_STATUSES,
      });
    }

    const customizationRequest =
      await CustomizationRequest.findByIdAndUpdate(
        request.params.requestId,
        { $set: { status } },
        { returnDocument: "after", runValidators: true }
      );

    if (!customizationRequest) {
      throw ApiError.notFound("customization_request_not_found");
    }

    response.json({
      success: true,
      request: customizationRequest.toJSON(),
    });
  }
);

export const deleteCustomizationRequest = asyncHandler(
  async (request, response) => {
    const customizationRequest =
      await CustomizationRequest.findByIdAndDelete(
        request.params.requestId
      );

    if (!customizationRequest) {
      throw ApiError.notFound("customization_request_not_found");
    }

    response.json({
      success: true,
      deletedRequestId: String(customizationRequest._id),
    });
  }
);
