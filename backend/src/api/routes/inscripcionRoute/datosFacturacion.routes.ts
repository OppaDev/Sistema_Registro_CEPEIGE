import { Router } from "express";
import { DatosFacturacionController } from "@/api/controllers/inscripcionController/datosFacturacion.controller";
import { validateDto } from "@/api/middlewares/validate.dto";
import { authenticate, optionalAuthenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware, publicWithOptionalAuthMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateDatosFacturacionDto, UpdateDatosFacturacionDto } from "@/api/dtos/inscripcionDto/datosFacturacion.dto";

const router = Router();
const datosFacturacionController = new DatosFacturacionController();

// === DATOS DE FACTURACIÓN según árbol de permisos ===

// Crear datos de facturación - Super-Admin, Admin, Public (flujo de inscripción)
router.post(
  "/",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite acceso público para el flujo de inscripción
  validateDto(CreateDatosFacturacionDto),
  datosFacturacionController.create
);

// Obtener todos los datos de facturación - Super-Admin, Admin, Contador, Public (con limitaciones)
router.get(
  "/",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Los usuarios autenticados pueden ver más datos
  datosFacturacionController.getAll
);

// Obtener datos de facturación por ID - Super-Admin, Admin, Contador, Public (para seguimiento)
router.get(
  "/:id",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite consultar durante proceso de inscripción
  datosFacturacionController.getById
);

// Obtener datos de facturación por identificación tributaria - Super-Admin, Admin, Contador, Public (para seguimiento)
router.get(
  "/identificacion/:identificacion",
  optionalAuthenticate, // Autenticación opcional
  publicWithOptionalAuthMiddleware, // Permite consultar durante proceso de inscripción
  datosFacturacionController.getByIdentificacion
);

// Actualizar datos de facturación - Super-Admin, Admin, Contador (NO público)
router.put(
  "/:id",
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.BILLING_DATA_UPDATE),
  validateDto(UpdateDatosFacturacionDto),
  datosFacturacionController.update
);

// Eliminar datos de facturación - Solo Super-Admin
router.delete(
  "/:id",
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.BILLING_DATA_DELETE),
  datosFacturacionController.delete
);

export default router;
