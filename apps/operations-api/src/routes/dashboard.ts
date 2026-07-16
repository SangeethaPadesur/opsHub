import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { authenticate } from "../auth.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/summary", { preHandler: authenticate }, async () => {
    const [ordersToday, pendingOrders, failedPayments, lowStockItems, criticalAlerts] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { paymentStatus: "FAILED" } }),
      prisma.inventory.count({ where: { quantity: { lt: 10 } } }),
      prisma.alert.count({ where: { severity: "CRITICAL" } })
    ]);
    return { ordersToday, pendingOrders, failedPayments, delayedDeliveries: 124, lowStockItems, criticalAlerts };
  });
  app.get("/alerts", { preHandler: authenticate }, async () => prisma.alert.findMany({ take: 20, orderBy: { createdAt: "desc" } }));
}
