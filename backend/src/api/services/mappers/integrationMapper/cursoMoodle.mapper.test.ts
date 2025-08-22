import { CursoMoodle as PrismaCursoMoodle, Curso as PrismaCurso } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { 
  toCursoMoodleResponseDto, 
  toCursoMoodleWithCursoDto,
  PrismaCursoMoodleConCurso 
} from './cursoMoodle.mapper';

describe('CursoMoodle Mapper', () => {
  
  const baseCursoMoodle: PrismaCursoMoodle = {
    idCursoMoodle: 1,
    idCurso: 1,
    moodleCursoId: 101,
    nombreCortoMoodle: 'JS101',
    fechaCreacion: new Date('2025-01-01T10:00:00.000Z'),
    fechaActualizacion: new Date('2025-01-02T15:30:00.000Z'),
    activo: true
  };

  const baseCurso: PrismaCurso = {
    idCurso: 1,
    nombreCortoCurso: 'JS',
    nombreCurso: 'Curso de JavaScript',
    modalidadCurso: 'Virtual',
    valorCurso: new Decimal(150.00),
    enlacePago: 'https://payment.example.com/test-course',
    fechaInicioCurso: new Date('2025-02-01'),
    fechaFinCurso: new Date('2025-02-28'),
    descripcionCurso: 'Curso completo de JavaScript'
  };

  describe('toCursoMoodleResponseDto', () => {
    // MAP-CM-001: Mapeo básico de CursoMoodle
    it('MAP-CM-001: debe mapear correctamente un CursoMoodle básico', () => {
      // Act
      const result = toCursoMoodleResponseDto(baseCursoMoodle);

      // Assert
      expect(result).toEqual({
        idCursoMoodle: 1,
        idCurso: 1,
        moodleCursoId: 101,
        nombreCortoMoodle: 'JS101',
        fechaCreacion: new Date('2025-01-01T10:00:00.000Z'),
        fechaActualizacion: new Date('2025-01-02T15:30:00.000Z'),
        activo: true
      });
    });

    // MAP-CM-002: Mapeo con curso inactivo
    it('MAP-CM-002: debe mapear correctamente un CursoMoodle inactivo', () => {
      // Arrange
      const cursoMoodleInactivo: PrismaCursoMoodle = {
        ...baseCursoMoodle,
        idCursoMoodle: 2,
        activo: false
      };

      // Act
      const result = toCursoMoodleResponseDto(cursoMoodleInactivo);

      // Assert
      expect(result.activo).toBe(false);
      expect(result.idCursoMoodle).toBe(2);
    });

    // MAP-CM-003: Mapeo con valores de borde
    it('MAP-CM-003: debe mapear correctamente con valores de borde', () => {
      // Arrange
      const cursoMoodleBorde: PrismaCursoMoodle = {
        idCursoMoodle: 999999,
        idCurso: 999999,
        moodleCursoId: 999999,
        nombreCortoMoodle: 'CURSO_MOODLE_CON_NOMBRE_MUY_LARGO_PARA_PRUEBAS_DE_LIMITE',
        fechaCreacion: new Date('1990-01-01T00:00:00.000Z'),
        fechaActualizacion: new Date('2099-12-31T23:59:59.999Z'),
        activo: true
      };

      // Act
      const result = toCursoMoodleResponseDto(cursoMoodleBorde);

      // Assert
      expect(result.idCursoMoodle).toBe(999999);
      expect(result.moodleCursoId).toBe(999999);
      expect(result.nombreCortoMoodle).toBe('CURSO_MOODLE_CON_NOMBRE_MUY_LARGO_PARA_PRUEBAS_DE_LIMITE');
      expect(result.fechaCreacion).toEqual(new Date('1990-01-01T00:00:00.000Z'));
      expect(result.fechaActualizacion).toEqual(new Date('2099-12-31T23:59:59.999Z'));
    });

    // MAP-CM-004: Verificar que el mapper no modifica el objeto original
    it('MAP-CM-004: debe no modificar el objeto Prisma original', () => {
      // Arrange
      const original: PrismaCursoMoodle = { ...baseCursoMoodle };
      const originalCopy = { ...original };

      // Act
      const result = toCursoMoodleResponseDto(original);

      // Assert
      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original);
    });

    // MAP-CM-005: Verificar que todos los campos están presentes
    it('MAP-CM-005: debe transferir todos los campos sin pérdida de información', () => {
      // Act
      const result = toCursoMoodleResponseDto(baseCursoMoodle);

      // Assert
      const expectedKeys = [
        'idCursoMoodle',
        'idCurso',
        'moodleCursoId',
        'nombreCortoMoodle',
        'fechaCreacion',
        'fechaActualizacion',
        'activo'
      ];

      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result)).toHaveLength(expectedKeys.length);
    });
  });

  describe('toCursoMoodleWithCursoDto', () => {
    const cursoMoodleConCurso: PrismaCursoMoodleConCurso = {
      ...baseCursoMoodle,
      curso: baseCurso
    };

    // MAP-CM-006: Mapeo completo con relación de curso
    it('MAP-CM-006: debe mapear correctamente CursoMoodle con curso relacionado', () => {
      // Act
      const result = toCursoMoodleWithCursoDto(cursoMoodleConCurso);

      // Assert
      expect(result).toEqual({
        idCursoMoodle: 1,
        idCurso: 1,
        moodleCursoId: 101,
        nombreCortoMoodle: 'JS101',
        fechaCreacion: new Date('2025-01-01T10:00:00.000Z'),
        fechaActualizacion: new Date('2025-01-02T15:30:00.000Z'),
        activo: true,
        curso: {
          idCurso: 1,
          nombreCortoCurso: 'JS',
          nombreCurso: 'Curso de JavaScript',
          modalidadCurso: 'Virtual',
          fechaInicioCurso: new Date('2025-02-01'),
          fechaFinCurso: new Date('2025-02-28')
        }
      });
    });

    // MAP-CM-007: Verificar que el curso anidado está correctamente mapeado
    it('MAP-CM-007: debe mapear correctamente los campos del curso anidado', () => {
      // Act
      const result = toCursoMoodleWithCursoDto(cursoMoodleConCurso);

      // Assert
      expect(result.curso).toBeDefined();
      expect(result.curso.idCurso).toBe(1);
      expect(result.curso.nombreCortoCurso).toBe('JS');
      expect(result.curso.nombreCurso).toBe('Curso de JavaScript');
      expect(result.curso.modalidadCurso).toBe('Virtual');
      expect(result.curso.fechaInicioCurso).toEqual(new Date('2025-02-01'));
      expect(result.curso.fechaFinCurso).toEqual(new Date('2025-02-28'));

      // Verificar que no incluye campos no necesarios del curso
      expect(result.curso).not.toHaveProperty('valorCurso');
      expect(result.curso).not.toHaveProperty('descripcionCurso');
    });

    // MAP-CM-008: Mapeo con curso que tiene fechas límite
    it('MAP-CM-008: debe mapear correctamente con fechas de inicio y fin específicas', () => {
      // Arrange
      const cursoConFechas: PrismaCurso = {
        ...baseCurso,
        fechaInicioCurso: new Date('2025-06-01'),
        fechaFinCurso: new Date('2025-08-31')
      };

      const cursoMoodleConFechas: PrismaCursoMoodleConCurso = {
        ...baseCursoMoodle,
        curso: cursoConFechas
      };

      // Act
      const result = toCursoMoodleWithCursoDto(cursoMoodleConFechas);

      // Assert
      expect(result.curso.fechaInicioCurso).toEqual(new Date('2025-06-01'));
      expect(result.curso.fechaFinCurso).toEqual(new Date('2025-08-31'));
    });

    // MAP-CM-009: Verificar que no se modifican los objetos originales
    it('MAP-CM-009: debe no modificar los objetos Prisma originales', () => {
      // Arrange
      const original: PrismaCursoMoodleConCurso = {
        ...cursoMoodleConCurso,
        curso: { ...baseCurso }
      };
      const originalCopy = {
        ...original,
        curso: { ...original.curso }
      };

      // Act
      const result = toCursoMoodleWithCursoDto(original);

      // Assert
      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original);
      expect(result.curso).not.toBe(original.curso);
    });

    // MAP-CM-010: Verificar estructura completa del DTO
    it('MAP-CM-010: debe tener la estructura correcta del DTO completo', () => {
      // Act
      const result = toCursoMoodleWithCursoDto(cursoMoodleConCurso);

      // Assert - Campos del CursoMoodle
      const expectedCursoMoodleKeys = [
        'idCursoMoodle',
        'idCurso',
        'moodleCursoId',
        'nombreCortoMoodle',
        'fechaCreacion',
        'fechaActualizacion',
        'activo',
        'curso'
      ];

      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedCursoMoodleKeys));
      expect(Object.keys(result)).toHaveLength(expectedCursoMoodleKeys.length);

      // Campos del Curso anidado
      const expectedCursoKeys = [
        'idCurso',
        'nombreCortoCurso',
        'nombreCurso',
        'modalidadCurso',
        'fechaInicioCurso',
        'fechaFinCurso'
      ];

      expect(Object.keys(result.curso)).toEqual(expect.arrayContaining(expectedCursoKeys));
      expect(Object.keys(result.curso)).toHaveLength(expectedCursoKeys.length);
    });
  });

  describe('Casos de Caracteres Especiales', () => {
    // MAP-CM-011: Mapeo con caracteres especiales en nombres
    it('MAP-CM-011: debe mapear correctamente nombres con caracteres especiales', () => {
      // Arrange
      const cursoMoodleEspecial: PrismaCursoMoodle = {
        ...baseCursoMoodle,
        nombreCortoMoodle: 'JS_Ñandú_#1_2025-Ω'
      };

      // Act
      const result = toCursoMoodleResponseDto(cursoMoodleEspecial);

      // Assert
      expect(result.nombreCortoMoodle).toBe('JS_Ñandú_#1_2025-Ω');
    });

    // MAP-CM-012: Mapeo con curso que tiene caracteres especiales
    it('MAP-CM-012: debe mapear correctamente curso con caracteres especiales', () => {
      // Arrange
      const cursoEspecial: PrismaCurso = {
        ...baseCurso,
        nombreCortoCurso: 'JS-Ñ',
        nombreCurso: 'Curso de JavaScript & TypeScript Ñandú áéíóú',
        modalidadCurso: 'Híbrido (Presencial + Virtual)'
      };

      const cursoMoodleConCursoEspecial: PrismaCursoMoodleConCurso = {
        ...baseCursoMoodle,
        curso: cursoEspecial
      };

      // Act
      const result = toCursoMoodleWithCursoDto(cursoMoodleConCursoEspecial);

      // Assert
      expect(result.curso.nombreCortoCurso).toBe('JS-Ñ');
      expect(result.curso.nombreCurso).toBe('Curso de JavaScript & TypeScript Ñandú áéíóú');
      expect(result.curso.modalidadCurso).toBe('Híbrido (Presencial + Virtual)');
    });
  });
});
