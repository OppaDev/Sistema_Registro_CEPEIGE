import { Router } from 'express';
import { UsuarioController } from '@/api/controllers/authController/usuario.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateUsuarioDto, UpdateUsuarioDto } from '@/api/dtos/authDto/usuario.dto';

const router = Router();
const usuarioController = new UsuarioController();

// === GESTIÓN DE USUARIOS - Solo Super-Admin según árbol de permisos ===

// Crear usuario - Solo Super-Admin
router.post(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.USERS_MANAGEMENT),
  validateDto(CreateUsuarioDto),
  usuarioController.create
);

// Obtener todos los usuarios - Solo Super-Admin
router.get(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.USERS_MANAGEMENT),
  usuarioController.getAll
);

// Obtener usuario por ID - Solo Super-Admin
router.get(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.USERS_MANAGEMENT),
  usuarioController.getById
);

// Actualizar usuario - Solo Super-Admin
router.put(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.USERS_MANAGEMENT),
  validateDto(UpdateUsuarioDto),
  usuarioController.update
);

// Eliminar usuario - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.USERS_MANAGEMENT),
  usuarioController.delete
);

export default router;
