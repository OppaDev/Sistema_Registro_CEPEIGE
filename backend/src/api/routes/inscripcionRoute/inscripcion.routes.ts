import { Router } from "express";
import { InscripcionController } from "@/api/controllers/inscripcionController/inscripcion.controller";
import { validateDto } from "@/api/middlewares/validate.dto";
import { authenticate, optionalAuthenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware, publicWithOptionalAuthMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateInscripcionDto, UpdateInscripcionDto } from "@/api/dtos/inscripcionDto/inscripcion.dto";

const router = Router();
const inscripcionController = new InscripcionController();

// === INSCRIPCIONES según árbol de permisos ===

// Crear inscripción - Super-Admin, Admin, Public (flujo de inscripción)
router.post(
  "/",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite acceso público para el flujo de inscripción
  validateDto(CreateInscripcionDto),
  inscripcionController.create
);

// Obtener todas las inscripciones - Super-Admin, Admin, Contador, Public (con limitaciones)
router.get(
  "/",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Los usuarios autenticados pueden ver más datos
  inscripcionController.getAll
);

// Obtener inscripción por ID - Super-Admin, Admin, Contador, Public (para seguimiento)
router.get(
  "/:id",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite consultar durante proceso de inscripción
  inscripcionController.getById
);

// Actualizar inscripción (matricular) - Super-Admin, Admin (NO público)
router.put(
  "/:id",
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INSCRIPTIONS_UPDATE),
  validateDto(UpdateInscripcionDto),
  inscripcionController.update
);

// Eliminar inscripción - Solo Super-Admin
router.delete(
  "/:id",
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INSCRIPTIONS_DELETE),
  inscripcionController.delete
);
export default router;
