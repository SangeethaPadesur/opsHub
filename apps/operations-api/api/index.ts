import { buildApp } from "../src/app.js";

let app: any = null;

async function getApp() {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
