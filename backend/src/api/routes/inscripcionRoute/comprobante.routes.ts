import { Router } from 'express';
import { ComprobanteController } from '@/api/controllers/inscripcionController/comprobante.controller';
import { uploadComprobanteMiddleware } from '@/config/multer'; // Middleware de Multer
import { authenticate, optionalAuthenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware, publicWithOptionalAuthMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';

const router = Router();
const comprobanteController = new ComprobanteController();

// === COMPROBANTES según árbol de permisos ===

// Subir comprobante - Super-Admin, Admin, Public (flujo de inscripción)
router.post(
  '/',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite acceso público para el flujo de inscripción
  uploadComprobanteMiddleware.single('comprobanteFile'),
  comprobanteController.create
);

// Obtener todos los comprobantes - Super-Admin, Admin, Contador, Public (con limitaciones)
router.get(
  '/',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Los usuarios autenticados pueden ver más datos
  comprobanteController.getAll
);

// Obtener comprobante por ID - Super-Admin, Admin, Contador, Public (para seguimiento)
router.get(
  '/:id',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite consultar durante proceso de inscripción
  comprobanteController.getById
);

// Eliminar comprobante - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.VOUCHERS_DELETE),
  comprobanteController.delete
);


export default router;