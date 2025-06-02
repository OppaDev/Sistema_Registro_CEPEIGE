import { Router } from 'express';
import { CursoController } from '@/api/controllers/curso.controller';
import { validateDto } from '../middlewares/validate.dto';
import { CreateCursoDto } from '@/api/dtos/curso.dto';

const router = Router();
const cursoController = new CursoController();

router.post('/', validateDto(CreateCursoDto), cursoController.create);

export default router; 