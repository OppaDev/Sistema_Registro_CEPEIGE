import { Router } from 'express';
import { submitFormData, getAllFormData, getFormDataById, updateFormDataById, deleteFormDataById } from '../controllers/formData.controller';

const router = Router();

// Endpoint para recibir datos del formulario
router.post('/form-data', submitFormData);

// Ruta para obtener todos los datos
router.get('/form-data', getAllFormData);

// Ruta para obtener un dato por ID
router.get('/form-data/:id', getFormDataById);

// Ruta para actualizar un registro por ID
router.put('/form-data/:id', updateFormDataById);

// Ruta para eliminar un registro por ID
router.delete('/form-data/:id', deleteFormDataById);

export default router;
