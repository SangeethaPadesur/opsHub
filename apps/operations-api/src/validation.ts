import { z } from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { ValidationError } from "./errors.js";

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
      }
      throw error;
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
      }
      throw error;
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
      }
      throw error;
    }
  };
}

// Common validation schemas
export const schemas = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),
  
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT', 'WAREHOUSE_MANAGER'])
  }),
  
  orderItem: z.object({
    name: z.string().min(1, 'Item name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().positive('Quantity must be positive')
  }),
  
  createOrder: z.object({
    id: z.string().min(1, 'Order ID is required'),
    customerName: z.string().min(2, 'Customer name is required'),
    customerEmail: z.string().email('Invalid email format'),
    amount: z.number().positive('Amount must be positive'),
    items: z.array(z.object({
      name: z.string().min(1, 'Item name is required'),
      sku: z.string().min(1, 'SKU is required'),
      price: z.number().positive('Price must be positive'),
      quantity: z.number().int().positive('Quantity must be positive')
    })).min(1, 'At least one item is required')
  }),
  
  updateInventory: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    warehouseId: z.string().min(1, 'Warehouse ID is required'),
    quantity: z.number().int().min(0, 'Quantity must be non-negative')
  }),
  
  createRefund: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive'),
    reason: z.string().min(5, 'Reason must be at least 5 characters')
  }),
  
  pagination: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10')
  })
};
