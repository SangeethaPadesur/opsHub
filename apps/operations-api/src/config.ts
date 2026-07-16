import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("4000"),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.string().transform(Number).default("7"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.string().transform(val => val === "true").default("false"),
  LIVE_EVENT_INTERVAL_MS: z.string().transform(Number).default("5000")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  parsedEnv.error.errors.forEach(err => {
    console.error(`  - ${err.path.join(".")}: ${err.message}`);
  });
  throw new Error("Environment validation failed");
}

export const config = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  host: parsedEnv.data.HOST,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  accessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
  refreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
  accessTtl: parsedEnv.data.ACCESS_TOKEN_TTL,
  refreshDays: parsedEnv.data.REFRESH_TOKEN_TTL_DAYS,
  corsOrigins: parsedEnv.data.CORS_ORIGIN.split(",").map(v => v.trim()).filter(Boolean),
  cookieSecure: parsedEnv.data.COOKIE_SECURE,
  liveInterval: parsedEnv.data.LIVE_EVENT_INTERVAL_MS,
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isProduction: parsedEnv.data.NODE_ENV === "production"
};
