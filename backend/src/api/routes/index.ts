import { Application, Router, Request, Response } from 'express';
import cursoRoutes from './cursoRoute/curso.routes';
import datosPersonalesRoutes from './inscripcionRoute/datosPersonales.routes';
import datosFacturacionRoutes from './inscripcionRoute/datosFacturacion.routes';
import comprobanteRoutes from './inscripcionRoute/comprobante.routes';
import inscripcionRoutes from './inscripcionRoute/inscripcion.routes';
import descuentoRoutes from './validarPagoRoute/descuento.routes';
import facturaRoutes from './validarPagoRoute/factura.routes';
import authRoutes from './authRoute/auth.routes';
import usuarioRoutes from './authRoute/usuario.routes';
import informeRoutes from './informeRoute/informe.routes';


export const configureRoutes = (app: Application): void => {
  const apiRouter = Router();
  
  // Rutas de autenticación (públicas y protegidas)
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/usuarios', usuarioRoutes);
  
  // Rutas de curso
  apiRouter.use('/cursos', cursoRoutes);
  // Rutas de datos personales
  apiRouter.use('/datos-personales', datosPersonalesRoutes);
  // Rutas de datos de facturación
  apiRouter.use('/datos-facturacion', datosFacturacionRoutes);  
  // Rutas de comprobantes
  apiRouter.use('/comprobantes', comprobanteRoutes);
  // Rutas de inscripciones
  apiRouter.use('/inscripciones', inscripcionRoutes);
  // Rutas de descuentos
  apiRouter.use('/descuentos', descuentoRoutes);
  // Rutas de facturas
  apiRouter.use('/facturas', facturaRoutes);
  // Rutas de informes
  apiRouter.use('/informes', informeRoutes);

  // Una ruta de prueba simple para verificar que el router funciona
  apiRouter.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong!' });
  });

  // Montar el router principal bajo el prefijo /api/v1 (o el que prefieras)
  app.use('/api/v1', apiRouter);
};