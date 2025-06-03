import { Router } from 'express';
import { CursoController } from '@/api/controllers/curso.controller';
import { validateDto } from '../middlewares/validate.dto';
import { CreateCursoDto, UpdateCursoDto} from '@/api/dtos/curso.dto';

const router = Router();
const cursoController = new CursoController();

router.post('/', validateDto(CreateCursoDto), cursoController.create);
router.put('/:id', validateDto(UpdateCursoDto), cursoController.update);
router.get('/', cursoController.getAll);
router.get('/disponibles', cursoController.getCursosDisponibles);
router.get('/:id', cursoController.getById);

export default router; 