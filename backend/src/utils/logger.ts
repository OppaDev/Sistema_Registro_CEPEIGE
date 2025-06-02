import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logLevel = process.env['LOG_LEVEL'] || 'info';
const logFile = process.env['LOG_FILE'] || 'logs/app.log';

// Crear directorio de logs si no existe
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    console.error(`Error al crear directorio de logs ${logDir}:`, error);
  }
}

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

// Configurar transportes
const transports: winston.transport[] = [
  // Consola
  new winston.transports.Console({
    format: consoleFormat,
    level: logLevel
  })
];

// Agregar archivo solo en producción o si se especifica
if (process.env['NODE_ENV'] === 'production' || process.env['LOG_FILE']) {
  transports.push(
    // Archivo para todos los logs
    new winston.transports.File({
      filename: logFile,
      format: customFormat,
      level: logLevel,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo separado para errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      format: customFormat,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  exitOnError: false,
  // No mostrar logs durante testing
  silent: process.env['NODE_ENV'] === 'test'
});

// Función helper para logs de request
export const logRequest = (method: string, url: string, statusCode: number, responseTime: number) => {
  const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
  
  if (statusCode >= 400) {
    logger.warn(message);
  } else {
    logger.info(message);
  }
};