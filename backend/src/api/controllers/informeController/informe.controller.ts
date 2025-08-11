import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { InformeService } from '@/api/services/informeService/informe.service';
import { 
    FiltrosInformeDto, 
    GenerarInformeDto,
    TipoInforme,
    FormatoExportacion
} from '@/api/dtos/informeDto/informe.dto';
import { logger } from '@/utils/logger';
import { ValidationError, AppError, NotFoundError } from '@/utils/errorTypes';

const informeService = new InformeService();

export class InformeController {

    /**
     * GET /api/informes/datos
     * Obtener datos del informe con filtros (sin generar archivo)
     */
    async obtenerDatosInforme(req: Request, res: Response): Promise<void> {
        try {
            logger.info('📊 Solicitud de datos de informe:', req.query);

            // Validar filtros
            const filtrosDto = plainToClass(FiltrosInformeDto, req.query);
            const errors = await validate(filtrosDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => 
                    Object.values(error.constraints || {}).join(', ')
                ).join('; ');
                throw new ValidationError(`Filtros inválidos: ${errorMessages}`);
            }

            // Validar que el curso existe si se proporciona idCurso
            if (filtrosDto.idCurso) {
                const cursoExiste = await informeService.verificarCursoExiste(filtrosDto.idCurso);
                if (!cursoExiste) {
                    throw new NotFoundError(`Curso con ID ${filtrosDto.idCurso}`);
                }
            }

            const informeCompleto = await informeService.obtenerInformeCompleto(filtrosDto);

            res.status(200).json({
                success: true,
                message: 'Datos del informe obtenidos exitosamente',
                data: informeCompleto
            });

        } catch (error) {
            logger.error('❌ Error al obtener datos de informe:', error);
            
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.name
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: 'InternalServerError'
                });
            }
        }
    }

    /**
     * POST /api/informes/generar
     * Generar y descargar informe en Excel o PDF
     */
    async generarInforme(req: Request, res: Response): Promise<void> {
        try {
            logger.info('📥 Solicitud de generación de informe:', req.body);

            // Validar datos de entrada
            const generarInformeDto = plainToClass(GenerarInformeDto, req.body);
            const errors = await validate(generarInformeDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => 
                    Object.values(error.constraints || {}).join(', ')
                ).join('; ');
                throw new ValidationError(`Datos inválidos: ${errorMessages}`);
            }

            // Validar que el curso existe si se proporciona idCurso
            if (generarInformeDto.idCurso) {
                const cursoExiste = await informeService.verificarCursoExiste(generarInformeDto.idCurso);
                if (!cursoExiste) {
                    throw new NotFoundError(`Curso con ID ${generarInformeDto.idCurso}`);
                }
            }

            let buffer: Buffer;
            let archivoInfo: any;

            // Generar informe según el formato solicitado
            if (generarInformeDto.formato === FormatoExportacion.EXCEL) {
                const resultado = await informeService.generarInformeExcel(
                    generarInformeDto.tipoInforme, 
                    generarInformeDto
                );
                buffer = resultado.buffer;
                archivoInfo = resultado.archivoInfo;
            } else if (generarInformeDto.formato === FormatoExportacion.PDF) {
                const resultado = await informeService.generarInformePDF(
                    generarInformeDto.tipoInforme, 
                    generarInformeDto
                );
                buffer = resultado.buffer;
                archivoInfo = resultado.archivoInfo;
            } else {
                throw new ValidationError('Formato de archivo no soportado');
            }

            // Configurar headers para descarga
            res.setHeader('Content-Type', archivoInfo.tipoArchivo);
            res.setHeader('Content-Disposition', `attachment; filename="${archivoInfo.nombreArchivo}"`);
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('X-Archivo-Info', JSON.stringify({
                nombre: archivoInfo.nombreArchivo,
                tamano: archivoInfo.tamanoBytes,
                fechaGeneracion: archivoInfo.fechaGeneracion
            }));

            logger.info('✅ Informe generado y enviado exitosamente:', {
                archivo: archivoInfo.nombreArchivo,
                tamano: archivoInfo.tamanoBytes,
                formato: generarInformeDto.formato
            });

            // Enviar el archivo
            res.send(buffer);

        } catch (error) {
            logger.error('❌ Error al generar informe:', error);
            
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.name
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: 'InternalServerError'
                });
            }
        }
    }

    /**
     * GET /api/informes/estadisticas
     * Obtener solo las estadísticas del informe
     */
    async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
        try {
            logger.info('📈 Solicitud de estadísticas:', req.query);

            // Validar filtros
            const filtrosDto = plainToClass(FiltrosInformeDto, req.query);
            const errors = await validate(filtrosDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => 
                    Object.values(error.constraints || {}).join(', ')
                ).join('; ');
                throw new ValidationError(`Filtros inválidos: ${errorMessages}`);
            }

            // Validar que el curso existe si se proporciona idCurso
            if (filtrosDto.idCurso) {
                const cursoExiste = await informeService.verificarCursoExiste(filtrosDto.idCurso);
                if (!cursoExiste) {
                    throw new NotFoundError(`Curso con ID ${filtrosDto.idCurso}`);
                }
            }

            const informeCompleto = await informeService.obtenerInformeCompleto(filtrosDto);

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: {
                    estadisticas: informeCompleto.estadisticas,
                    filtrosAplicados: informeCompleto.filtrosAplicados,
                    fechaGeneracion: informeCompleto.fechaGeneracion,
                    totalRegistros: informeCompleto.totalRegistros
                }
            });

        } catch (error) {
            logger.error('❌ Error al obtener estadísticas:', error);
            
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.name
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: 'InternalServerError'
                });
            }
        }
    }

    /**
     * GET /api/informes/cursos
     * Obtener lista de cursos disponibles para filtros
     */
    async obtenerCursosDisponibles(_req: Request, res: Response): Promise<void> {
        try {
            logger.info('📚 Solicitud de cursos disponibles');

            const cursos = await informeService.obtenerCursosDisponibles();

            res.status(200).json({
                success: true,
                message: 'Cursos disponibles obtenidos exitosamente',
                data: cursos
            });

        } catch (error) {
            logger.error('❌ Error al obtener cursos disponibles:', error);
            
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.name
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: 'InternalServerError'
                });
            }
        }
    }

    /**
     * POST /api/informes/excel
     * Endpoint específico para generar Excel (método alternativo)
     */
    async generarExcel(req: Request, res: Response): Promise<void> {
        const requestBody = {
            ...req.body,
            formato: FormatoExportacion.EXCEL
        };
        req.body = requestBody;
        await this.generarInforme(req, res);
    }

    /**
     * POST /api/informes/pdf
     * Endpoint específico para generar PDF (método alternativo)
     */
    async generarPDF(req: Request, res: Response): Promise<void> {
        const requestBody = {
            ...req.body,
            formato: FormatoExportacion.PDF
        };
        req.body = requestBody;
        await this.generarInforme(req, res);
    }

    /**
     * GET /api/informes/tipos
     * Obtener tipos de informe disponibles
     */
    async obtenerTiposInforme(_req: Request, res: Response): Promise<void> {
        try {
            const tiposInforme = Object.values(TipoInforme).map(tipo => ({
                valor: tipo,
                etiqueta: this.obtenerEtiquetaTipoInforme(tipo),
                descripcion: this.obtenerDescripcionTipoInforme(tipo)
            }));

            const formatosExportacion = Object.values(FormatoExportacion).map(formato => ({
                valor: formato,
                etiqueta: formato.toUpperCase(),
                tipoMime: formato === FormatoExportacion.EXCEL 
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf'
            }));

            res.status(200).json({
                success: true,
                message: 'Tipos de informe obtenidos exitosamente',
                data: {
                    tiposInforme,
                    formatosExportacion
                }
            });

        } catch (error) {
            logger.error('❌ Error al obtener tipos de informe:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: 'InternalServerError'
            });
        }
    }

    /**
     * Obtener etiqueta legible para tipo de informe
     */
    private obtenerEtiquetaTipoInforme(tipo: TipoInforme): string {
        const etiquetas = {
            [TipoInforme.INSCRIPCIONES]: 'Todas las Inscripciones',
            [TipoInforme.MATRICULADOS]: 'Estudiantes Matriculados',
            [TipoInforme.PAGADOS]: 'Pagos Verificados',
            [TipoInforme.PENDIENTES]: 'Pagos Pendientes'
        };
        return etiquetas[tipo] || tipo;
    }

    /**
     * Obtener descripción para tipo de informe
     */
    private obtenerDescripcionTipoInforme(tipo: TipoInforme): string {
        const descripciones = {
            [TipoInforme.INSCRIPCIONES]: 'Reporte completo de todas las inscripciones registradas',
            [TipoInforme.MATRICULADOS]: 'Estudiantes que han completado el proceso de matrícula',
            [TipoInforme.PAGADOS]: 'Inscripciones con pagos verificados y aprobados',
            [TipoInforme.PENDIENTES]: 'Inscripciones con pagos pendientes de verificación'
        };
        return descripciones[tipo] || '';
    }
}