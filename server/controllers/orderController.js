import { createHash, timingSafeEqual } from "node:crypto";

import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import calculateDeliveryFee from "../utils/delivery.js";
import generateOrderNumber from "../utils/orderNumber.js";
import {
  readEmail,
  readNumber,
  readPhone,
  readString,
  readStringArray,
} from "../utils/validation.js";

const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

function normalizePhoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("00212")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("212") && digits.length === 12) {
    digits = `0${digits.slice(3)}`;
  }

  return digits;
}

function phoneHash(value) {
  return createHash("sha256").update(normalizePhoneDigits(value)).digest();
}

function normalizeHistoryEntry(entry) {
  return {
    status: entry.status,
    at: entry.at,
    source: entry.source || "system",
  };
}

function getStatusHistory(order) {
  const stored = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  if (stored.length > 0) {
    return [...stored]
      .sort((a, b) => new Date(a.at) - new Date(b.at))
      .map(normalizeHistoryEntry);
  }

  const createdAt = order.createdAt || order.updatedAt || new Date();
  const fallback = [
    { status: "pending", at: createdAt, source: "system" },
  ];

  if (order.status !== "pending") {
    fallback.push({
      status: order.status,
      at: order.updatedAt || createdAt,
      source: "system",
    });
  }

  return fallback;
}

function maskPhone(value) {
  const digits = normalizePhoneDigits(value);

  if (digits.length < 4) {
    return "****";
  }

  return `${"•".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

function buildTrackingOrder(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: {
      fullName: order.customer.fullName,
      city: order.customer.city,
      phone: maskPhone(order.customer.phone),
    },
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      variant: item.variant
        ? { key: item.variant.key, name: item.variant.name }
        : null,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    statusHistory: getStatusHistory(order),
    canConfirmReceipt: order.status === "out_for_delivery",
  };
}

async function findOrderForTracking(body) {
  const orderNumber = readString(body?.orderNumber, "orderNumber", {
    max: 40,
  }).toUpperCase();
  const phone = readPhone(body?.phone);
  const order = await Order.findOne({ orderNumber }).lean();
  const suppliedHash = phoneHash(phone);
  const expectedHash = order
    ? phoneHash(order.customer.phone)
    : Buffer.alloc(suppliedHash.length);

  if (!order || !timingSafeEqual(suppliedHash, expectedHash)) {
    throw ApiError.notFound("verification_failed", {
      message: "Order number and phone number do not match.",
    });
  }

  return order;
}

function normalizeCustomer(body) {
  return {
    fullName: readString(body?.fullName, "fullName", { max: 120 }),
    phone: readPhone(body?.phone),
    email: readEmail(body?.email, "email", { required: false }),
    city: readString(body?.city, "city", { max: 120 }),
    address: readString(body?.address, "address", { max: 1000 }),
    postalCode: readString(body?.postalCode, "postalCode", {
      required: false,
      max: 20,
    }),
  };
}

function normalizeItems(value) {
  const rawItems = readStringArray(value, "items", MAX_ITEMS);

  if (rawItems.length === 0) {
    throw ApiError.badRequest("order_items_required", {
      field: "items",
      message: "An order must contain at least one item.",
    });
  }

  return rawItems.map((item) => {
    const productId = readString(item?.productId ?? item?.id, "productId", {
      max: 120,
    });
    const quantity = readNumber(item?.quantity, "quantity", {
      min: 1,
      max: MAX_QUANTITY,
    });
    const variantKey = readString(
      item?.variantKey ?? item?.variant?.key,
      "variantKey",
      { required: false, max: 120 }
    );

    return { productId, quantity, variantKey };
  });
}

async function findOrCreateCustomer(customer, orderId) {
  const query = customer.email
    ? { email: customer.email }
    : { phone: customer.phone };

  let user = await User.findOne(query).select("+passwordHash");

  if (user) {
    // Never overwrite the profile of an account protected by a password.
    // Guest profiles created by an earlier checkout can still be completed.
    if (!user.passwordHash) {
      user.name = customer.fullName;
      user.phone = customer.phone;
      user.email = customer.email || user.email;
      user.city = customer.city;
      user.address = customer.address;
      user.postalCode = customer.postalCode;
    }
  } else {
    user = new User({
      name: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      address: customer.address,
      postalCode: customer.postalCode,
    });
  }

  if (orderId) {
    user.orders.addToSet(orderId);
  }

  await user.save();
  return user;
}

export const createOrder = asyncHandler(async (request, response) => {
  const customer = normalizeCustomer(request.body?.customer);
  const rawItems = normalizeItems(request.body?.items);
  const currentUser = request.user || null;

  if (currentUser && !customer.email) {
    customer.email = currentUser.email;
  }

  const productIds = [...new Set(rawItems.map((item) => item.productId))];
  const products = await Product.find({
    productId: { $in: productIds },
    isActive: true,
  });
  const productMap = new Map(
    products.map((product) => [product.productId, product])
  );

  const mergedItems = new Map();

  for (const item of rawItems) {
    const product = productMap.get(item.productId);

    if (!product) {
      throw ApiError.badRequest("product_not_available", {
        productId: item.productId,
      });
    }

    let variant = null;

    if (item.variantKey) {
      variant = product.images.find(
        (entry) => entry.key === item.variantKey
      );

      if (!variant) {
        throw ApiError.badRequest("variant_not_available", {
          productId: item.productId,
          variantKey: item.variantKey,
        });
      }
    }

    const unitPrice = variant?.price ?? product.price;
    const variantKey = variant?.key || "";
    const lineKey = `${product.productId}::${variantKey}`;
    const existing = mergedItems.get(lineKey);

    if (existing) {
      existing.quantity += item.quantity;

      if (existing.quantity > MAX_QUANTITY) {
        throw ApiError.badRequest("quantity_too_large", {
          productId: item.productId,
        });
      }
    } else {
      mergedItems.set(lineKey, {
        productId: product.productId,
        product: product._id,
        name: product.name,
        image: variant?.image || product.image || "",
        variant: variant
          ? {
              key: variant.key,
              name: variant.name,
              image: variant.image || "",
              price: variant.price ?? null,
            }
          : null,
        price: unitPrice,
        quantity: item.quantity,
      });
    }
  }

  const items = [...mergedItems.values()];
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;
  const deliveryFee = calculateDeliveryFee(customer.city);
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const orderNumber = await generateOrderNumber();

  const order = new Order({
    orderNumber,
    customer,
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: "cash_on_delivery",
    status: "pending",
    user: currentUser ? currentUser._id : null,
    statusHistory: [
      { status: "pending", at: new Date(), source: "system" },
    ],
  });

  await order.save();

  if (currentUser) {
    currentUser.orders.addToSet(order._id);
    currentUser.phone = currentUser.phone || customer.phone;
    currentUser.city = currentUser.city || customer.city;
    currentUser.address = currentUser.address || customer.address;
    currentUser.postalCode = currentUser.postalCode || customer.postalCode;
    await currentUser.save();
  } else {
    try {
      const user = await findOrCreateCustomer(customer, order._id);
      order.user = user._id;
      await order.save();
    } catch (error) {
      console.error(
        "Could not link customer profile to order:",
        error.message
      );
    }
  }

  response.status(201).json({
    success: true,
    order: order.toJSON(),
  });
});

export const listOrders = asyncHandler(async (request, response) => {
  const filter = {};

  if (request.query.status) {
    const status = String(request.query.status);

    if (!ORDER_STATUSES.includes(status)) {
      throw ApiError.badRequest("invalid_status");
    }

    filter.status = status;
  }

  if (request.query.q) {
    const search = String(request.query.q).trim();

    filter.$or = [
      { orderNumber: new RegExp(search, "i") },
      { "customer.fullName": new RegExp(search, "i") },
      { "customer.phone": new RegExp(search, "i") },
      { "customer.email": new RegExp(search, "i") },
    ];
  }

  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 50));
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  response.json({
    success: true,
    orders: orders.map((order) => order.toJSON()),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getOrder = asyncHandler(async (request, response) => {
  const order = await Order.findById(request.params.orderId);

  if (!order) {
    throw ApiError.notFound("order_not_found");
  }

  response.json({
    success: true,
    order: order.toJSON(),
  });
});

export const updateOrderStatus = asyncHandler(async (request, response) => {
  const status = readString(request.body?.status, "status", {
    max: 30,
  });

  if (!ORDER_STATUSES.includes(status)) {
    throw ApiError.badRequest("invalid_status", {
      allowed: ORDER_STATUSES,
    });
  }

  if (status === "delivered") {
    throw ApiError.conflict("delivery_confirmation_required", {
      message: "Only the customer can confirm receipt of an order.",
    });
  }

  const order = await Order.findById(request.params.orderId);

  if (!order) {
    throw ApiError.notFound("order_not_found");
  }

  if (order.status === status) {
    throw ApiError.conflict("status_unchanged");
  }

  if (order.status === "cancelled") {
    throw ApiError.conflict("invalid_status_transition");
  }

  order.status = status;
  order.statusHistory.push({
    status,
    at: new Date(),
    source: "admin",
    actor: request.admin?._id || null,
  });
  await order.save();

  response.json({
    success: true,
    order: order.toJSON(),
  });
});

export const trackOrder = asyncHandler(async (request, response) => {
  const order = await findOrderForTracking(request.body);

  response.json({
    success: true,
    order: buildTrackingOrder(order),
  });
});

export const confirmOrderReceipt = asyncHandler(async (request, response) => {
  const order = await findOrderForTracking(request.body);

  if (order.status === "delivered") {
    response.json({
      success: true,
      order: buildTrackingOrder(order),
    });
    return;
  }

  const now = new Date();
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: "out_for_delivery" },
    {
      $set: { status: "delivered" },
      $push: {
        statusHistory: {
          status: "delivered",
          at: now,
          source: "customer",
          actor: null,
        },
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedOrder) {
    const freshOrder = await Order.findById(order._id).lean();

    if (freshOrder?.status === "delivered") {
      response.json({
        success: true,
        order: buildTrackingOrder(freshOrder),
      });
      return;
    }

    throw ApiError.conflict("delivery_not_ready");
  }

  response.json({
    success: true,
    order: buildTrackingOrder(updatedOrder),
  });
});

export const deleteOrder = asyncHandler(async (request, response) => {
  const order = await Order.findByIdAndDelete(request.params.orderId);

  if (!order) {
    throw ApiError.notFound("order_not_found");
  }

  await User.updateMany(
    { orders: order._id },
    { $pull: { orders: order._id } }
  );

  response.json({
    success: true,
    deletedOrderId: String(order._id),
  });
});

const CUSTOMER_ORDER_FIELDS =
  "orderNumber total status paymentMethod createdAt items";

export const listCustomers = asyncHandler(async (_request, response) => {
  const customers = await User.find({ role: "customer" })
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("orders", CUSTOMER_ORDER_FIELDS);

  response.json({
    success: true,
    customers: customers.map((customer) => customer.toJSON()),
  });
});

export const getCustomer = asyncHandler(async (request, response) => {
  const customer = await User.findOne({
    _id: request.params.customerId,
    role: "customer",
  }).populate("orders", CUSTOMER_ORDER_FIELDS);

  if (!customer) {
    throw ApiError.notFound("customer_not_found");
  }

  response.json({
    success: true,
    customer: customer.toJSON(),
  });
});
