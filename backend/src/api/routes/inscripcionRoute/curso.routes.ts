import { Router } from 'express';
import { CursoController } from '@/api/controllers/inscripcionController/curso.controller';
import { validateDto } from '../../middlewares/validate.dto';
import { CreateCursoDto, UpdateCursoDto} from '@/api/dtos/inscripcionDto/curso.dto';

const router = Router();
const cursoController = new CursoController();

router.post('/', validateDto(CreateCursoDto), cursoController.create);
router.put('/:id', validateDto(UpdateCursoDto), cursoController.update);
router.get('/', cursoController.getAll);
router.get('/disponibles', cursoController.getCursosDisponibles);
router.get('/:id', cursoController.getById);
router.delete('/:id', cursoController.delete);

export default router; 