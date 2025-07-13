import { Curso as PrismaCurso } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { toCursoResponseDto } from "./curso.mapper";

describe('B. Mapper toCursoResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-CUR-001: Mapeo de un curso estándar
    it('MAP-CUR-001: debería mapear correctamente un curso estándar', () => {
      // Arrange
      const fechaInicio = new Date('2025-07-01T00:00:00.000Z');
      const fechaFin = new Date('2025-07-31T00:00:00.000Z');
      const valorCurso = new Decimal(150.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 1,
        nombreCortoCurso: 'JS101',
        nombreCurso: 'Introducción a JavaScript',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso básico de JavaScript para principiantes',
        valorCurso: valorCurso,
        fechaInicioCurso: fechaInicio,
        fechaFinCurso: fechaFin
      };

      // Act
      const result = toCursoResponseDto(prismaCurso);

      // Assert - Verificar cada campo individualmente para evitar problemas de tipo
      expect(result.idCurso).toBe(1);
      expect(result.nombreCortoCurso).toBe('JS101');
      expect(result.nombreCurso).toBe('Introducción a JavaScript');
      expect(result.modalidadCurso).toBe('Virtual');
      expect(result.descripcionCurso).toBe('Curso básico de JavaScript para principiantes');
      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.fechaInicioCurso).toEqual(fechaInicio);
      expect(result.fechaFinCurso).toEqual(fechaFin);
    });

    // MAP-CUR-002: Mapeo con descripción larga
    it('MAP-CUR-002: debería mapear correctamente curso con descripción larga', () => {
      // Arrange
      const fechaInicio = new Date('2025-08-01T00:00:00.000Z');
      const fechaFin = new Date('2025-12-31T00:00:00.000Z');
      const valorCurso = new Decimal(2500.99);
      const descripcionLarga = 'Este es un curso muy completo que abarca múltiples temas avanzados de programación, ' +
        'incluyendo algoritmos, estructuras de datos, patrones de diseño, mejores prácticas de desarrollo, ' +
        'testing, deployment, y mucho más contenido educativo de alta calidad para estudiantes dedicados.';
      
      const prismaCurso: PrismaCurso = {
        idCurso: 999,
        nombreCortoCurso: 'PROG-ADV-2025',
        nombreCurso: 'Programación Avanzada - Bootcamp Completo Full Stack Development',
        modalidadCurso: 'Híbrida',
        descripcionCurso: descripcionLarga,
        valorCurso: valorCurso,
        fechaInicioCurso: fechaInicio,
        fechaFinCurso: fechaFin
      };

      // Act
      const result = toCursoResponseDto(prismaCurso);

      // Assert - Verificar cada campo individualmente
      expect(result.idCurso).toBe(999);
      expect(result.nombreCortoCurso).toBe('PROG-ADV-2025');
      expect(result.nombreCurso).toBe('Programación Avanzada - Bootcamp Completo Full Stack Development');
      expect(result.modalidadCurso).toBe('Híbrida');
      expect(result.descripcionCurso).toBe(descripcionLarga);
      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.fechaInicioCurso).toEqual(fechaInicio);
      expect(result.fechaFinCurso).toEqual(fechaFin);

      // Verificar que no hay truncamiento
      expect(result.descripcionCurso.length).toBe(descripcionLarga.length);
      expect(result.nombreCurso.length).toBeGreaterThan(50);
    });
  });

  describe('Casos de Diferentes Modalidades', () => {
    it('debería mapear correctamente curso presencial', () => {
      const valorCurso = new Decimal(300.00);
      const prismaCurso: PrismaCurso = {
        idCurso: 2,
        nombreCortoCurso: 'PRES-001',
        nombreCurso: 'Curso Presencial de Marketing',
        modalidadCurso: 'Presencial',
        descripcionCurso: 'Curso de marketing presencial',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-07-15T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-08-15T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.modalidadCurso).toBe('Presencial');
      expect(result.valorCurso).toEqual(valorCurso);
    });

    it('debería mapear correctamente curso virtual', () => {
      const valorCurso = new Decimal(200.00);
      const prismaCurso: PrismaCurso = {
        idCurso: 3,
        nombreCortoCurso: 'VIRT-001',
        nombreCurso: 'Curso Virtual de Diseño',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso de diseño completamente online',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-07-20T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-08-20T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.modalidadCurso).toBe('Virtual');
      expect(result.valorCurso).toEqual(valorCurso);
    });

    it('debería mapear correctamente curso híbrido', () => {
      const valorCurso = new Decimal(800.00);
      const prismaCurso: PrismaCurso = {
        idCurso: 4,
        nombreCortoCurso: 'HIB-001',
        nombreCurso: 'Curso Híbrido de Data Science',
        modalidadCurso: 'Híbrida',
        descripcionCurso: 'Curso que combina clases presenciales y virtuales',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-09-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-12-01T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.modalidadCurso).toBe('Híbrida');
      expect(result.valorCurso).toEqual(valorCurso);
    });
  });

  describe('Casos de Valores Límite', () => {
    it('debería mapear correctamente con ID mínimo y valor mínimo', () => {
      const valorCurso = new Decimal(0.01);
      const prismaCurso: PrismaCurso = {
        idCurso: 1,
        nombreCortoCurso: 'A',
        nombreCurso: 'Curso A',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Descripción mínima',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-01-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-01-02T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.idCurso).toBe(1);
      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.nombreCortoCurso).toBe('A');
    });

    it('debería mapear correctamente con valor alto', () => {
      const valorCurso = new Decimal(99999.99);
      const prismaCurso: PrismaCurso = {
        idCurso: 2147483647, // Max INT
        nombreCortoCurso: 'EXPENSIVE',
        nombreCurso: 'Curso Premium Exclusivo',
        modalidadCurso: 'Presencial',
        descripcionCurso: 'Curso de alta gama',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-06-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-12-31T23:59:59.999Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.idCurso).toBe(2147483647);
      expect(result.valorCurso).toEqual(valorCurso);
    });

    it('debería mapear correctamente curso gratuito', () => {
      const valorCurso = new Decimal(0.00);
      const prismaCurso: PrismaCurso = {
        idCurso: 5,
        nombreCortoCurso: 'FREE-001',
        nombreCurso: 'Curso Gratuito Introductorio',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso de introducción completamente gratuito',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-07-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-07-07T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.valorCurso.toNumber()).toBe(0.00);
    });
  });

  describe('Casos de Fechas Especiales', () => {
    it('debería mapear correctamente curso de un día', () => {
      const fecha = new Date('2025-07-15T00:00:00.000Z');
      const valorCurso = new Decimal(100.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 6,
        nombreCortoCurso: 'WORKSHOP',
        nombreCurso: 'Workshop Intensivo',
        modalidadCurso: 'Presencial',
        descripcionCurso: 'Workshop de un día completo',
        valorCurso: valorCurso,
        fechaInicioCurso: fecha,
        fechaFinCurso: fecha
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.fechaInicioCurso).toEqual(fecha);
      expect(result.fechaFinCurso).toEqual(fecha);
      expect(result.fechaInicioCurso.getTime()).toBe(result.fechaFinCurso.getTime());
    });

    it('debería mapear correctamente curso de larga duración', () => {
      const fechaInicio = new Date(2025, 0, 1); // 1 enero 2025 (zona horaria local)
      const fechaFin = new Date(2025, 11, 31); // 31 diciembre 2025 (zona horaria local)
      const valorCurso = new Decimal(5000.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 7,
        nombreCortoCurso: 'ANUAL-2025',
        nombreCurso: 'Programa Anual Completo',
        modalidadCurso: 'Híbrida',
        descripcionCurso: 'Programa de formación de un año completo',
        valorCurso: valorCurso,
        fechaInicioCurso: fechaInicio,
        fechaFinCurso: fechaFin
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.fechaInicioCurso).toEqual(fechaInicio);
      expect(result.fechaFinCurso).toEqual(fechaFin);
      expect(result.fechaFinCurso.getFullYear() - result.fechaInicioCurso.getFullYear()).toBe(0);
    });
  });

  describe('Integridad del Mapeo', () => {
    it('debería mantener la referencia de fechas sin mutar el objeto original', () => {
      const fechaInicio = new Date('2025-07-01T00:00:00.000Z');
      const fechaFin = new Date('2025-07-31T00:00:00.000Z');
      const valorCurso = new Decimal(250.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 9,
        nombreCortoCurso: 'REF-TEST',
        nombreCurso: 'Curso de Prueba de Referencias',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso para probar referencias',
        valorCurso: valorCurso,
        fechaInicioCurso: fechaInicio,
        fechaFinCurso: fechaFin
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.fechaInicioCurso).toEqual(fechaInicio);
      expect(result.fechaFinCurso).toEqual(fechaFin);
      expect(result.fechaInicioCurso.getTime()).toBe(fechaInicio.getTime());
      expect(result.fechaFinCurso.getTime()).toBe(fechaFin.getTime());
      expect(result.valorCurso).toEqual(valorCurso);
    });

    it('debería mapear todos los campos requeridos', () => {
      const valorCurso = new Decimal(500.00);
      const prismaCurso: PrismaCurso = {
        idCurso: 11,
        nombreCortoCurso: 'COMPLETE',
        nombreCurso: 'Curso Completo',
        modalidadCurso: 'Híbrida',
        descripcionCurso: 'Curso con todos los campos',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-09-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-09-30T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      // Verificar que todos los campos están presentes
      expect(result).toHaveProperty('idCurso');
      expect(result).toHaveProperty('nombreCortoCurso');
      expect(result).toHaveProperty('nombreCurso');
      expect(result).toHaveProperty('modalidadCurso');
      expect(result).toHaveProperty('descripcionCurso');
      expect(result).toHaveProperty('valorCurso');
      expect(result).toHaveProperty('fechaInicioCurso');
      expect(result).toHaveProperty('fechaFinCurso');

      // Verificar que no hay campos adicionales
      const resultKeys = Object.keys(result);
      expect(resultKeys).toHaveLength(8);
    });
  });

  describe('Casos de Caracteres Especiales', () => {
    it('debería mapear correctamente nombres con caracteres especiales', () => {
      const nombreEspecial = 'Programación Avanzada: C#, .NET & APIs - ¡Curso Premium!';
      const descripcionEspecial = 'Aprende C#, .NET Framework, APIs REST/GraphQL, y más… ¡100% práctico!';
      const valorCurso = new Decimal(750.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 12,
        nombreCortoCurso: 'C#.NET',
        nombreCurso: nombreEspecial,
        modalidadCurso: 'Virtual',
        descripcionCurso: descripcionEspecial,
        valorCurso: valorCurso,
        fechaInicioCurso: new Date(2025, 9, 1), // Octubre 2025
        fechaFinCurso: new Date(2025, 10, 30) // Noviembre 2025
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.nombreCurso).toBe(nombreEspecial);
      expect(result.descripcionCurso).toBe(descripcionEspecial);
      expect(result.nombreCurso).toContain('C#');
      expect(result.nombreCurso).toContain('¡');
      expect(result.descripcionCurso).toContain('…');
    });

    it('debería mapear correctamente nombres con acentos y ñ', () => {
      const nombreConAcentos = 'Introducción a la Gestión Empresarial Española';
      const descripcionConAcentos = 'Curso especializado en técnicas de gestión, organización y administración de empresas según el modelo español contemporáneo.';
      const valorCurso = new Decimal(600.00);
      
      const prismaCurso: PrismaCurso = {
        idCurso: 13,
        nombreCortoCurso: 'GESTIÓN-ES',
        nombreCurso: nombreConAcentos,
        modalidadCurso: 'Presencial',
        descripcionCurso: descripcionConAcentos,
        valorCurso: valorCurso,
        fechaInicioCurso: new Date(2025, 10, 1), // Noviembre 2025
        fechaFinCurso: new Date(2025, 11, 15) // Diciembre 2025
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.nombreCurso).toBe(nombreConAcentos);
      expect(result.descripcionCurso).toBe(descripcionConAcentos);
      expect(result.nombreCurso).toContain('Introducción');
      expect(result.nombreCurso).toContain('Gestión');
      expect(result.nombreCurso).toContain('Española');
      expect(result.descripcionCurso).toContain('técnicas');
      expect(result.descripcionCurso).toContain('organización');
      expect(result.descripcionCurso).toContain('administración');
    });
  });

  describe('Casos de Precisión Decimal', () => {
    it('debería mantener la precisión decimal correctamente', () => {
      const valorCurso = new Decimal(123.45);
      const prismaCurso: PrismaCurso = {
        idCurso: 14,
        nombreCortoCurso: 'DECIMAL-TEST',
        nombreCurso: 'Curso de Prueba de Decimales',
        modalidadCurso: 'Virtual',
        descripcionCurso: 'Curso para probar precisión decimal',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-08-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-08-31T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.valorCurso.toNumber()).toBe(123.45);
      expect(result.valorCurso.toFixed(2)).toBe('123.45');
    });

    it('debería manejar correctamente valores con muchos decimales', () => {
      const valorCurso = new Decimal(99.99);
      const prismaCurso: PrismaCurso = {
        idCurso: 15,
        nombreCortoCurso: 'PRECISION',
        nombreCurso: 'Curso de Precisión',
        modalidadCurso: 'Híbrida',
        descripcionCurso: 'Curso con valor de alta precisión',
        valorCurso: valorCurso,
        fechaInicioCurso: new Date('2025-09-01T00:00:00.000Z'),
        fechaFinCurso: new Date('2025-09-30T00:00:00.000Z')
      };

      const result = toCursoResponseDto(prismaCurso);

      expect(result.valorCurso).toEqual(valorCurso);
      expect(result.valorCurso.toNumber()).toBe(99.99);
    });
  });
});
