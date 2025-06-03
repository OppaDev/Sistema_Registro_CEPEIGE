import { Application, Router, Request, Response } from 'express';
import cursoRoutes from './curso.routes';


export const configureRoutes = (app: Application): void => {
  const apiRouter = Router();

  // Rutas de curso
  apiRouter.use('/cursos', cursoRoutes);


  // Una ruta de prueba simple para verificar que el router funciona
  apiRouter.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong!' });
  });

  // Montar el router principal bajo el prefijo /api/v1 (o el que prefieras)
  app.use('/api/v1', apiRouter);
};