import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

export function notFoundHandler(request, response) {
  if (request.path.startsWith("/api")) {
    response.status(404).json({
      success: false,
      error: "not_found",
      message: "API route not found.",
    });
    return;
  }

  response.status(404).json({
    success: false,
    error: "not_found",
    message: "Resource not found.",
  });
}

export function errorHandler(error, request, response, _next) {
  if (response.headersSent) {
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.status).json({
      success: false,
      error: error.message,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error?.name === "ValidationError") {
    response.status(400).json({
      success: false,
      error: "validation_error",
      message: "The submitted data is invalid.",
      details: Object.values(error.errors || {}).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    });
    return;
  }

  if (error?.code === 11000) {
    response.status(409).json({
      success: false,
      error: "duplicate_record",
      message: "A record with this identifier already exists.",
      details: error.keyValue || null,
    });
    return;
  }

  if (error?.name === "CastError") {
    response.status(400).json({
      success: false,
      error: "invalid_identifier",
      message: "The provided identifier is invalid.",
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      success: false,
      error: "invalid_json",
      message: "The request body contains invalid JSON.",
    });
    return;
  }

  console.error("Unhandled API error:", error);

  response.status(500).json({
    success: false,
    error: "internal_error",
    message: "An unexpected server error occurred.",
    ...(env.nodeEnv === "development" && error.message
      ? { details: error.message }
      : {}),
  });
}

export default errorHandler;
