import type { FastifyRequest } from "fastify";
import { Role } from "@prisma/client";

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
}

declare module "fastify" {
  interface FastifyRequest {
    user: JWTPayload;
  }
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface OrderInput {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  items: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }[];
}

export interface InventoryUpdateInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface RefundInput {
  orderId: string;
  amount: number;
  reason: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockItems: number;
  activeAlerts: number;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
  checks?: {
    database: string;
    error?: string;
  };
}
