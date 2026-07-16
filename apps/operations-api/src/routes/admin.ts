import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { allowRoles } from "../auth.js";

export async function adminRoutes(app: FastifyInstance) {
  app.get("/users", { preHandler: allowRoles("ADMIN") }, async () =>
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } })
  );
  app.get("/feature-flags", { preHandler: allowRoles("ADMIN") }, async () => prisma.featureFlag.findMany());
  app.patch("/feature-flags/:key", { preHandler: allowRoles("ADMIN") }, async (request) => {
    const { enabled } = request.body as any;
    return prisma.featureFlag.update({ where: { key: (request.params as any).key }, data: { enabled } });
  });
}
