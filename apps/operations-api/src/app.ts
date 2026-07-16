import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import { rateLimit } from "./rateLimit.js";
import { healthRoutes } from "./health.js";
import { authRoutes } from "./routes/auth.js";
import { orderRoutes } from "./routes/orders.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { refundRoutes } from "./routes/refunds.js";
import { adminRoutes } from "./routes/admin.js";
import { registerLiveEvents } from "./live.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  
  app.addHook('onRequest', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (request) => request.url.startsWith('/health') || request.url.startsWith('/docs')
  }));
  
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Origin not allowed by CORS"), false);
    },
    credentials: true
  });
  await app.register(cookie);
  await app.register(jwt, { secret: config.accessSecret });
  await app.register(websocket);
  await app.register(swagger, { openapi: { info: { title: "Operations API", version: "1.0.0" } } });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(orderRoutes, { prefix: "/api/v1/orders" });
  await app.register(inventoryRoutes, { prefix: "/api/v1/inventory" });
  await app.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
  await app.register(refundRoutes, { prefix: "/api/v1/refunds" });
  await app.register(adminRoutes, { prefix: "/api/v1/admin" });
  registerLiveEvents(app);

  app.setErrorHandler(errorHandler);
  return app;
}
