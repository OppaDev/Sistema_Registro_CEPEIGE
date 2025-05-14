import { Router } from 'express';
import { getExampleData } from '../controllers/example.controller';

const router = Router();

router.get('/', getExampleData);

export default router;