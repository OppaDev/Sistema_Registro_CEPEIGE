import { Router } from 'express';
import { InformeController } from '@/api/controllers/informeController/informe.controller';
import { rateLimit } from 'express-rate-limit';

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

// TODO: Agregar middleware de autenticación y autorización cuando esté implementado
// router.use(authMiddleware);
// router.use(roleMiddleware(['superadmin', 'admin', 'contador']));

/**
 * @route GET /api/informes/tipos
 * @desc Obtener tipos de informe y formatos disponibles
 * @access Admin, SuperAdmin, Contador
 */
router.get('/tipos', consultaRateLimit, (req, res) => {
    informeController.obtenerTiposInforme(req, res);
});

/**
 * @route GET /api/informes/cursos
 * @desc Obtener lista de cursos disponibles para filtros
 * @access Admin, SuperAdmin, Contador
 */
router.get('/cursos', consultaRateLimit, (req, res) => {
    informeController.obtenerCursosDisponibles(req, res);
});

/**
 * @route GET /api/informes/estadisticas
 * @desc Obtener estadísticas del informe sin generar archivo
 * @access Admin, SuperAdmin, Contador
 * @query fechaInicio?: string (YYYY-MM-DD)
 * @query fechaFin?: string (YYYY-MM-DD)
 * @query idCurso?: number
 * @query matricula?: boolean
 * @query verificacionPago?: boolean
 */
router.get('/estadisticas', consultaRateLimit, (req, res) => {
    informeController.obtenerEstadisticas(req, res);
});

/**
 * @route GET /api/informes/datos
 * @desc Obtener datos completos del informe sin generar archivo
 * @access Admin, SuperAdmin, Contador
 * @query fechaInicio?: string (YYYY-MM-DD)
 * @query fechaFin?: string (YYYY-MM-DD)
 * @query idCurso?: number
 * @query matricula?: boolean
 * @query verificacionPago?: boolean
 */
router.get('/datos', consultaRateLimit, (req, res) => {
    informeController.obtenerDatosInforme(req, res);
});

/**
 * @route POST /api/informes/generar
 * @desc Generar y descargar informe en formato Excel o PDF
 * @access Admin, SuperAdmin, Contador
 * @body {
 *   tipoInforme: 'inscripciones' | 'pagados' | 'matriculados' | 'pendientes',
 *   formato: 'excel' | 'pdf',
 *   fechaInicio?: string,
 *   fechaFin?: string,
 *   idCurso?: number,
 *   matricula?: boolean,
 *   verificacionPago?: boolean
 * }
 */
router.post('/generar', informeRateLimit, (req, res) => {
    informeController.generarInforme(req, res);
});

/**
 * @route POST /api/informes/excel
 * @desc Generar y descargar informe en formato Excel (endpoint específico)
 * @access Admin, SuperAdmin, Contador
 * @body {
 *   tipoInforme: 'inscripciones' | 'pagados' | 'matriculados' | 'pendientes',
 *   fechaInicio?: string,
 *   fechaFin?: string,
 *   idCurso?: number,
 *   matricula?: boolean,
 *   verificacionPago?: boolean
 * }
 */
router.post('/excel', informeRateLimit, (req, res) => {
    informeController.generarExcel(req, res);
});

/**
 * @route POST /api/informes/pdf
 * @desc Generar y descargar informe en formato PDF (endpoint específico)
 * @access Admin, SuperAdmin, Contador
 * @body {
 *   tipoInforme: 'inscripciones' | 'pagados' | 'matriculados' | 'pendientes',
 *   fechaInicio?: string,
 *   fechaFin?: string,
 *   idCurso?: number,
 *   matricula?: boolean,
 *   verificacionPago?: boolean
 * }
 */
router.post('/pdf', informeRateLimit, (req, res) => {
    informeController.generarPDF(req, res);
});

export default router;