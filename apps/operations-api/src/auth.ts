import { createHash, randomUUID } from "crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./db.js";
import { config } from "./config.js";
import type { JWTPayload } from "./types.js";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try { 
    await request.jwtVerify();
  } catch { 
    return reply.code(401).send({ error: "UNAUTHORIZED", message: "Valid access token required" }); 
  }
}

export function allowRoles(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    const user = request.user as JWTPayload;
    if (!roles.includes(user.role)) {
      return reply.code(403).send({ error: "FORBIDDEN", message: "Insufficient permission" });
    }
  };
}

export async function issueTokens(app: FastifyInstance, user: { id: string; email: string; role: string }) {
  const accessToken = app.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: config.accessTtl });
  const refreshToken = randomUUID() + randomUUID();
  const expiresAt = new Date(Date.now() + config.refreshDays * 86400000);
  await prisma.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), expiresAt, userId: user.id } });
  return { accessToken, refreshToken, expiresAt };
}
