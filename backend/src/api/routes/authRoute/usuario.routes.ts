import { Router } from 'express';
import { UsuarioController } from '@/api/controllers/authController/usuario.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { authenticate, checkPermissions } from '@/api/middlewares/auth.middleware';
import { CreateUsuarioDto, UpdateUsuarioDto } from '@/api/dtos/authDto/usuario.dto';

const router = Router();
const usuarioController = new UsuarioController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear usuario - Solo Super-Admin
router.post(
  '/',
  checkPermissions(['crear:usuario']),
  validateDto(CreateUsuarioDto),
  usuarioController.create
);

// Obtener todos los usuarios - Super-Admin y Admin pueden ver usuarios
router.get(
  '/',
  checkPermissions(['leer:usuarios']),
  usuarioController.getAll
);

// Obtener usuario por ID - Super-Admin y Admin pueden ver usuarios
router.get(
  '/:id',
  checkPermissions(['leer:usuarios']),
  usuarioController.getById
);

// Actualizar usuario - Solo Super-Admin
router.put(
  '/:id',
  checkPermissions(['actualizar:usuario']),
  validateDto(UpdateUsuarioDto),
  usuarioController.update
);

// Eliminar usuario - Solo Super-Admin
router.delete(
  '/:id',
  checkPermissions(['eliminar:usuario']),
  usuarioController.delete
);

export default router;
