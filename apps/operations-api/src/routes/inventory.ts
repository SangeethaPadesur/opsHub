import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { authenticate, allowRoles } from "../auth.js";

export async function inventoryRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authenticate }, async () =>
    prisma.inventory.findMany({ include: { product: true, warehouse: true }, orderBy: [{ productId: "asc" }, { warehouseId: "asc" }] })
  );

  app.get("/warehouses", { preHandler: authenticate }, async () => prisma.warehouse.findMany());

  app.post("/transfers", { preHandler: allowRoles("ADMIN","OPERATIONS_MANAGER","WAREHOUSE_MANAGER") }, async (request, reply) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = request.body as any;
    if (!quantity || quantity <= 0 || fromWarehouseId === toWarehouseId) return reply.code(400).send({ error: "INVALID_TRANSFER" });
    return prisma.$transaction(async tx => {
      const source = await tx.inventory.findUnique({ where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } } });
      if (!source || source.quantity < quantity) throw new Error("INSUFFICIENT_STOCK");
      await tx.inventory.update({ where: { id: source.id }, data: { quantity: { decrement: quantity } } });
      const target = await tx.inventory.upsert({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
        create: { productId, warehouseId: toWarehouseId, quantity },
        update: { quantity: { increment: quantity } }
      });
      return { success: true, target };
    });
  });
}
