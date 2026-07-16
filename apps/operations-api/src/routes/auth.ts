import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { authenticate, hashToken, issueTokens } from "../auth.js";
import { config } from "../config.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: "strict" as const,
  path: "/api/v1/auth"
};

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const { email, password } = request.body as any;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    const tokens = await issueTokens(app, user);
    reply.setCookie("refreshToken", tokens.refreshToken, { ...cookieOptions, expires: tokens.expiresAt });
    return { accessToken: tokens.accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  });

  app.post("/refresh", async (request, reply) => {
    const token = request.cookies.refreshToken;
    if (!token) return reply.code(401).send({ error: "NO_REFRESH_TOKEN" });
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date())
      return reply.code(401).send({ error: "INVALID_REFRESH_TOKEN" });
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const tokens = await issueTokens(app, stored.user);
    reply.setCookie("refreshToken", tokens.refreshToken, { ...cookieOptions, expires: tokens.expiresAt });
    return { accessToken: tokens.accessToken };
  });

  app.post("/logout", async (request, reply) => {
    const token = request.cookies.refreshToken;
    if (token) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
    reply.clearCookie("refreshToken", cookieOptions);
    return { success: true };
  });

  app.get("/me", { preHandler: authenticate }, async (request) => {
    return prisma.user.findUnique({ where: { id: request.user.sub }, select: { id: true, name: true, email: true, role: true } });
  });
}
