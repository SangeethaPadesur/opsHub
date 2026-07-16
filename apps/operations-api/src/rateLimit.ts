import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export function rateLimit(options: {
  windowMs: number;
  max: number;
  skip?: (request: FastifyRequest) => boolean;
}) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (options.skip?.(request)) return;

    const key = request.ip;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return;
    }

    if (record.count >= options.max) {
      return reply.code(429).send({
        error: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
  };
}

export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

setInterval(cleanupRateLimitStore, 60000);
