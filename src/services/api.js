import { buildApiUrl } from "./apiConfig.js";

export class ApiRequestError extends Error {
  constructor(code, status = 0, details = null) {
    super(code);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(
  path,
  { method = "GET", body, headers = {}, signal } = {}
) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      method,
      credentials: "include",
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiRequestError("network_error");
  }

  // The API answers in JSON, but a dev proxy or a reverse proxy can return an
  // HTML error page when the backend is unreachable. Read the body safely so
  // the user gets an accurate error instead of a confusing parse failure.
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const code =
      payload?.error ||
      (response.status === 429
        ? "rate_limit_exceeded"
        : response.status >= 500
          ? "server_error"
          : "request_failed");

    throw new ApiRequestError(
      code,
      response.status,
      payload?.details || null
    );
  }

  return payload;
}

function queryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const value = search.toString();
  return value ? `?${value}` : "";
}

export function fetchProducts(params, options) {
  return request(`/api/products${queryString(params)}`, {
    admin: false,
    ...options,
  });
}

export function searchProducts(query, params = {}, options) {
  return request(
    `/api/products/search${queryString({ q: query, ...params })}`,
    {
      admin: false,
      ...options,
    }
  );
}

export function fetchProduct(productId, options) {
  return request(`/api/products/${encodeURIComponent(productId)}`, {
    admin: false,
    ...options,
  });
}

export function fetchCategories(options) {
  return request("/api/categories", { admin: false, ...options });
}

export function createOrder(payload) {
  return request("/api/orders", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function trackOrder(payload) {
  return request("/api/orders/track", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function confirmOrderReceipt(payload) {
  return request("/api/orders/confirm-receipt", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function createCustomizationRequest(payload) {
  return request("/api/customizations", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function fetchFavorites(options) {
  return request("/api/favorites", { admin: false, ...options });
}

export function addFavoriteRequest(productId) {
  return request(`/api/favorites/${encodeURIComponent(productId)}`, {
    method: "POST",
    admin: false,
  });
}

export function removeFavoriteRequest(productId) {
  return request(`/api/favorites/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    admin: false,
  });
}

export function adminMe() {
  return request("/api/admin/me");
}

export function adminLogout() {
  return request("/api/admin/logout", { method: "POST" });
}

export function fetchAdminStats() {
  return request("/api/admin/stats");
}

async function uploadAdminImageTo(path, file) {
  if (!file) {
    throw new ApiRequestError("image_required");
  }

  const formData = new FormData();
  formData.append("image", file);

  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
      body: formData,
    });
  } catch {
    throw new ApiRequestError("network_error");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new ApiRequestError(
      payload?.error ||
        (response.status === 413 ? "image_too_large" : "upload_failed"),
      response.status,
      payload?.details || null
    );
  }

  return payload;
}

export function uploadAdminImage(file) {
  return uploadAdminImageTo("/api/admin/uploads", file);
}

export function uploadAdminFeaturedImage(file) {
  return uploadAdminImageTo("/api/admin/featured-section/uploads", file);
}

export function fetchAdminProducts(params) {
  return request(`/api/admin/products${queryString(params)}`);
}

export function createAdminProduct(payload) {
  return request("/api/admin/products", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminProduct(productId, payload) {
  return request(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteAdminProduct(productId) {
  return request(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export function fetchAdminCategories() {
  return request("/api/admin/categories");
}

export function createAdminCategory(payload) {
  return request("/api/admin/categories", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminCategory(slug, payload) {
  return request(`/api/admin/categories/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteAdminCategory(slug, reassignTo = "") {
  return request(`/api/admin/categories/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    body: reassignTo ? { reassignTo } : undefined,
  });
}

export function fetchAdminOrders(params) {
  return request(`/api/admin/orders${queryString(params)}`);
}

export function updateAdminOrderStatus(orderId, status) {
  return request(
    `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

export function deleteAdminOrder(orderId) {
  return request(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    method: "DELETE",
  });
}

export function fetchAdminContacts(params) {
  return request(`/api/admin/contacts${queryString(params)}`);
}

export function updateAdminContactStatus(messageId, status) {
  return request(
    `/api/admin/contacts/${encodeURIComponent(messageId)}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

export function deleteAdminContact(messageId) {
  return request(`/api/admin/contacts/${encodeURIComponent(messageId)}`, {
    method: "DELETE",
  });
}

export function fetchAdminCustomizations(params) {
  return request(`/api/admin/customizations${queryString(params)}`);
}

export function updateAdminCustomizationStatus(requestId, status) {
  return request(
    `/api/admin/customizations/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

export function deleteAdminCustomization(requestId) {
  return request(
    `/api/admin/customizations/${encodeURIComponent(requestId)}`,
    {
      method: "DELETE",
    }
  );
}

export function fetchAdminCustomers() {
  return request("/api/admin/customers");
}

export function fetchAdminCustomer(customerId) {
  return request(
    `/api/admin/customers/${encodeURIComponent(customerId)}`
  );
}

export function fetchPublicSettings(options) {
  return request("/api/settings", { admin: false, ...options });
}

export function fetchAdminSettings() {
  return request("/api/admin/settings");
}

export function updateAdminSettings(payload) {
  return request("/api/admin/settings", {
    method: "PUT",
    body: payload,
  });
}

export function updateAdminHomepage(homepage) {
  return request("/api/admin/homepage", {
    method: "PUT",
    body: { homepage },
  });
}

export function fetchAdminFeaturedSection() {
  return request("/api/admin/featured-section");
}

export function updateAdminFeaturedSection(featuredSection) {
  return request("/api/admin/featured-section", {
    method: "PUT",
    body: { featuredSection },
  });
}

export function restoreAdminFeaturedSection() {
  return request("/api/admin/featured-section/restore", {
    method: "POST",
  });
}

export function fetchAdminFeaturedItems() {
  return request("/api/admin/featured-items");
}

export function updateAdminFeaturedItems(featuredItems) {
  return request("/api/admin/featured-items", {
    method: "PUT",
    body: { featuredItems },
  });
}

export function fetchAdminDiscoveryPages() {
  return request("/api/admin/discovery-pages");
}

export function updateAdminDiscoveryPages(discoveryPages) {
  return request("/api/admin/discovery-pages", {
    method: "PUT",
    body: { discoveryPages },
  });
}

export function registerUser(payload) {
  return request("/api/users/register", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function loginUser(payload) {
  return request("/api/users/login", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function logoutUser() {
  return request("/api/users/logout", {
    method: "POST",
    admin: false,
  });
}

export function fetchCurrentUser(options) {
  return request("/api/users/me", { admin: false, ...options });
}

export function updateCurrentUser(payload, options) {
  return request("/api/users/me", {
    method: "PATCH",
    body: payload,
    admin: false,
    ...options,
  });
}

export function fetchMyOrders(options) {
  return request("/api/users/orders", { admin: false, ...options });
}

export function fetchMyOrder(orderId, options) {
  return request(`/api/users/orders/${encodeURIComponent(orderId)}`, {
    admin: false,
    ...options,
  });
}

export function requestPasswordReset(email) {
  return request("/api/users/forgot-password", {
    method: "POST",
    body: { email },
    admin: false,
  });
}

export function resetPassword(payload) {
  return request("/api/users/reset-password", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function fetchAddresses(options) {
  return request("/api/users/addresses", { admin: false, ...options });
}

export function createAddress(payload) {
  return request("/api/users/addresses", {
    method: "POST",
    body: payload,
    admin: false,
  });
}

export function updateAddress(addressId, payload) {
  return request(`/api/users/addresses/${encodeURIComponent(addressId)}`, {
    method: "PATCH",
    body: payload,
    admin: false,
  });
}

export function deleteAddress(addressId) {
  return request(`/api/users/addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
    admin: false,
  });
}
