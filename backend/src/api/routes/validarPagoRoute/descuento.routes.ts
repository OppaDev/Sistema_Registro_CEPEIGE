import { Router } from 'express';
import { DescuentoController } from '@/api/controllers/validarPagoController/descuento.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateDescuentoDto, UpdateDescuentoDto } from '@/api/dtos/validarPagoDto/descuento.dto';

const router = Router();
const descuentoController = new DescuentoController();

// === DESCUENTOS según árbol de permisos ===

// Crear descuento - Super-Admin, Admin
router.post(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.DISCOUNTS_WRITE),
  validateDto(CreateDescuentoDto),
  descuentoController.create
);

// Obtener todos los descuentos - Super-Admin, Admin, Contador
router.get(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.DISCOUNTS_READ),
  descuentoController.getAll
);

// Obtener descuento por ID - Super-Admin, Admin, Contador
router.get(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.DISCOUNTS_READ),
  descuentoController.getById
);

// Actualizar descuento - Super-Admin, Admin
router.put(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.DISCOUNTS_WRITE),
  validateDto(UpdateDescuentoDto),
  descuentoController.update
);

// Eliminar descuento - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.DISCOUNTS_DELETE),
  descuentoController.delete
);

export default router;
