import { Router } from 'express';
import { DatosPersonalesController } from '@/api/controllers/datosPersonales.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { CreateDatosPersonalesDto, UpdateDatosPersonalesDto } from '@/api/dtos/datosPersonales.dto';

const router = Router();
const datosPersonalesController = new DatosPersonalesController();

router.post('/', validateDto(CreateDatosPersonalesDto), datosPersonalesController.create);
router.get('/', datosPersonalesController.getAll);
router.get('/:id', datosPersonalesController.getById);
router.put('/:id', validateDto(UpdateDatosPersonalesDto), datosPersonalesController.update);
router.delete('/:id', datosPersonalesController.delete);

export default router;

