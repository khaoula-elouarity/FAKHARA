import ApiError from "./ApiError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/;

export function readString(value, field, options = {}) {
  const {
    required = true,
    min = required ? 1 : 0,
    max = 5000,
    fallback = "",
    // Passwords must be compared exactly as typed. Trimming them would make
    // it impossible to use a legitimate password with leading/trailing spaces.
    trim = true,
  } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw ApiError.badRequest(`invalid_${field}`, {
        field,
        message: `${field} is required`,
      });
    }

    return fallback;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} must be a string`,
    });
  }

  const normalized = trim ? value.trim() : value;

  if (required && normalized.length < min) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} is required`,
    });
  }

  if (normalized.length > max) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} is too long`,
    });
  }

  return normalized;
}

export function readEmail(value, field = "email", { required = true } = {}) {
  const email = readString(value, field, { required, max: 254 });

  if (!email && !required) {
    return "";
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: "Invalid email address",
    });
  }

  return email.toLowerCase();
}

export function readPhone(value, required = true) {
  const phone = readString(value, "phone", { required, max: 20 });

  if (!phone && !required) {
    return "";
  }

  if (!PHONE_PATTERN.test(phone)) {
    throw ApiError.badRequest("invalid_phone", {
      field: "phone",
      message: "Invalid phone number",
    });
  }

  return phone;
}

export function readNumber(value, field, options = {}) {
  const { required = true, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } =
    options;

  if (value === undefined || value === null || value === "") {
    if (required) {
      throw ApiError.badRequest(`invalid_${field}`, {
        field,
        message: `${field} is required`,
      });
    }

    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} is invalid`,
    });
  }

  return number;
}

export function readLocalized(value, field, { required = false } = {}) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {
    ar: readString(source.ar, `${field}.ar`, {
      required: false,
      max: 20000,
    }),
    fr: readString(source.fr, `${field}.fr`, {
      required: false,
      max: 20000,
    }),
    en: readString(source.en, `${field}.en`, {
      required: false,
      max: 20000,
    }),
  };

  if (required && !result.ar && !result.fr && !result.en) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} is required`,
    });
  }

  return result;
}

export function readBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1" || value === 1) {
    return true;
  }

  if (value === "false" || value === "0" || value === 0) {
    return false;
  }

  return fallback;
}

export function readStringArray(value, field, maxItems = 100) {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} must be an array`,
    });
  }

  if (value.length > maxItems) {
    throw ApiError.badRequest(`invalid_${field}`, {
      field,
      message: `${field} has too many items`,
    });
  }

  return value;
}
