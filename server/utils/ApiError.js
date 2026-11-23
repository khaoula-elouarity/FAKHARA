export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  static badRequest(message = "bad_request", details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "not_found") {
    return new ApiError(404, message);
  }

  static conflict(message = "conflict", details = null) {
    return new ApiError(409, message, details);
  }

  static serviceUnavailable(message = "service_unavailable", details = null) {
    return new ApiError(503, message, details);
  }
}

export default ApiError;
