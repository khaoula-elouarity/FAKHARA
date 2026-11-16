import ContactMessage from "../models/ContactMessage.js";
import CustomizationRequest from "../models/CustomizationRequest.js";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const LOW_STOCK_THRESHOLD = 5;
const SALES_TREND_DAYS = 14;
const BEST_SELLERS_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 5;

function utcDayStart(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function buildSalesTrend(rows, days) {
  const byDay = new Map(rows.map((row) => [row._id, row]));
  const start = utcDayStart();
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const trend = [];

  for (let index = 0; index < days; index += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    const key = day.toISOString().slice(0, 10);
    const row = byDay.get(key);

    trend.push({
      date: key,
      revenue: Math.round((row?.revenue || 0) * 100) / 100,
      orders: row?.orders || 0,
    });
  }

  return trend;
}

export const getDashboardStats = asyncHandler(async (_request, response) => {
  const trendStart = utcDayStart();
  trendStart.setUTCDate(trendStart.getUTCDate() - (SALES_TREND_DAYS - 1));

  const [
    products,
    orders,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    customers,
    newCustomers,
    contactMessages,
    newContactMessages,
    customRequests,
    newCustomRequests,
    revenueResult,
    deliveredRevenueResult,
    activeOrderCount,
    bestSellers,
    lowStockProducts,
    lowStockCount,
    outOfStock,
    stockResult,
    recentOrders,
    salesTrendRows,
    statusRows,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "confirmed" }),
    Order.countDocuments({ status: "preparing" }),
    Order.countDocuments({ status: "shipped" }),
    Order.countDocuments({ status: "delivered" }),
    Order.countDocuments({ status: "cancelled" }),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({
      role: "customer",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: "new" }),
    CustomizationRequest.countDocuments(),
    CustomizationRequest.countDocuments({ status: "pending" }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ status: { $ne: "cancelled" } }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          quantity: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: BEST_SELLERS_LIMIT },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          image: 1,
          quantity: 1,
          revenue: 1,
        },
      },
    ]),
    Product.find({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    })
      .sort({ stock: 1, createdAt: 1 })
      .limit(10)
      .select("productId name stock price image category")
      .lean(),
    Product.countDocuments({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    }),
    Product.countDocuments({ isActive: true, stock: { $lte: 0 } }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$stock" } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .select(
        "orderNumber customer.fullName customer.email customer.phone customer.city total status createdAt items"
      )
      .lean(),
    Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: trendStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const revenue = Math.round((revenueResult[0]?.total || 0) * 100) / 100;
  const deliveredRevenue =
    Math.round((deliveredRevenueResult[0]?.total || 0) * 100) / 100;
  const averageOrderValue =
    activeOrderCount > 0 ? Math.round((revenue / activeOrderCount) * 100) / 100 : 0;

  const statusBreakdown = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0])
  );

  for (const row of statusRows) {
    if (row?._id) {
      statusBreakdown[row._id] = row.count;
    }
  }

  response.json({
    success: true,
    stats: {
      products,
      orders,
      newOrders: pendingOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      customers,
      newCustomers,
      contactMessages,
      newContactMessages,
      customRequests,
      newCustomRequests,
      revenue,
      totalSales: revenue,
      deliveredRevenue,
      averageOrderValue,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowStock: lowStockCount,
      outOfStock,
      totalStock: stockResult[0]?.total || 0,
      statusBreakdown,
      bestSellers: bestSellers.map((item) => ({
        ...item,
        revenue: Math.round((item.revenue || 0) * 100) / 100,
      })),
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.productId,
        productId: product.productId,
        name: product.name,
        stock: product.stock,
        price: product.price,
        image: product.image,
        category: product.category,
      })),
      recentOrders: recentOrders.map((order) => ({
        ...order,
        id: String(order._id),
        _id: undefined,
      })),
      salesTrend: buildSalesTrend(salesTrendRows, SALES_TREND_DAYS),
    },
  });
});
