import Order from "../models/Order.js";

export async function generateOrderNumber() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const digits = String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0"
    );
    const orderNumber = `FK-${digits}`;
    const exists = await Order.exists({ orderNumber });

    if (!exists) {
      return orderNumber;
    }
  }

  const suffix = String(Date.now()).slice(-6);
  return `FK-${suffix}`;
}

export default generateOrderNumber;
