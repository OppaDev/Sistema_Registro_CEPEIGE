import { PrismaClient } from "@prisma/client";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { logger } from "@/utils/logger";
import { AppError } from "@/utils/errorTypes";
import { 
    InscripcionInformeDto, 
    InformeCompletoDto,
    FiltrosInformeDto,
    TipoInforme,
    ArchivoInformeDto
} from "@/api/dtos/informeDto/informe.dto";
import {
    toInscripcionInformeDtoArray,
    toInformeCompletoDto,
    toArchivoInformeDto,
    generarNombreArchivo,
    mapearFiltrosFecha
} from "@/api/services/mappers/informeMapper/informe.mapper";

const prisma = new PrismaClient();

export class InformeService {

    /**
     * Obtener datos de inscripciones para informes
     */
    async obtenerDatosInscripciones(filtros: FiltrosInformeDto = {}): Promise<InscripcionInformeDto[]> {
        try {
            logger.info('📊 Obteniendo datos para informe con filtros:', filtros);

            const filtrosMapeados = mapearFiltrosFecha(filtros);
            const whereClause: any = {};

            // Aplicar filtros de fecha
            if (filtrosMapeados.fechaInicio || filtrosMapeados.fechaFin) {
                whereClause.fechaInscripcion = {};
                if (filtrosMapeados.fechaInicio) {
                    whereClause.fechaInscripcion.gte = filtrosMapeados.fechaInicio;
                }
                if (filtrosMapeados.fechaFin) {
                    // Agregar 23:59:59 al final del día
                    const fechaFinConHora = new Date(filtrosMapeados.fechaFin);
                    fechaFinConHora.setHours(23, 59, 59, 999);
                    whereClause.fechaInscripcion.lte = fechaFinConHora;
                }
            }

            // Filtro por curso
            if (filtrosMapeados.idCurso) {
                whereClause.idCurso = filtrosMapeados.idCurso;
            }

            // Filtro por matrícula
            if (filtrosMapeados.matricula !== undefined) {
                whereClause.matricula = filtrosMapeados.matricula;
            }

            // Obtener inscripciones con todas las relaciones
            let inscripciones = await prisma.inscripcion.findMany({
                where: whereClause,
                include: {
                    curso: {
                        select: {
                            nombreCurso: true,
                            fechaFinCurso: true
                        }
                    },
                    persona: {
                        select: {
                            nombres: true,
                            apellidos: true,
                            correo: true,
                            numTelefono: true,
                            ciPasaporte: true
                        }
                    },
                    datosFacturacion: true,
                    comprobante: {
                        select: {
                            tipoArchivo: true,
                            nombreArchivo: true
                        }
                    },
                    descuento: {
                        select: {
                            tipoDescuento: true,
                            porcentajeDescuento: true
                        }
                    },
                    facturas: {
                        select: {
                            valorPagado: true,
                            verificacionPago: true
                        }
                    }
                },
                orderBy: {
                    fechaInscripcion: 'desc'
                }
            });

            // Filtrar por verificación de pago después de obtener los datos
            if (filtrosMapeados.verificacionPago !== undefined) {
                inscripciones = inscripciones.filter(inscripcion => 
                    inscripcion.facturas.some(factura => factura.verificacionPago === filtrosMapeados.verificacionPago)
                );
            }

            const inscripcionesDto = toInscripcionInformeDtoArray(inscripciones as any);
            
            logger.info(`✅ Obtenidos ${inscripcionesDto.length} registros para el informe`);
            return inscripcionesDto;

        } catch (error) {
            logger.error('❌ Error al obtener datos de inscripciones para informe:', error);
            throw new AppError('Error al obtener datos para el informe', 500);
        }
    }

    /**
     * Obtener informe completo con estadísticas
     */
    async obtenerInformeCompleto(filtros: FiltrosInformeDto = {}): Promise<InformeCompletoDto> {
        try {
            const inscripciones = await this.obtenerDatosInscripciones(filtros);
            return toInformeCompletoDto(inscripciones, filtros);
        } catch (error) {
            logger.error('❌ Error al generar informe completo:', error);
            throw new AppError('Error al generar el informe completo', 500);
        }
    }

    /**
     * Generar informe en Excel
     */
    async generarInformeExcel(tipoInforme: TipoInforme, filtros: FiltrosInformeDto = {}): Promise<{ buffer: Buffer; archivoInfo: ArchivoInformeDto }> {
        try {
            logger.info('📊 Generando informe Excel:', { tipoInforme, filtros });

            // Aplicar filtros específicos según tipo de informe
            const filtrosEspecificos = this.aplicarFiltrosPorTipo(tipoInforme, filtros);
            const datos = await this.obtenerDatosInscripciones(filtrosEspecificos);
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte de Inscripciones');

            // Configurar propiedades del documento
            workbook.creator = 'Sistema CEPEIGE';
            workbook.lastModifiedBy = 'Sistema CEPEIGE';
            workbook.created = new Date();

            // Título principal
            worksheet.mergeCells('A1:M1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = `REPORTE DE ${tipoInforme.toUpperCase()} - CEPEIGE`;
            titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Información del reporte
            let filaInfo = 3;
            worksheet.mergeCells(`A${filaInfo}:M${filaInfo}`);
            const infoCell = worksheet.getCell(`A${filaInfo}`);
            infoCell.value = `Generado el: ${new Date().toLocaleString('es-ES')} | Total de registros: ${datos.length}`;
            infoCell.font = { size: 10, italic: true };
            infoCell.alignment = { horizontal: 'center' };

            // Headers de la tabla
            const headers = [
                'ID', 'Nombre Completo', 'Email', 'Teléfono', 'Cédula', 'Curso', 
                'Fecha Inscripción', 'Matriculado', 'Tipo Comprobante', 'Monto Comprobante',
                'Estado Pago', 'Monto Total', 'Descuento'
            ];

            const headerRow = worksheet.getRow(5);
            headers.forEach((header, index) => {
                const cell = headerRow.getCell(index + 1);
                cell.value = header;
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Datos
            datos.forEach((inscripcion, index) => {
                const row = worksheet.getRow(6 + index);
                const rowData = [
                    inscripcion.idInscripcion,
                    inscripcion.nombreCompleto,
                    inscripcion.email,
                    inscripcion.telefono,
                    inscripcion.cedula,
                    inscripcion.nombreCurso,
                    inscripcion.fechaInscripcion.toLocaleDateString('es-ES'),
                    inscripcion.matricula ? 'SÍ' : 'NO',
                    inscripcion.tipoComprobante,
                    `$${inscripcion.montoComprobante.toFixed(2)}`,
                    inscripcion.estadoPago,
                    inscripcion.montoTotal ? `$${inscripcion.montoTotal.toFixed(2)}` : 'N/A',
                    inscripcion.descuento || 'Sin descuento'
                ];

                rowData.forEach((value, colIndex) => {
                    const cell = row.getCell(colIndex + 1);
                    cell.value = value;
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    // Colores alternos para las filas
                    if (index % 2 === 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
                    }

                    // Centrar ciertas columnas
                    if ([0, 6, 7, 8, 10].includes(colIndex)) {
                        cell.alignment = { horizontal: 'center' };
                    }
                });
            });

            // Ajustar ancho de columnas
            const columnWidths = [8, 25, 30, 15, 12, 25, 15, 12, 18, 15, 15, 15, 20];
            columnWidths.forEach((width, index) => {
                worksheet.getColumn(index + 1).width = width;
            });

            // Resumen al final
            const summaryRow = 6 + datos.length + 2;
            worksheet.mergeCells(`A${summaryRow}:M${summaryRow}`);
            const summaryCell = worksheet.getCell(`A${summaryRow}`);
            const matriculados = datos.filter(d => d.matricula).length;
            const pagosVerificados = datos.filter(d => d.verificacionPago).length;
            summaryCell.value = `RESUMEN: Total: ${datos.length} | Matriculados: ${matriculados} | Pagos Verificados: ${pagosVerificados}`;
            summaryCell.font = { bold: true, size: 12 };
            summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
            summaryCell.alignment = { horizontal: 'center' };

            const buffer = await workbook.xlsx.writeBuffer();
            const nombreArchivo = generarNombreArchivo(tipoInforme, 'excel', filtros);
            const archivoInfo = toArchivoInformeDto(nombreArchivo, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', Buffer.from(buffer), filtros);

            logger.info('✅ Informe Excel generado exitosamente');
            return { buffer: Buffer.from(buffer), archivoInfo };

        } catch (error) {
            logger.error('❌ Error al generar informe Excel:', error);
            throw new AppError('Error al generar el informe Excel', 500);
        }
    }

    /**
     * Generar informe en PDF
     */
    async generarInformePDF(tipoInforme: TipoInforme, filtros: FiltrosInformeDto = {}): Promise<{ buffer: Buffer; archivoInfo: ArchivoInformeDto }> {
        try {
            logger.info('📄 Generando informe PDF:', { tipoInforme, filtros });

            // Aplicar filtros específicos según tipo de informe
            const filtrosEspecificos = this.aplicarFiltrosPorTipo(tipoInforme, filtros);
            const datos = await this.obtenerDatosInscripciones(filtrosEspecificos);
            
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Título
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`REPORTE DE ${tipoInforme.toUpperCase()} - CEPEIGE`, 148, 20, { align: 'center' });

            // Información del reporte
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 148, 30, { align: 'center' });
            doc.text(`Total de registros: ${datos.length}`, 148, 35, { align: 'center' });

            // Preparar datos para la tabla con validación de datos
            const tableData = datos.map(inscripcion => {
                try {
                    return [
                        inscripcion.idInscripcion?.toString() || 'N/A',
                        inscripcion.nombreCompleto || 'N/A',
                        inscripcion.email || 'N/A',
                        inscripcion.nombreCurso || 'N/A',
                        inscripcion.fechaInscripcion ? inscripcion.fechaInscripcion.toLocaleDateString('es-ES') : 'N/A',
                        inscripcion.matricula ? 'SÍ' : 'NO',
                        inscripcion.tipoComprobante || 'N/A',
                        inscripcion.montoComprobante ? `$${parseFloat(inscripcion.montoComprobante.toString()).toFixed(2)}` : '$0.00',
                        inscripcion.estadoPago || 'N/A'
                    ];
                } catch (error) {
                    logger.warn('Error procesando inscripción para PDF:', error);
                    return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', '$0.00', 'N/A'];
                }
            });

            // Configurar tabla con manejo de errores
            try {
                if (typeof (doc as any).autoTable === 'function') {
                    (doc as any).autoTable({
                        head: [['ID', 'Nombre', 'Email', 'Curso', 'Fecha', 'Matriculado', 'Comprobante', 'Monto', 'Estado Pago']],
                        body: tableData,
                        startY: 45,
                        styles: {
                            fontSize: 7,
                            cellPadding: 1.5,
                            overflow: 'linebreak',
                            halign: 'center'
                        },
                        headStyles: {
                            fillColor: [70, 173, 71],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 8
                        },
                        alternateRowStyles: {
                            fillColor: [242, 242, 242]
                        },
                        columnStyles: {
                            0: { cellWidth: 15 },
                            1: { cellWidth: 35, halign: 'left' },
                            2: { cellWidth: 40, halign: 'left' },
                            3: { cellWidth: 30, halign: 'left' },
                            4: { cellWidth: 20 },
                            5: { cellWidth: 18 },
                            6: { cellWidth: 22 },
                            7: { cellWidth: 18 },
                            8: { cellWidth: 22 }
                        },
                        margin: { left: 10, right: 10 },
                    });
                } else {
                    throw new Error('autoTable function is not available. jspdf-autotable may not be properly loaded.');
                }
            } catch (tableError) {
                logger.error('Error al crear tabla en PDF:', tableError);
                // Crear tabla simple como fallback
                let yPosition = 50;
                doc.setFontSize(8);
                doc.text('ID | Nombre | Email | Curso | Fecha | Matriculado | Monto | Estado', 20, yPosition);
                yPosition += 5;
                
                tableData.forEach((row) => {
                    if (yPosition > 200) { // Nueva página si es necesario
                        doc.addPage();
                        yPosition = 20;
                    }
                    const rowText = row.join(' | ');
                    doc.text(rowText.substring(0, 100), 20, yPosition); // Limitar longitud
                    yPosition += 4;
                });
            }

            // Resumen con posición segura
            const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 150;
            const matriculados = datos.filter(d => d.matricula).length;
            const pagosVerificados = datos.filter(d => d.verificacionPago).length;
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN:', 20, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total de inscripciones: ${datos.length}`, 20, finalY + 8);
            doc.text(`Estudiantes matriculados: ${matriculados}`, 20, finalY + 16);
            doc.text(`Pagos verificados: ${pagosVerificados}`, 20, finalY + 24);

            // Pie de página - usar método seguro para múltiples páginas
            try {
                const pageCount = (doc as any).internal?.pages?.length ? (doc as any).internal.pages.length - 1 : 1;
                for (let i = 1; i <= pageCount; i++) {
                    if (typeof doc.setPage === 'function') {
                        doc.setPage(i);
                    }
                    doc.setFontSize(8);
                    doc.text(`Página ${i} de ${pageCount}`, 148, 200, { align: 'center' });
                    doc.text('Sistema de Registro CEPEIGE', 148, 205, { align: 'center' });
                }
            } catch (pageError) {
                logger.warn('Error al agregar pie de página, continuando sin él:', pageError);
                // Continuar sin pie de página
            }

            // Generar buffer PDF de manera segura
            let pdfBuffer: Buffer;
            try {
                const pdfOutput = doc.output('arraybuffer');
                pdfBuffer = Buffer.from(pdfOutput);
                
                if (pdfBuffer.length === 0) {
                    throw new Error('PDF buffer está vacío');
                }
                
            } catch (bufferError) {
                logger.warn('Error generando arraybuffer, intentando con string:', bufferError);
                try {
                    // Fallback: usar output string y convertir
                    const pdfString = doc.output('datauristring');
                    const base64Data = pdfString.split(',')[1];
                    pdfBuffer = Buffer.from(base64Data, 'base64');
                } catch (fallbackError) {
                    logger.error('Error en fallback de PDF:', fallbackError);
                    throw new Error('No se pudo generar el buffer PDF');
                }
            }

            const nombreArchivo = generarNombreArchivo(tipoInforme, 'pdf', filtros);
            const archivoInfo = toArchivoInformeDto(nombreArchivo, 'application/pdf', pdfBuffer, filtros);

            logger.info('✅ Informe PDF generado exitosamente', { 
                size: pdfBuffer.length,
                filename: nombreArchivo 
            });
            return { buffer: pdfBuffer, archivoInfo };

        } catch (error) {
            logger.error('❌ Error al generar informe PDF:', error);
            
            // Proporcionar más detalle del error si es posible
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            throw new AppError(`Error al generar el informe PDF: ${errorMessage}`, 500);
        }
    }

    /**
     * Aplicar filtros específicos según el tipo de informe
     */
    private aplicarFiltrosPorTipo(tipoInforme: TipoInforme, filtros: FiltrosInformeDto): FiltrosInformeDto {
        const filtrosEspecificos = { ...filtros };

        switch (tipoInforme) {
            case TipoInforme.MATRICULADOS:
                filtrosEspecificos.matricula = true;
                break;
            case TipoInforme.PAGADOS:
                filtrosEspecificos.verificacionPago = true;
                break;
            case TipoInforme.PENDIENTES:
                filtrosEspecificos.verificacionPago = false;
                break;
            case TipoInforme.INSCRIPCIONES:
            default:
                // No aplicar filtros adicionales para inscripciones generales
                break;
        }

        return filtrosEspecificos;
    }

    /**
     * Verificar si existe un curso por ID
     */
    async verificarCursoExiste(idCurso: number): Promise<boolean> {
        try {
            const curso = await prisma.curso.findUnique({
                where: { idCurso },
                select: { idCurso: true }
            });
            return !!curso;
        } catch (error) {
            logger.error('Error al verificar existencia del curso:', error);
            return false;
        }
    }

    /**
     * Obtener lista de cursos disponibles para filtros
     */
    async obtenerCursosDisponibles(): Promise<{ idCurso: number; nombreCurso: string }[]> {
        try {
            const cursos = await prisma.curso.findMany({
                select: {
                    idCurso: true,
                    nombreCurso: true
                },
                orderBy: {
                    nombreCurso: 'asc'
                }
            });
            return cursos;
        } catch (error) {
            logger.error('Error al obtener cursos disponibles:', error);
            throw new AppError('Error al obtener lista de cursos', 500);
        }
    }
}