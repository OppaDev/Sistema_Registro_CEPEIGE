import { 
  toInscripcionMoodleResponseDto, 
  toInscripcionMoodleWithInscripcionDto,
  type PrismaInscripcionMoodleConInscripcion 
} from './inscripcionMoodle.mapper';
import { 
  InscripcionMoodle as PrismaInscripcionMoodle, 
  Inscripcion as PrismaInscripcion,
  DatosPersonales as PrismaDatosPersonales,
  Curso as PrismaCurso
} from "@prisma/client";
import { EstadoMatriculaMoodle } from "@/api/dtos/integrationDto/inscripcionMoodle.dto";
import { Decimal } from '@prisma/client/runtime/library';

describe('InscripcionMoodle Mapper', () => {
  
  const mockPrismaInscripcionMoodle: PrismaInscripcionMoodle = {
    idInscripcionMoodle: 1,
    idInscripcion: 2,
    moodleUserId: 12345,
    moodleUsername: 'juan.perez',
    estadoMatricula: 'MATRICULADO',
    fechaMatricula: new Date('2025-01-15T10:00:00Z'),
    fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
    notas: 'Usuario matriculado exitosamente',
  };

  const mockPrismaDatosPersonales: PrismaDatosPersonales = {
    idPersona: 1,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    correo: 'juan.perez@email.com',
    numTelefono: '+593987654321',
    ciPasaporte: '1234567890',
    pais: 'Ecuador',
    provinciaEstado: 'Pichincha',
    ciudad: 'Quito',
    profesion: 'Desarrollador',
    institucion: 'CEPEIGE',
  };

  const mockPrismaCurso: PrismaCurso = {
    idCurso: 2,
    nombreCortoCurso: 'JS-2024',
    nombreCurso: 'JavaScript Básico',
    modalidadCurso: 'Virtual',
    descripcionCurso: 'Curso de JavaScript desde cero',
    valorCurso: new Decimal(299.99),
    enlacePago: 'https://payment.example.com/test-course',
    fechaInicioCurso: new Date('2025-01-15T00:00:00Z'),
    fechaFinCurso: new Date('2025-03-15T00:00:00Z'),
  };

  const mockPrismaInscripcion: PrismaInscripcion = {
    idInscripcion: 2,
    idPersona: 1,
    idCurso: 2,
    idDescuento: null,
    idFacturacion: 1,
    idComprobante: 1,
    matricula: true,
    fechaInscripcion: new Date('2025-01-10T09:00:00Z'),
  };

  const mockPrismaInscripcionMoodleConInscripcion: PrismaInscripcionMoodleConInscripcion = {
    ...mockPrismaInscripcionMoodle,
    inscripcion: {
      ...mockPrismaInscripcion,
      persona: mockPrismaDatosPersonales,
      curso: mockPrismaCurso,
    },
  };

  describe('toInscripcionMoodleResponseDto', () => {
    
    // MAP-IMO-001: Mapear inscripción Moodle básica correctamente
    it('MAP-IMO-001: debe mapear correctamente una inscripción Moodle básica', () => {
      const result = toInscripcionMoodleResponseDto(mockPrismaInscripcionMoodle);
      
      expect(result).toEqual({
        idInscripcionMoodle: 1,
        idInscripcion: 2,
        moodleUserId: 12345,
        moodleUsername: 'juan.perez',
        estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
        fechaMatricula: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        notas: 'Usuario matriculado exitosamente',
      });
    });

    // MAP-IMO-002: Mapear con estado SUSPENDIDO
    it('MAP-IMO-002: debe mapear correctamente estado SUSPENDIDO', () => {
      const inscripcionSuspendida = { 
        ...mockPrismaInscripcionMoodle, 
        estadoMatricula: 'SUSPENDIDO',
        notas: 'Suspendido por falta de pago'
      };
      
      const result = toInscripcionMoodleResponseDto(inscripcionSuspendida);
      
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.SUSPENDIDO);
      expect(result.notas).toBe('Suspendido por falta de pago');
    });

    // MAP-IMO-003: Mapear con estado COMPLETADO
    it('MAP-IMO-003: debe mapear correctamente estado COMPLETADO', () => {
      const inscripcionCompletada = { 
        ...mockPrismaInscripcionMoodle, 
        estadoMatricula: 'COMPLETADO',
        notas: 'Curso completado satisfactoriamente'
      };
      
      const result = toInscripcionMoodleResponseDto(inscripcionCompletada);
      
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.COMPLETADO);
      expect(result.notas).toBe('Curso completado satisfactoriamente');
    });

    // MAP-IMO-004: Mapear con notas null
    it('MAP-IMO-004: debe manejar correctamente notas null', () => {
      const inscripcionSinNotas = { ...mockPrismaInscripcionMoodle, notas: null };
      
      const result = toInscripcionMoodleResponseDto(inscripcionSinNotas);
      
      expect(result.notas).toBe(null);
      expect(result.idInscripcionMoodle).toBe(1);
    });

    // MAP-IMO-005: Mantener todas las propiedades requeridas
    it('MAP-IMO-005: debe mantener todas las propiedades requeridas', () => {
      const result = toInscripcionMoodleResponseDto(mockPrismaInscripcionMoodle);
      
      expect(result).toHaveProperty('idInscripcionMoodle');
      expect(result).toHaveProperty('idInscripcion');
      expect(result).toHaveProperty('moodleUserId');
      expect(result).toHaveProperty('moodleUsername');
      expect(result).toHaveProperty('estadoMatricula');
      expect(result).toHaveProperty('fechaMatricula');
      expect(result).toHaveProperty('fechaActualizacion');
      expect(result).toHaveProperty('notas');
    });
  });

  describe('toInscripcionMoodleWithInscripcionDto', () => {
    
    // MAP-IMO-006: Mapear inscripción Moodle con inscripción completa
    it('MAP-IMO-006: debe mapear correctamente inscripción Moodle con inscripción', () => {
      const result = toInscripcionMoodleWithInscripcionDto(mockPrismaInscripcionMoodleConInscripcion);
      
      expect(result).toEqual({
        idInscripcionMoodle: 1,
        idInscripcion: 2,
        moodleUserId: 12345,
        moodleUsername: 'juan.perez',
        estadoMatricula: EstadoMatriculaMoodle.MATRICULADO,
        fechaMatricula: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-15T12:00:00Z'),
        notas: 'Usuario matriculado exitosamente',
        inscripcion: {
          idInscripcion: 2,
          matricula: true,
          fechaInscripcion: new Date('2025-01-10T09:00:00Z'),
          persona: {
            nombres: 'Juan Carlos',
            apellidos: 'Pérez González',
            correo: 'juan.perez@email.com',
            ciPasaporte: '1234567890',
          },
          curso: {
            idCurso: 2,
            nombreCortoCurso: 'JS-2024',
            nombreCurso: 'JavaScript Básico',
          },
        },
      });
    });

    // MAP-IMO-007: Mapear con inscripción no matriculada
    it('MAP-IMO-007: debe mapear correctamente inscripción no matriculada', () => {
      const inscripcionNoMatriculada = {
        ...mockPrismaInscripcionMoodleConInscripcion,
        inscripcion: {
          ...mockPrismaInscripcionMoodleConInscripcion.inscripcion,
          matricula: false,
        },
      };
      
      const result = toInscripcionMoodleWithInscripcionDto(inscripcionNoMatriculada);
      
      expect(result.inscripcion.matricula).toBe(false);
      expect(result.idInscripcionMoodle).toBe(1);
    });

    // MAP-IMO-008: Mapear con diferentes datos de persona
    it('MAP-IMO-008: debe mapear correctamente diferentes datos de persona', () => {
      const personaDiferente = {
        ...mockPrismaDatosPersonales,
        nombres: 'María Elena',
        apellidos: 'García López',
        correo: 'maria.garcia@email.com',
        ciPasaporte: '0987654321',
      };
      
      const inscripcionConPersonaDiferente = {
        ...mockPrismaInscripcionMoodleConInscripcion,
        inscripcion: {
          ...mockPrismaInscripcionMoodleConInscripcion.inscripcion,
          persona: personaDiferente,
        },
      };
      
      const result = toInscripcionMoodleWithInscripcionDto(inscripcionConPersonaDiferente);
      
      expect(result.inscripcion.persona.nombres).toBe('María Elena');
      expect(result.inscripcion.persona.apellidos).toBe('García López');
      expect(result.inscripcion.persona.correo).toBe('maria.garcia@email.com');
      expect(result.inscripcion.persona.ciPasaporte).toBe('0987654321');
    });

    // MAP-IMO-009: Mapear con curso diferente
    it('MAP-IMO-009: debe mapear correctamente curso diferente', () => {
      const cursoDiferente = {
        ...mockPrismaCurso,
        nombreCortoCurso: 'REACT-2025',
        nombreCurso: 'React Avanzado',
        idCurso: 3,
      };
      
      const inscripcionConCursoDiferente = {
        ...mockPrismaInscripcionMoodleConInscripcion,
        inscripcion: {
          ...mockPrismaInscripcionMoodleConInscripcion.inscripcion,
          curso: cursoDiferente,
        },
      };
      
      const result = toInscripcionMoodleWithInscripcionDto(inscripcionConCursoDiferente);
      
      expect(result.inscripcion.curso.idCurso).toBe(3);
      expect(result.inscripcion.curso.nombreCortoCurso).toBe('REACT-2025');
      expect(result.inscripcion.curso.nombreCurso).toBe('React Avanzado');
    });

    // MAP-IMO-010: Mantener todas las propiedades requeridas del grupo y relacionadas
    it('MAP-IMO-010: debe mantener todas las propiedades requeridas', () => {
      const result = toInscripcionMoodleWithInscripcionDto(mockPrismaInscripcionMoodleConInscripcion);
      
      // Propiedades principales
      expect(result).toHaveProperty('idInscripcionMoodle');
      expect(result).toHaveProperty('idInscripcion');
      expect(result).toHaveProperty('moodleUserId');
      expect(result).toHaveProperty('moodleUsername');
      expect(result).toHaveProperty('estadoMatricula');
      expect(result).toHaveProperty('fechaMatricula');
      expect(result).toHaveProperty('fechaActualizacion');
      expect(result).toHaveProperty('notas');
      expect(result).toHaveProperty('inscripcion');
      
      // Propiedades de la inscripción
      expect(result.inscripcion).toHaveProperty('idInscripcion');
      expect(result.inscripcion).toHaveProperty('matricula');
      expect(result.inscripcion).toHaveProperty('fechaInscripcion');
      expect(result.inscripcion).toHaveProperty('persona');
      expect(result.inscripcion).toHaveProperty('curso');
      
      // Propiedades de la persona
      expect(result.inscripcion.persona).toHaveProperty('nombres');
      expect(result.inscripcion.persona).toHaveProperty('apellidos');
      expect(result.inscripcion.persona).toHaveProperty('correo');
      expect(result.inscripcion.persona).toHaveProperty('ciPasaporte');
      
      // Propiedades del curso
      expect(result.inscripcion.curso).toHaveProperty('idCurso');
      expect(result.inscripcion.curso).toHaveProperty('nombreCortoCurso');
      expect(result.inscripcion.curso).toHaveProperty('nombreCurso');
    });

    // MAP-IMO-011: Verificar que no se incluyen campos no especificados
    it('MAP-IMO-011: debe incluir solo los campos especificados de persona y curso', () => {
      const result = toInscripcionMoodleWithInscripcionDto(mockPrismaInscripcionMoodleConInscripcion);
      
      // Verificar que persona no incluye campos no especificados
      expect(result.inscripcion.persona).not.toHaveProperty('numTelefono');
      expect(result.inscripcion.persona).not.toHaveProperty('direccion');
      expect(result.inscripcion.persona).not.toHaveProperty('ciudad');
      expect(result.inscripcion.persona).not.toHaveProperty('pais');
      expect(result.inscripcion.persona).not.toHaveProperty('fechaNacimiento');
      
      // Verificar que curso no incluye campos no especificados
      expect(result.inscripcion.curso).not.toHaveProperty('modalidadCurso');
      expect(result.inscripcion.curso).not.toHaveProperty('descripcionCurso');
      expect(result.inscripcion.curso).not.toHaveProperty('valorCurso');
      expect(result.inscripcion.curso).not.toHaveProperty('fechaInicioCurso');
      expect(result.inscripcion.curso).not.toHaveProperty('fechaFinCurso');
    });

    // MAP-IMO-012: Mapear con estado DESMATRICULADO y notas específicas
    it('MAP-IMO-012: debe mapear correctamente estado DESMATRICULADO', () => {
      const inscripcionDesmatriculada = {
        ...mockPrismaInscripcionMoodleConInscripcion,
        estadoMatricula: 'DESMATRICULADO',
        notas: 'Desmatriculado a solicitud del estudiante',
      };
      
      const result = toInscripcionMoodleWithInscripcionDto(inscripcionDesmatriculada);
      
      expect(result.estadoMatricula).toBe(EstadoMatriculaMoodle.DESMATRICULADO);
      expect(result.notas).toBe('Desmatriculado a solicitud del estudiante');
    });
  });
});