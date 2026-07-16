import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { authenticate } from "../auth.js";

export async function orderRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authenticate }, async (request) => {
    const q = request.query as any;
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
    const where: any = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.search ? { OR: [
        { id: { contains: q.search, mode: "insensitive" } },
        { customerName: { contains: q.search, mode: "insensitive" } }
      ] } : {})
    };
    const [items, total] = await Promise.all([
      prisma.order.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.order.count({ where })
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  });

  app.get("/:id", { preHandler: authenticate }, async (request, reply) => {
    const order = await prisma.order.findUnique({ where: { id: (request.params as any).id }, include: { items: true, refunds: true } });
    return order ?? reply.code(404).send({ error: "ORDER_NOT_FOUND" });
  });

  app.patch("/:id/status", { preHandler: authenticate }, async (request) => {
    const { status } = request.body as any;
    return prisma.order.update({ where: { id: (request.params as any).id }, data: { status } });
  });
}
