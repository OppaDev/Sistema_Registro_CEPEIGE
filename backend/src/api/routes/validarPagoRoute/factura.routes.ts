import { Router } from 'express';
import { FacturaController } from '@/api/controllers/validarPagoController/factura.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateFacturaDto, UpdateFacturaDto } from '@/api/dtos/validarPagoDto/factura.dto';

const router = Router();
const facturaController = new FacturaController();

// === FACTURAS según árbol de permisos ===

// Crear factura - Super-Admin, Contador
router.post(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_WRITE),
  validateDto(CreateFacturaDto),
  facturaController.create
);

// Obtener todas las facturas - Super-Admin, Admin, Contador
router.get(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_READ),
  facturaController.getAll
);

// Obtener factura por ID - Super-Admin, Admin, Contador
router.get(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_READ),
  facturaController.getById
);

// Actualizar factura - Super-Admin, Contador
router.put(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_WRITE),
  validateDto(UpdateFacturaDto),
  facturaController.update
);

// Eliminar factura - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_DELETE),
  facturaController.delete
);

// === BÚSQUEDAS ESPECÍFICAS ===

// Buscar por número de factura - Super-Admin, Admin, Contador
router.get(
  '/numero-factura/:numeroFactura',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_READ),
  facturaController.getByNumeroFactura
);

// Buscar por número de ingreso - Super-Admin, Admin, Contador
router.get(
  '/numero-ingreso/:numeroIngreso',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_READ),
  facturaController.getByNumeroIngreso
);

// Buscar por inscripción - Super-Admin, Admin, Contador
router.get(
  '/inscripcion/:idInscripcion',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_READ),
  facturaController.getByInscripcionId
);

// === VERIFICACIÓN DE PAGOS ===

// Verificar pago - Super-Admin, Contador
router.patch(
  '/:id/verificar-pago',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.INVOICES_VERIFY),
  facturaController.verificarPago
);

export default router;