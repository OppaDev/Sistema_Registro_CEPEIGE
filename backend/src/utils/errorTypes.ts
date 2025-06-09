export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Error de base de datos: ${message}`, 500);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(`Error de subida de archivo: ${message}`, 400);
  }
}

// Tipos de errores para mejor tipado
export type ErrorType = 
  | AppError 
  | ValidationError 
  | NotFoundError 
  | UnauthorizedError 
  | ForbiddenError 
  | ConflictError 
  | DatabaseError 
  | FileUploadError;