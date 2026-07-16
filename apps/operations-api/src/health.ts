import type { FastifyInstance } from "fastify";
import { prisma } from "./db.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  }));

  app.get("/health/ready", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "ready",
        timestamp: new Date().toISOString(),
        checks: {
          database: "healthy"
        }
      };
    } catch (error) {
      return {
        status: "not ready",
        timestamp: new Date().toISOString(),
        checks: {
          database: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  });

  app.get("/health/live", async () => ({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
}
