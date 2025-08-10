// Mock del módulo Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCount = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    inscripcion: {
      findMany: mockFindMany,
      count: mockCount,
    },
    curso: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
    },
  })),
}));

// Mock de mappers
const mockToInscripcionInformeDtoArray = jest.fn();
const mockToInformeCompletoDto = jest.fn();
const mockToArchivoInformeDto = jest.fn();
const mockGenerarNombreArchivo = jest.fn();
const mockMapearFiltrosFecha = jest.fn();

jest.mock('@/api/services/mappers/informeMapper/informe.mapper', () => ({
  toInscripcionInformeDtoArray: mockToInscripcionInformeDtoArray,
  toInformeCompletoDto: mockToInformeCompletoDto,
  toArchivoInformeDto: mockToArchivoInformeDto,
  generarNombreArchivo: mockGenerarNombreArchivo,
  mapearFiltrosFecha: mockMapearFiltrosFecha,
}));

// Mock de logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock de jsPDF y exceljs
const mockPDFInstance = {
  text: jest.fn(),
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  autoTable: jest.fn(),
  save: jest.fn(),
  output: jest.fn(() => Buffer.from('fake pdf content')),
};

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => mockPDFInstance);
});

const mockWorkbookInstance = {
  addWorksheet: jest.fn(() => ({
    addRow: jest.fn(),
    columns: [],
    eachRow: jest.fn(),
  })),
  xlsx: {
    writeBuffer: jest.fn(() => Promise.resolve(Buffer.from('fake excel content'))),
  },
};

jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => mockWorkbookInstance),
}));

import { InformeService } from './informe.service';
import { TipoInforme, FiltrosInformeDto } from '@/api/dtos/informeDto/informe.dto';
import { AppError } from '@/utils/errorTypes';
import { logger } from '@/utils/logger';

describe('InformeService', () => {
  let informeService: InformeService;

  beforeEach(() => {
    informeService = new InformeService();
    jest.clearAllMocks();
    
    // Mock por defecto de mappers
    mockMapearFiltrosFecha.mockImplementation((filtros) => ({
      fechaInicio: filtros.fechaInicio ? new Date(filtros.fechaInicio) : undefined,
      fechaFin: filtros.fechaFin ? new Date(filtros.fechaFin) : undefined,
      idCurso: filtros.idCurso,
      matricula: filtros.matricula,
      verificacionPago: filtros.verificacionPago,
    }));
  });

  describe('obtenerDatosInscripciones', () => {
    const mockInscripciones = [
      {
        idInscripcion: 1,
        fechaInscripcion: new Date('2024-01-15'),
        matricula: true,
        persona: {
          nombres: 'Juan',
          apellidos: 'Pérez',
          correoElectronico: 'juan@test.com',
          telefono: '1234567890',
          cedula: '1234567890',
        },
        curso: {
          nombre: 'Curso de Prueba',
          fechaVencimiento: new Date('2024-12-31'),
        },
        comprobante: {
          tipo: 'Transferencia',
          monto: 100.00,
        },
        descuento: {
          nombre: 'Descuento Estudiante',
          porcentaje: 10,
        },
        facturas: [
          {
            montoTotal: 90.00,
            verificacionPago: true,
          },
        ],
      },
    ];

    const mockInscripcionesDto = [
      {
        idInscripcion: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '1234567890',
        cedula: '1234567890',
        nombreCurso: 'Curso de Prueba',
        fechaInscripcion: new Date('2024-01-15'),
        matricula: true,
        tipoComprobante: 'Transferencia',
        montoComprobante: 100,
        verificacionPago: true,
        montoTotal: 90,
        descuento: 'Descuento Estudiante (10%)',
        porcentajeDescuento: 10,
        fechaVencimiento: new Date('2024-12-31'),
        estadoPago: 'Verificado',
      },
    ];

    // SRV-INF-001: Obtener datos de inscripciones sin filtros
    it('SRV-INF-001: debería obtener datos de inscripciones sin filtros', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockInscripciones);
      mockToInscripcionInformeDtoArray.mockReturnValue(mockInscripcionesDto);

      // Act
      const result = await informeService.obtenerDatosInscripciones();

      // Assert
      expect(mockMapearFiltrosFecha).toHaveBeenCalledWith({});
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { fechaInscripcion: 'desc' },
      });
      expect(mockToInscripcionInformeDtoArray).toHaveBeenCalledWith(mockInscripciones);
      expect(result).toEqual(mockInscripcionesDto);
      expect(logger.info).toHaveBeenCalledWith('📊 Obteniendo datos para informe con filtros:', {});
      expect(logger.info).toHaveBeenCalledWith('✅ Obtenidos 1 registros para el informe');
    });

    // SRV-INF-002: Aplicar filtros de fecha correctamente
    it('SRV-INF-002: debería aplicar filtros de fecha correctamente', async () => {
      // Arrange
      const filtros: FiltrosInformeDto = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };
      const filtrosMapeados = {
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-01-31'),
      };

      mockMapearFiltrosFecha.mockReturnValue(filtrosMapeados);
      mockFindMany.mockResolvedValue([]);
      mockToInscripcionInformeDtoArray.mockReturnValue([]);

      // Act
      await informeService.obtenerDatosInscripciones(filtros);

      // Assert
      expect(mockMapearFiltrosFecha).toHaveBeenCalledWith(filtros);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          fechaInscripcion: {
            gte: new Date('2024-01-01'),
            lte: expect.any(Date), // Fecha fin con hora 23:59:59
          },
        },
        include: expect.any(Object),
        orderBy: { fechaInscripcion: 'desc' },
      });
    });

    // SRV-INF-003: Aplicar filtro de curso correctamente
    it('SRV-INF-003: debería aplicar filtro de curso correctamente', async () => {
      // Arrange
      const filtros: FiltrosInformeDto = { idCurso: 1 };
      const filtrosMapeados = { idCurso: 1 };

      mockMapearFiltrosFecha.mockReturnValue(filtrosMapeados);
      mockFindMany.mockResolvedValue([]);
      mockToInscripcionInformeDtoArray.mockReturnValue([]);

      // Act
      await informeService.obtenerDatosInscripciones(filtros);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        include: expect.any(Object),
        orderBy: { fechaInscripcion: 'desc' },
      });
    });

    // SRV-INF-004: Manejar errores de base de datos
    it('SRV-INF-004: debería manejar errores de base de datos correctamente', async () => {
      // Arrange
      const dbError = new Error('Error de conexión');
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(informeService.obtenerDatosInscripciones()).rejects.toThrow(AppError);
      await expect(informeService.obtenerDatosInscripciones()).rejects.toThrow('Error al obtener datos para el informe');
      
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Error al obtener datos de inscripciones para informe:',
        dbError
      );
    });
  });

  describe('obtenerInformeCompleto', () => {
    const mockDatos = [
      {
        idInscripcion: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '1234567890',
        cedula: '1234567890',
        nombreCurso: 'Curso de Prueba',
        fechaInscripcion: new Date('2024-01-15'),
        matricula: true,
        tipoComprobante: 'Transferencia',
        montoComprobante: 100,
        verificacionPago: true,
        montoTotal: 90,
        descuento: 'Descuento Estudiante (10%)',
        porcentajeDescuento: 10,
        fechaVencimiento: new Date('2024-12-31'),
        estadoPago: 'Verificado',
      },
    ];

    const mockInformeCompleto = {
      estadisticas: {
        totalInscripciones: 1,
        matriculados: 1,
        noMatriculados: 0,
        pagosVerificados: 1,
        pagosPendientes: 0,
        montoTotalComprobantes: 100,
        promedioMonto: 100,
        cursosUnicos: 1,
        tiposComprobante: { 'Transferencia': 1 },
        inscripcionesPorCurso: { 'Curso de Prueba': 1 },
      },
      inscripciones: mockDatos,
      filtrosAplicados: {},
      fechaGeneracion: expect.any(Date),
      totalRegistros: 1,
    };

    // SRV-INF-005: Generar informe completo con estadísticas
    it('SRV-INF-005: debería generar un informe completo con estadísticas', async () => {
      // Arrange
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockResolvedValue(mockDatos);
      mockToInformeCompletoDto.mockReturnValue(mockInformeCompleto);

      const filtros: FiltrosInformeDto = {};

      // Act
      const result = await informeService.obtenerInformeCompleto(filtros);

      // Assert
      expect(informeService.obtenerDatosInscripciones).toHaveBeenCalledWith(filtros);
      expect(mockToInformeCompletoDto).toHaveBeenCalledWith(mockDatos, filtros);
      expect(result).toEqual(mockInformeCompleto);
    });

    // SRV-INF-006: Manejar errores en informe completo
    it('SRV-INF-006: debería manejar errores al generar informe completo', async () => {
      // Arrange
      const error = new Error('Error en datos');
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockRejectedValue(error);

      // Act & Assert
      await expect(informeService.obtenerInformeCompleto()).rejects.toThrow(AppError);
      await expect(informeService.obtenerInformeCompleto()).rejects.toThrow('Error al generar el informe completo');
      
      expect(logger.error).toHaveBeenCalledWith('❌ Error al generar informe completo:', error);
    });
  });

  describe('generarInformeExcel', () => {
    const mockDatos = [
      {
        idInscripcion: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '1234567890',
        cedula: '1234567890',
        nombreCurso: 'Curso de Prueba',
        fechaInscripcion: new Date('2024-01-15'),
        matricula: true,
        tipoComprobante: 'Transferencia',
        montoComprobante: 100,
        verificacionPago: true,
        montoTotal: 90,
        descuento: 'Descuento Estudiante (10%)',
        porcentajeDescuento: 10,
        fechaVencimiento: new Date('2024-12-31'),
        estadoPago: 'Verificado',
      },
    ];

    const mockArchivoInfo = {
      nombreArchivo: 'informe_inscripciones_2024-01-15.xlsx',
      tipoArchivo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tamanoBytes: 1024,
      fechaGeneracion: new Date(),
      filtrosAplicados: {},
    };

    // SRV-INF-007: Generar informe Excel válido
    it('SRV-INF-007: debería generar un informe Excel válido', async () => {
      // Arrange
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockResolvedValue(mockDatos);
      mockGenerarNombreArchivo.mockReturnValue('informe_inscripciones_2024-01-15.xlsx');
      mockToArchivoInformeDto.mockReturnValue(mockArchivoInfo);

      const filtros: FiltrosInformeDto = {};

      // Act
      const result = await informeService.generarInformeExcel(TipoInforme.INSCRIPCIONES, filtros);

      // Assert
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.archivoInfo).toEqual(mockArchivoInfo);
      expect(logger.info).toHaveBeenCalledWith('📊 Generando informe Excel:', {
        tipoInforme: TipoInforme.INSCRIPCIONES,
        filtros: filtros
      });
      expect(logger.info).toHaveBeenCalledWith('✅ Informe Excel generado exitosamente');
    });

    // SRV-INF-008: Manejar errores en generación de Excel
    it('SRV-INF-008: debería manejar errores en la generación de Excel', async () => {
      // Arrange
      const error = new Error('Error de datos');
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockRejectedValue(error);

      // Act & Assert
      await expect(informeService.generarInformeExcel(TipoInforme.INSCRIPCIONES)).rejects.toThrow(AppError);
      await expect(informeService.generarInformeExcel(TipoInforme.INSCRIPCIONES)).rejects.toThrow('Error al generar el informe Excel');
      
      expect(logger.error).toHaveBeenCalledWith('❌ Error al generar informe Excel:', error);
    });
  });

  describe('generarInformePDF', () => {
    const mockDatos = [
      {
        idInscripcion: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '1234567890',
        cedula: '1234567890',
        nombreCurso: 'Curso de Prueba',
        fechaInscripcion: new Date('2024-01-15'),
        matricula: true,
        tipoComprobante: 'Transferencia',
        montoComprobante: 100,
        verificacionPago: true,
        montoTotal: 90,
        descuento: 'Descuento Estudiante (10%)',
        porcentajeDescuento: 10,
        fechaVencimiento: new Date('2024-12-31'),
        estadoPago: 'Verificado',
      },
    ];

    const mockArchivoInfo = {
      nombreArchivo: 'informe_inscripciones_2024-01-15.pdf',
      tipoArchivo: 'application/pdf',
      tamanoBytes: 2048,
      fechaGeneracion: new Date(),
      filtrosAplicados: {},
    };

    // SRV-INF-009: Generar informe PDF válido
    it('SRV-INF-009: debería generar un informe PDF válido', async () => {
      // Arrange
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockResolvedValue(mockDatos);
      mockGenerarNombreArchivo.mockReturnValue('informe_inscripciones_2024-01-15.pdf');
      mockToArchivoInformeDto.mockReturnValue(mockArchivoInfo);

      const filtros: FiltrosInformeDto = {};

      // Act
      const result = await informeService.generarInformePDF(TipoInforme.INSCRIPCIONES, filtros);

      // Assert
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.archivoInfo).toEqual(mockArchivoInfo);
      expect(logger.info).toHaveBeenCalledWith('📄 Generando informe PDF:', {
        tipoInforme: TipoInforme.INSCRIPCIONES,
        filtros: filtros
      });
      expect(logger.info).toHaveBeenCalledWith('✅ Informe PDF generado exitosamente');
    });

    // SRV-INF-010: Manejar errores en generación de PDF
    it('SRV-INF-010: debería manejar errores en la generación de PDF', async () => {
      // Arrange
      const error = new Error('Error de datos');
      jest.spyOn(informeService, 'obtenerDatosInscripciones').mockRejectedValue(error);

      // Act & Assert
      await expect(informeService.generarInformePDF(TipoInforme.INSCRIPCIONES)).rejects.toThrow(AppError);
      await expect(informeService.generarInformePDF(TipoInforme.INSCRIPCIONES)).rejects.toThrow('Error al generar el informe PDF');
      
      expect(logger.error).toHaveBeenCalledWith('❌ Error al generar informe PDF:', error);
    });
  });

  describe('verificarCursoExiste', () => {
    // SRV-INF-011: Verificar curso existente
    it('SRV-INF-011: debería devolver true si el curso existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue({ idCurso: 1 });

      // Act
      const result = await informeService.verificarCursoExiste(1);

      // Assert
      expect(result).toBe(true);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 1 },
        select: { idCurso: true },
      });
    });

    // SRV-INF-012: Verificar curso inexistente
    it('SRV-INF-012: debería devolver false si el curso no existe', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act
      const result = await informeService.verificarCursoExiste(999);

      // Assert
      expect(result).toBe(false);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { idCurso: 999 },
        select: { idCurso: true },
      });
    });

    // SRV-INF-013: Manejar errores al verificar curso
    it('SRV-INF-013: debería manejar errores y devolver false', async () => {
      // Arrange
      const dbError = new Error('Error de base de datos');
      mockFindUnique.mockRejectedValue(dbError);

      // Act
      const result = await informeService.verificarCursoExiste(1);

      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error al verificar existencia del curso:', dbError);
    });
  });

  describe('obtenerCursosDisponibles', () => {
    const mockCursos = [
      { idCurso: 1, nombre: 'Curso A' },
      { idCurso: 2, nombre: 'Curso B' },
    ];

    // SRV-INF-014: Obtener lista de cursos ordenada
    it('SRV-INF-014: debería obtener lista de cursos ordenada por nombre', async () => {
      // Arrange
      mockFindMany.mockResolvedValue(mockCursos);

      // Act
      const result = await informeService.obtenerCursosDisponibles();

      // Assert
      expect(result).toEqual(mockCursos);
      expect(mockFindMany).toHaveBeenCalledWith({
        select: {
          idCurso: true,
          nombreCurso: true,
        },
        orderBy: {
          nombreCurso: 'asc',
        },
      });
    });

    // SRV-INF-015: Manejar errores al obtener cursos
    it('SRV-INF-015: debería manejar errores al obtener cursos disponibles', async () => {
      // Arrange
      const dbError = new Error('Error de base de datos');
      mockFindMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(informeService.obtenerCursosDisponibles()).rejects.toThrow(AppError);
      await expect(informeService.obtenerCursosDisponibles()).rejects.toThrow('Error al obtener lista de cursos');
      
      expect(logger.error).toHaveBeenCalledWith('Error al obtener cursos disponibles:', dbError);
    });
  });
});