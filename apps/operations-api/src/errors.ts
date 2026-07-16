import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, "VALIDATION_ERROR", message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, "AUTHENTICATION_ERROR", message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(403, "AUTHORIZATION_ERROR", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}

export class InsufficientStockError extends AppError {
  constructor(message: string = "Insufficient stock") {
    super(409, "INSUFFICIENT_STOCK", message);
  }
}

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    reply.log.error({
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.isOperational ? undefined : error.stack
    });

    return reply.code(error.statusCode).send({
      error: error.code,
      message: error.message,
      ...(error.isOperational ? {} : { stack: error.stack })
    });
  }

  reply.log.error({
    error: error.message,
    stack: error.stack
  });

  return reply.code(500).send({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred"
  });
}

export function asyncHandler<T>(fn: (...args: any[]) => Promise<T>) {
  return (...args: any[]) => fn(...args).catch(args[2]);
}
