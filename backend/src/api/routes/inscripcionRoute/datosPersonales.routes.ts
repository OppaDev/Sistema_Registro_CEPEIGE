import { Router } from 'express';
import { DatosPersonalesController } from '@/api/controllers/inscripcionController/datosPersonales.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate, optionalAuthenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware, publicWithOptionalAuthMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateDatosPersonalesDto, UpdateDatosPersonalesDto } from '@/api/dtos/inscripcionDto/datosPersonales.dto';

const router = Router();
const datosPersonalesController = new DatosPersonalesController();

// === DATOS PERSONALES según árbol de permisos ===

// Crear datos personales - Super-Admin, Admin, Public (flujo de inscripción)
router.post(
  '/',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite acceso público pero mejora experiencia si está autenticado
  validateDto(CreateDatosPersonalesDto),
  datosPersonalesController.create
);

// Obtener todos los datos personales - Super-Admin, Admin, Contador, Public (con limitaciones por seguridad)
router.get(
  '/',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Los usuarios autenticados podrían ver más datos
  datosPersonalesController.getAll
);

// Buscar por CI/Pasaporte - Super-Admin, Admin, Contador, Public (para validar duplicados en inscripción)
router.get(
  '/search',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite verificar duplicados durante inscripción
  datosPersonalesController.getByCiPasaporte
);

// Obtener por ID - Super-Admin, Admin, Contador, Public (para seguimiento de inscripción)
router.get(
  '/:id',
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite consultar durante proceso de inscripción
  datosPersonalesController.getById
);

// Actualizar datos personales - Super-Admin, Admin (NO público para actualizaciones)
router.put(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.PERSONAL_DATA_UPDATE),
  validateDto(UpdateDatosPersonalesDto),
  datosPersonalesController.update
);

// Eliminar datos personales - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.PERSONAL_DATA_DELETE),
  datosPersonalesController.delete
);


export default router;

