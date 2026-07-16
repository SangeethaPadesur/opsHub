import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { authenticate, allowRoles } from "../auth.js";

export async function refundRoutes(app: FastifyInstance) {
  app.get("/:orderId/eligibility", { preHandler: authenticate }, async (request, reply) => {
    const order = await prisma.order.findUnique({ where: { id: (request.params as any).orderId } });
    if (!order) return reply.code(404).send({ error: "ORDER_NOT_FOUND" });
    return { eligible: ["DELIVERED","SHIPPED"].includes(order.status), maxRefundAmount: order.amount, requiresApproval: order.amount > 5000 };
  });
  app.post("/", { preHandler: allowRoles("ADMIN","OPERATIONS_MANAGER","SUPPORT_AGENT") }, async (request) => {
    const { orderId, amount, reason } = request.body as any;
    return prisma.refund.create({ data: { orderId, amount, reason, userId: request.user.sub } });
  });
}
