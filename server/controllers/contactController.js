import ContactMessage, {
  CONTACT_STATUSES,
} from "../models/ContactMessage.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  readEmail,
  readPhone,
  readString,
} from "../utils/validation.js";

export const createContactMessage = asyncHandler(
  async (request, response) => {
    const contactMessage = new ContactMessage({
      name: readString(request.body?.name, "name", { max: 120 }),
      email: readEmail(request.body?.email),
      phone: readPhone(request.body?.phone, false),
      subject: readString(request.body?.subject, "subject", { max: 200 }),
      message: readString(request.body?.message, "message", { max: 4000 }),
      status: "new",
    });

    await contactMessage.save();

    response.status(201).json({
      success: true,
      messageId: contactMessage.id,
      createdAt: contactMessage.createdAt,
    });
  }
);

export const listContactMessages = asyncHandler(
  async (request, response) => {
    const filter = {};

    if (request.query.status) {
      const status = String(request.query.status);

      if (!CONTACT_STATUSES.includes(status)) {
        throw ApiError.badRequest("invalid_status");
      }

      filter.status = status;
    }

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);

    response.json({
      success: true,
      messages: messages.map((message) => message.toJSON()),
    });
  }
);

export const updateContactStatus = asyncHandler(
  async (request, response) => {
    const status = readString(request.body?.status, "status", {
      max: 30,
    });

    if (!CONTACT_STATUSES.includes(status)) {
      throw ApiError.badRequest("invalid_status", {
        allowed: CONTACT_STATUSES,
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      request.params.messageId,
      { $set: { status } },
      { returnDocument: "after", runValidators: true }
    );

    if (!message) {
      throw ApiError.notFound("contact_message_not_found");
    }

    response.json({
      success: true,
      message: message.toJSON(),
    });
  }
);

export const deleteContactMessage = asyncHandler(
  async (request, response) => {
    const message = await ContactMessage.findByIdAndDelete(
      request.params.messageId
    );

    if (!message) {
      throw ApiError.notFound("contact_message_not_found");
    }

    response.json({
      success: true,
      deletedMessageId: String(message._id),
    });
  }
);
