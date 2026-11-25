const ORDER_TRACKING_ACCESS_KEY = "fakhara-order-tracking-eligible";

export function grantOrderTrackingAccess() {
  try {
    sessionStorage.setItem(ORDER_TRACKING_ACCESS_KEY, "true");
  } catch {
    // Keep post-order navigation usable when session storage is unavailable.
  }
}

export function hasOrderTrackingAccess() {
  try {
    return sessionStorage.getItem(ORDER_TRACKING_ACCESS_KEY) === "true";
  } catch {
    return false;
  }
}
