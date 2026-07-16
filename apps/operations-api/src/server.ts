import "dotenv/config";
import { buildApp } from "./app.js";
import { config } from "./config.js";

async function start() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: config.host });
}

start();
