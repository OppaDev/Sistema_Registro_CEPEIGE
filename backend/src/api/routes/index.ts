import { Application, Router, Request, Response } from 'express';
import cursoRoutes from './inscripcionRoute/curso.routes';
import datosPersonalesRoutes from './inscripcionRoute/datosPersonales.routes';
import datosFacturacionRoutes from './inscripcionRoute/datosFacturacion.routes';
import comprobanteRoutes from './inscripcionRoute/comprobante.routes';
import inscripcionRoutes from './inscripcionRoute/inscripcion.routes';
import descuentoRoutes from './inscripcionRoute/descuento.routes';


export const configureRoutes = (app: Application): void => {
  const apiRouter = Router();
  // Rutas de curso
  apiRouter.use('/cursos', cursoRoutes);
  // Rutas de datos personales
  apiRouter.use('/datos-personales', datosPersonalesRoutes);
  // Rutas de datos de facturación
  apiRouter.use('/datos-facturacion', datosFacturacionRoutes);  // Rutas de comprobantes
  apiRouter.use('/comprobantes', comprobanteRoutes);
  // Rutas de inscripciones
  apiRouter.use('/inscripciones', inscripcionRoutes);
  // Rutas de descuentos
  apiRouter.use('/descuentos', descuentoRoutes);

  // Una ruta de prueba simple para verificar que el router funciona
  apiRouter.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong!' });
  });

  // Montar el router principal bajo el prefijo /api/v1 (o el que prefieras)
  app.use('/api/v1', apiRouter);
};