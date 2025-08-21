import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { corsConfig } from './cors';
import { logger } from '@/utils/logger';

export function configureExpress(app: Application): void {
  // Trust proxy
  app.set('trust proxy', 1);

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS
  app.use(cors(corsConfig));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutos
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    message: {
      error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ 
    limit: '10mb',
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  // Servir archivos estáticos desde /uploads con CORS específico para archivos
  const uploadsPath = process.env['UPLOAD_PATH'] || './uploads';
  app.use('/uploads', (req, res, next) => {
    // CORS específico para archivos estáticos
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  }, express.static(uploadsPath));

  // Logging
  if (process.env['NODE_ENV'] === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        }
      }
    }));
  }

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development'
    });
  });

  // Root endpoint
  app.get('/', (_, res) => {
    res.json({
      message: 'Sistema de Registro CEPEIGE API',
      version: '1.0.0',
      documentation: '/api/docs'
    });
  });
}