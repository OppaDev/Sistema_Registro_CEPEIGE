import express from 'express';
import { configureExpress } from '@/config/express';
import { configureRoutes } from '@/api/routes';
import { errorHandler, notFoundHandler } from '@/api/middlewares';

const app = express();

// Configurar Express (middlewares globales)
configureExpress(app);

// Configurar rutas
configureRoutes(app);

// Middlewares de manejo de errores (deben ir al final)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;