import { Router } from 'express';
import { InformeController } from '@/api/controllers/informeController/informe.controller';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { roleMiddleware } from '@/api/middlewares/role.middleware';
import { ROLE_PERMISSIONS } from '@/config/roles';

const router = Router();
const informeController = new InformeController();

// Rate limiting para generación de informes (más restrictivo)
const informeRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // máximo 10 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes de informes. Intenta de nuevo más tarde.',
        error: 'TooManyRequests'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting para consultas de datos (menos restrictivo)
const consultaRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas consultas. Intenta de nuevo más tarde.',
        error: 'TooManyRequests'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// === INFORMES - Solo roles administrativos (Super-Admin, Admin, Contador) ===

/**
 * @route GET /api/informes/tipos
 * @desc Obtener tipos de informe y formatos disponibles
 * @access Super-Admin, Admin, Contador
 */
router.get('/tipos', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    consultaRateLimit, 
    (req, res) => {
        informeController.obtenerTiposInforme(req, res);
    }
);

/**
 * @route GET /api/informes/cursos
 * @desc Obtener lista de cursos disponibles para filtros
 * @access Super-Admin, Admin, Contador
 */
router.get('/cursos', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    consultaRateLimit, 
    (req, res) => {
        informeController.obtenerCursosDisponibles(req, res);
    }
);

/**
 * @route GET /api/informes/estadisticas
 * @desc Obtener estadísticas del informe sin generar archivo
 * @access Super-Admin, Admin, Contador
 */
router.get('/estadisticas', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    consultaRateLimit, 
    (req, res) => {
        informeController.obtenerEstadisticas(req, res);
    }
);

/**
 * @route GET /api/informes/datos
 * @desc Obtener datos completos del informe sin generar archivo
 * @access Super-Admin, Admin, Contador
 */
router.get('/datos', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    consultaRateLimit, 
    (req, res) => {
        informeController.obtenerDatosInforme(req, res);
    }
);

/**
 * @route POST /api/informes/generar
 * @desc Generar y descargar informe en formato Excel o PDF
 * @access Super-Admin, Admin, Contador
 */
router.post('/generar', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    informeRateLimit, 
    (req, res) => {
        informeController.generarInforme(req, res);
    }
);

/**
 * @route POST /api/informes/excel
 * @desc Generar y descargar informe en formato Excel
 * @access Super-Admin, Admin, Contador
 */
router.post('/excel', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    informeRateLimit, 
    (req, res) => {
        informeController.generarExcel(req, res);
    }
);

/**
 * @route POST /api/informes/pdf
 * @desc Generar y descargar informe en formato PDF
 * @access Super-Admin, Admin, Contador
 */
router.post('/pdf', 
    authenticate,
    roleMiddleware(ROLE_PERMISSIONS.REPORTS_ACCESS),
    informeRateLimit, 
    (req, res) => {
        informeController.generarPDF(req, res);
    }
);

export default router;