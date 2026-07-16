import type { FastifyInstance } from "fastify";
import { config } from "./config.js";

const clients = new Set<any>();
const types = ["ORDER_CREATED","ORDER_STATUS_CHANGED","PAYMENT_FAILED","INVENTORY_LOW","SHIPMENT_DELAYED","DELIVERY_COMPLETED"];

export function registerLiveEvents(app: FastifyInstance) {
  app.get("/api/v1/events", { websocket: true }, (socket) => {
    clients.add(socket);
    socket.send(JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() }));
    socket.on("close", () => clients.delete(socket));
  });

  const timer = setInterval(() => {
    const type = types[Math.floor(Math.random() * types.length)];
    const event = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data: { orderId: `ORD-${1000 + Math.floor(Math.random() * 900)}`, message: `Simulated ${type.toLowerCase().replaceAll("_"," ")}` }
    };
    for (const client of clients) if (client.readyState === 1) client.send(JSON.stringify(event));
  }, config.liveInterval);
  app.addHook("onClose", async () => clearInterval(timer));
}
