import { Application, Router, Request, Response } from 'express';
import cursoRoutes from './curso.routes';
// Cuando tengas rutas específicas, impórtalas así:
// import userRoutes from './user.routes';
// import courseRoutes from './course.routes';

export const configureRoutes = (app: Application): void => {
  const apiRouter = Router();

  // Rutas de curso
  apiRouter.use('/cursos', cursoRoutes);

  // Rutas de ejemplo o para tus entidades
  // apiRouter.use('/users', userRoutes);
  // apiRouter.use('/courses', courseRoutes);

  // Una ruta de prueba simple para verificar que el router funciona
  apiRouter.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong!' });
  });

  // Montar el router principal bajo el prefijo /api/v1 (o el que prefieras)
  app.use('/api/v1', apiRouter);
};