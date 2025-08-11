import {
  toInscripcionInformeDto,
  toInscripcionInformeDtoArray,
  toEstadisticasInformeDto,
  toInformeCompletoDto,
  toArchivoInformeDto,
  generarNombreArchivo,
  mapearFiltrosFecha,
  type PrismaInscripcionInforme
} from './informe.mapper';
import { FiltrosInformeDto } from '@/api/dtos/informeDto/informe.dto';

describe('Informe Mapper', () => {
  
  const mockPrismaInscripcionInforme: PrismaInscripcionInforme = {
    idInscripcion: 1,
    fechaInscripcion: new Date('2025-01-15T10:00:00Z'),
    matricula: true,
    persona: {
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      correo: 'juan.perez@email.com',
      numTelefono: '+593987654321',
      ciPasaporte: '1234567890'
    },
    curso: {
      nombreCurso: 'JavaScript Básico',
      fechaFinCurso: new Date('2025-03-15T00:00:00Z')
    },
    comprobante: {
      tipoArchivo: 'pdf',
      nombreArchivo: 'comprobante.pdf'
    },
    descuento: {
      tipoDescuento: 'Estudiante',
      porcentajeDescuento: 15
    },
    facturas: [{
      valorPagado: 254.99,
      verificacionPago: true
    }]
  };

  const mockFiltrosInforme: FiltrosInformeDto = {
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    idCurso: 1,
    matricula: true,
    verificacionPago: true
  };

  describe('toInscripcionInformeDto', () => {
    
    // MAP-INF-001: Mapear inscripción completa correctamente
    it('MAP-INF-001: debe mapear inscripción completa correctamente', () => {
      const result = toInscripcionInformeDto(mockPrismaInscripcionInforme);
      
      expect(result).toEqual({
        idInscripcion: 1,
        nombreCompleto: 'Juan Carlos Pérez González',
        email: 'juan.perez@email.com',
        telefono: '+593987654321',
        cedula: '1234567890',
        nombreCurso: 'JavaScript Básico',
        fechaInscripcion: new Date('2025-01-15T10:00:00Z'),
        matricula: true,
        tipoComprobante: 'pdf',
        montoComprobante: 254.99,
        verificacionPago: true,
        montoTotal: 254.99,
        descuento: 'Estudiante (15%)',
        porcentajeDescuento: 15,
        fechaVencimiento: new Date('2025-03-15T00:00:00Z'),
        estadoPago: 'Verificado'
      });
    });

    // MAP-INF-002: Mapear sin descuento
    it('MAP-INF-002: debe mapear correctamente inscripción sin descuento', () => {
      const inscripcionSinDescuento = { ...mockPrismaInscripcionInforme, descuento: null };
      
      const result = toInscripcionInformeDto(inscripcionSinDescuento);
      
      expect(result.descuento).toBe('');
      expect(result.porcentajeDescuento).toBe(0);
    });

    // MAP-INF-003: Mapear sin facturas (pago pendiente)
    it('MAP-INF-003: debe mapear correctamente inscripción sin facturas', () => {
      const inscripcionSinFacturas = { ...mockPrismaInscripcionInforme, facturas: [] };
      
      const result = toInscripcionInformeDto(inscripcionSinFacturas);
      
      expect(result.estadoPago).toBe('Pendiente');
      expect(result.montoComprobante).toBe(0);
      expect(result.montoTotal).toBe(0);
      expect(result.verificacionPago).toBe(false);
    });

    // MAP-INF-004: Mapear con factura no verificada
    it('MAP-INF-004: debe mapear correctamente pago en revisión', () => {
      const inscripcionEnRevision = {
        ...mockPrismaInscripcionInforme,
        facturas: [{ valorPagado: 299.99, verificacionPago: false }]
      };
      
      const result = toInscripcionInformeDto(inscripcionEnRevision);
      
      expect(result.estadoPago).toBe('En revisión');
      expect(result.verificacionPago).toBe(false);
      expect(result.montoComprobante).toBe(299.99);
    });

    // MAP-INF-005: Mapear sin fecha de fin de curso
    it('MAP-INF-005: debe manejar curso sin fecha de fin', () => {
      const cursoSinFechaFin = { 
        ...mockPrismaInscripcionInforme, 
        curso: { nombreCurso: mockPrismaInscripcionInforme.curso.nombreCurso }
      } as PrismaInscripcionInforme; // omitimos fechaFinCurso para simular ausencia
      
      const result = toInscripcionInformeDto(cursoSinFechaFin);
      
      expect(result.fechaVencimiento).toBeInstanceOf(Date);
      expect(result.fechaVencimiento.getTime()).toBeGreaterThan(Date.now() - 1000);
    });

    // MAP-INF-006: Mapear matricula false
    it('MAP-INF-006: debe mapear correctamente inscripción no matriculada', () => {
      const inscripcionNoMatriculada = { ...mockPrismaInscripcionInforme, matricula: false };
      
      const result = toInscripcionInformeDto(inscripcionNoMatriculada);
      
      expect(result.matricula).toBe(false);
    });
  });

  describe('toInscripcionInformeDtoArray', () => {
    
    // MAP-INF-007: Mapear array de inscripciones
    it('MAP-INF-007: debe mapear array de inscripciones correctamente', () => {
      const inscripcion2 = { 
        ...mockPrismaInscripcionInforme, 
        idInscripcion: 2,
        persona: { ...mockPrismaInscripcionInforme.persona, nombres: 'María' }
      };
      const arrayInscripciones = [mockPrismaInscripcionInforme, inscripcion2];
      
      const result = toInscripcionInformeDtoArray(arrayInscripciones);
      
      expect(result).toHaveLength(2);
      expect(result[0].idInscripcion).toBe(1);
      expect(result[1].idInscripcion).toBe(2);
      expect(result[1].nombreCompleto).toContain('María');
    });

    // MAP-INF-008: Mapear array vacío
    it('MAP-INF-008: debe manejar array vacío correctamente', () => {
      const result = toInscripcionInformeDtoArray([]);
      
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toEstadisticasInformeDto', () => {
    
    const inscripcionesTest = [
      {
        idInscripcion: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan@email.com',
        telefono: '+593987654321',
        cedula: '1234567890',
        nombreCurso: 'JavaScript Básico',
        fechaInscripcion: new Date(),
        matricula: true,
        tipoComprobante: 'pdf',
        montoComprobante: 299.99,
        verificacionPago: true,
        montoTotal: 299.99,
        descuento: '',
        porcentajeDescuento: 0,
        fechaVencimiento: new Date(),
        estadoPago: 'Verificado'
      },
      {
        idInscripcion: 2,
        nombreCompleto: 'María García',
        email: 'maria@email.com',
        telefono: '+593987654322',
        cedula: '1234567891',
        nombreCurso: 'React Avanzado',
        fechaInscripcion: new Date(),
        matricula: false,
        tipoComprobante: 'imagen',
        montoComprobante: 399.99,
        verificacionPago: false,
        montoTotal: 399.99,
        descuento: 'Estudiante (10%)',
        porcentajeDescuento: 10,
        fechaVencimiento: new Date(),
        estadoPago: 'Pendiente'
      }
    ];

    // MAP-INF-009: Generar estadísticas completas
    it('MAP-INF-009: debe generar estadísticas completas correctamente', () => {
      const result = toEstadisticasInformeDto(inscripcionesTest);
      
      expect(result).toEqual({
        totalInscripciones: 2,
        matriculados: 1,
        noMatriculados: 1,
        pagosVerificados: 1,
        pagosPendientes: 1,
        montoTotalComprobantes: 699.98,
        promedioMonto: 349.99,
        cursosUnicos: 2,
        tiposComprobante: {
          'pdf': 1,
          'imagen': 1
        },
        inscripcionesPorCurso: {
          'JavaScript Básico': 1,
          'React Avanzado': 1
        }
      });
    });

    // MAP-INF-010: Estadísticas con array vacío
    it('MAP-INF-010: debe manejar array vacío sin errores', () => {
      const result = toEstadisticasInformeDto([]);
      
      expect(result).toEqual({
        totalInscripciones: 0,
        matriculados: 0,
        noMatriculados: 0,
        pagosVerificados: 0,
        pagosPendientes: 0,
        montoTotalComprobantes: 0,
        promedioMonto: 0,
        cursosUnicos: 0,
        tiposComprobante: {},
        inscripcionesPorCurso: {}
      });
    });

    // MAP-INF-011: Estadísticas con inscripciones del mismo curso
    it('MAP-INF-011: debe agrupar correctamente inscripciones del mismo curso', () => {
      const inscripcionesMismoCurso = [
        { ...inscripcionesTest[0] },
        { ...inscripcionesTest[0], idInscripcion: 2, nombreCompleto: 'Pedro López' }
      ];
      
      const result = toEstadisticasInformeDto(inscripcionesMismoCurso);
      
      expect(result.totalInscripciones).toBe(2);
      expect(result.cursosUnicos).toBe(1);
      expect(result.inscripcionesPorCurso['JavaScript Básico']).toBe(2);
    });
  });

  describe('toInformeCompletoDto', () => {
    
    // MAP-INF-012: Crear informe completo
    it('MAP-INF-012: debe crear informe completo correctamente', () => {
      const inscripciones = [toInscripcionInformeDto(mockPrismaInscripcionInforme)];
      
      const result = toInformeCompletoDto(inscripciones, mockFiltrosInforme);
      
      expect(result).toHaveProperty('estadisticas');
      expect(result).toHaveProperty('inscripciones');
      expect(result).toHaveProperty('filtrosAplicados');
      expect(result).toHaveProperty('fechaGeneracion');
      expect(result).toHaveProperty('totalRegistros');
      
      expect(result.inscripciones).toHaveLength(1);
      expect(result.totalRegistros).toBe(1);
      expect(result.filtrosAplicados).toEqual(mockFiltrosInforme);
      expect(result.fechaGeneracion).toBeInstanceOf(Date);
    });
  });

  describe('toArchivoInformeDto', () => {
    
    // MAP-INF-013: Crear DTO de archivo
    it('MAP-INF-013: debe crear DTO de archivo correctamente', () => {
      const buffer = Buffer.from('test content');
      const nombreArchivo = 'informe_test.pdf';
      
      const result = toArchivoInformeDto(nombreArchivo, 'pdf', buffer, mockFiltrosInforme);
      
      expect(result).toEqual({
        nombreArchivo: 'informe_test.pdf',
        tipoArchivo: 'pdf',
        tamanoBytes: buffer.length,
        fechaGeneracion: expect.any(Date),
        filtrosAplicados: mockFiltrosInforme
      });
      expect(result.tamanoBytes).toBe(12); // 'test content'.length
    });
  });

  describe('generarNombreArchivo', () => {
    
    // MAP-INF-014: Generar nombre archivo Excel básico
    it('MAP-INF-014: debe generar nombre de archivo Excel básico', () => {
      const result = generarNombreArchivo('inscripciones', 'excel', {});
      
      expect(result).toMatch(/^informe_inscripciones_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    // MAP-INF-015: Generar nombre archivo PDF con filtros
    it('MAP-INF-015: debe generar nombre de archivo PDF con filtros', () => {
      const filtros = {
        idCurso: 1,
        matricula: true,
        verificacionPago: false
      };
      
      const result = generarNombreArchivo('reportes', 'pdf', filtros);
      
      expect(result).toMatch(/^informe_reportes_\d{4}-\d{2}-\d{2}_curso1_matriculados_pendientes\.pdf$/);
    });

    // MAP-INF-016: Generar nombre con todos los filtros
    it('MAP-INF-016: debe incluir todos los filtros en el nombre', () => {
      const filtrosTodos = {
        idCurso: 5,
        matricula: false,
        verificacionPago: true,
        fechaInicio: '2025-01-01',
        fechaFin: '2025-12-31'
      };
      
      const result = generarNombreArchivo('completo', 'excel', filtrosTodos);
      
      expect(result).toContain('_curso5_');
      expect(result).toContain('_no_matriculados_');
      expect(result).toContain('_pagados');
  expect(result).toMatch(/\.xlsx$/);
    });

    // MAP-INF-017: Generar nombre sin filtros opcionales
    it('MAP-INF-017: debe generar nombre sin filtros opcionales undefined', () => {
      const filtrosOpcionales = {
        fechaInicio: '2025-01-01',
        fechaFin: '2025-12-31'
      };
      
      const result = generarNombreArchivo('basico', 'pdf', filtrosOpcionales);
      
      expect(result).toMatch(/^informe_basico_\d{4}-\d{2}-\d{2}\.pdf$/);
      expect(result).not.toContain('_curso');
      expect(result).not.toContain('_matriculados');
      expect(result).not.toContain('_pagados');
    });
  });

  describe('mapearFiltrosFecha', () => {
    
    // MAP-INF-018: Mapear filtros con fechas
    it('MAP-INF-018: debe mapear filtros de fecha correctamente', () => {
      const filtrosConFechas = {
        fechaInicio: '2025-01-01',
        fechaFin: '2025-12-31',
        idCurso: 1,
        matricula: true,
        verificacionPago: false
      };
      
      const result = mapearFiltrosFecha(filtrosConFechas);
      
      expect(result).toEqual({
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
        idCurso: 1,
        matricula: true,
        verificacionPago: false
      });
    });

    // MAP-INF-019: Mapear filtros sin fechas
    it('MAP-INF-019: debe mapear filtros sin fechas correctamente', () => {
      const filtrosSinFechas = {
        idCurso: 2,
        matricula: false
      };
      
      const result = mapearFiltrosFecha(filtrosSinFechas);
      
      expect(result).toEqual({
        idCurso: 2,
        matricula: false
      });
      expect(result).not.toHaveProperty('fechaInicio');
      expect(result).not.toHaveProperty('fechaFin');
    });

    // MAP-INF-020: Mapear filtros vacíos
    it('MAP-INF-020: debe manejar filtros vacíos correctamente', () => {
      const result = mapearFiltrosFecha({});
      
      expect(result).toEqual({});
    });

    // MAP-INF-021: Mapear con algunos undefined
    it('MAP-INF-021: debe omitir campos undefined correctamente', () => {
  const filtrosParciales: Partial<FiltrosInformeDto> = {
        fechaInicio: '2025-06-01',
        idCurso: 3,
        verificacionPago: true
      };
      
      const result = mapearFiltrosFecha(filtrosParciales);
      
      expect(result).toEqual({
        fechaInicio: new Date('2025-06-01'),
        idCurso: 3,
        verificacionPago: true
      });
      expect(result).not.toHaveProperty('matricula');
    });
  });
});