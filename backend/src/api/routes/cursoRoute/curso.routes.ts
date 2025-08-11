import { Router } from 'express';
import { CursoController } from '@/api/controllers/cursoController/curso.controller';
import { validateDto } from '../../middlewares/validate.dto';
import { authenticate, optionalAuthenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware, publicWithOptionalAuthMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';
import { CreateCursoDto, UpdateCursoDto} from '@/api/dtos/cursoDto/curso.dto';

const router = Router();
const cursoController = new CursoController();

// === GESTIÓN DE CURSOS según árbol de permisos ===

// Crear curso - Super-Admin, Admin (según árbol corregido final)
router.post(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.COURSES_WRITE),
  validateDto(CreateCursoDto),
  cursoController.create
);

// Listar todos los cursos - Super-Admin, Admin, Contador
router.get(
  '/',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.COURSES_READ_ALL),
  cursoController.getAll
);

// Ver cursos disponibles - Acceso público para el flujo de inscripción con auth opcional
router.get(
  '/disponibles',
  optionalAuthenticate, // Autenticación opcional para mejor experiencia
  publicWithOptionalAuthMiddleware, // Permite acceso público pero mejora experiencia si está autenticado
  cursoController.getCursosDisponibles
);

// Ver curso específico - Super-Admin, Admin (según árbol corregido)
router.get(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.COURSES_READ_DETAIL),
  cursoController.getById
);

// Actualizar curso - Super-Admin, Admin (según árbol corregido final)
router.put(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.COURSES_WRITE),
  validateDto(UpdateCursoDto),
  cursoController.update
);

// Eliminar curso - Solo Super-Admin
router.delete(
  '/:id',
  authenticate,
  roleMiddleware(ROLE_PERMISSIONS.COURSES_DELETE),
  cursoController.delete
);

export default router; 