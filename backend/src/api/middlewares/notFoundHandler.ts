import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@/utils/errorTypes';

export const notFoundHandler = (req: Request, _: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Ruta no encontrada - ${req.method} ${req.originalUrl}`);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};