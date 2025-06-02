import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const message = (err as AppError).isOperational ? err.message : 'Ocurrió un error interno en el servidor.';

  // Loggear errores del servidor o no operacionales con más detalle
  if (statusCode >= 500 || !(err as AppError).isOperational) {
    logger.error('Error inesperado:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body, // Cuidado con datos sensibles en producción
      // Puedes añadir más detalles si es necesario
    });
  } else {
    // Loggear errores operacionales (ej. validación, no encontrado) como warnings
    logger.warn(`Error operacional: ${err.message}`, { statusCode, path: req.path });
  }

  if (res.headersSent) {
    // Si las cabeceras ya fueron enviadas, delegar al manejador de errores por defecto de Express
    // Esto es raro pero puede pasar si se envía una respuesta parcial y luego se lanza un error
    return next(err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail', // 'fail' para errores de cliente (4xx)
    message: message,
    ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack }),
  });
};