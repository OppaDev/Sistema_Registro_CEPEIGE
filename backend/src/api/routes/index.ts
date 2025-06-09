import { Application, Router, Request, Response } from 'express';
import cursoRoutes from './curso.routes';
import datosPersonalesRoutes from './datosPersonales.routes';
import datosFacturacionRoutes from './datosFacturacion.routes';


export const configureRoutes = (app: Application): void => {
  const apiRouter = Router();

  // Rutas de curso
  apiRouter.use('/cursos', cursoRoutes);
  // Rutas de datos personales
  apiRouter.use('/datos-personales', datosPersonalesRoutes);
  // Rutas de datos de facturación
  apiRouter.use('/datos-facturacion', datosFacturacionRoutes);


  // Una ruta de prueba simple para verificar que el router funciona
  apiRouter.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong!' });
  });

  // Montar el router principal bajo el prefijo /api/v1 (o el que prefieras)
  app.use('/api/v1', apiRouter);
};