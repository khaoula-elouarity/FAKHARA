import env from "../config/env.js";

export function calculateDeliveryFee(city) {
  const normalized = String(city || "")
    .trim()
    .toLowerCase();

  const entry = Object.entries(env.deliveryDefaults).find(
    ([name]) => name.trim().toLowerCase() === normalized
  );

  return entry ? entry[1] : env.deliveryDefaults.Other;
}

export default calculateDeliveryFee;
