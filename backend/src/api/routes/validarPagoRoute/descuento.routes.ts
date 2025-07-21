import { Router } from 'express';
import { DescuentoController } from '@/api/controllers/validarPagoController/descuento.controller';
import { validateDto } from '@/api/middlewares/validate.dto';
import { CreateDescuentoDto, UpdateDescuentoDto } from '@/api/dtos/validarPagoDto/descuento.dto';

const router = Router();
const descuentoController = new DescuentoController();

router.post('/', validateDto(CreateDescuentoDto), descuentoController.create);
router.put('/:id', validateDto(UpdateDescuentoDto), descuentoController.update);
router.get('/', descuentoController.getAll);
router.get('/:id', descuentoController.getById);
router.delete('/:id', descuentoController.delete);

export default router;
