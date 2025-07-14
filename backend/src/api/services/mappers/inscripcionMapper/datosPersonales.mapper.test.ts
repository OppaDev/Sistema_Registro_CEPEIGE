import { DatosPersonales as PrismaDatosPersonales } from "@prisma/client";
import { toDatosPersonalesResponseDto } from "./datosPersonales.mapper";

describe('D. Mapper toDatosPersonalesResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-DP-001: Mapeo de datos personales estándar
    it('MAP-DP-001: debería mapear correctamente datos personales estándar', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 1,
        ciPasaporte: '1234567890',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        numTelefono: '+593-2-123-4567',
        correo: 'juan.perez@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero de Sistemas',
        institucion: 'Universidad Central del Ecuador'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert
      expect(result).toEqual({
        idPersona: 1,
        ciPasaporte: '1234567890',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        numTelefono: '+593-2-123-4567',
        correo: 'juan.perez@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero de Sistemas',
        institucion: 'Universidad Central del Ecuador'
      });

      // Verificar que todos los campos estén presentes
      expect(result.idPersona).toBe(1);
      expect(result.ciPasaporte).toBe('1234567890');
      expect(result.nombres).toBe('Juan Carlos');
      expect(result.apellidos).toBe('Pérez González');
      expect(result.numTelefono).toBe('+593-2-123-4567');
      expect(result.correo).toBe('juan.perez@email.com');
      expect(result.pais).toBe('Ecuador');
      expect(result.provinciaEstado).toBe('Pichincha');
      expect(result.ciudad).toBe('Quito');
      expect(result.profesion).toBe('Ingeniero de Sistemas');
      expect(result.institucion).toBe('Universidad Central del Ecuador');
    });

    // MAP-PER-002: Mapeo con valores de borde (ej. nombres y apellidos muy largos)
    it('MAP-PER-002: debería mapear correctamente con valores de borde', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 999999,
        ciPasaporte: 'AB123456789',
        nombres: 'María Fernanda Esperanza del Carmen',
        apellidos: 'Vásquez Rodríguez de la Torre Mendoza',
        numTelefono: '+593-99-999-9999',
        correo: 'maria.fernanda.esperanza.del.carmen@universidad-tecnologica-internacional.edu.ec',
        pais: 'Ecuador',
        provinciaEstado: 'Provincia de Santo Domingo de los Tsáchilas',
        ciudad: 'Santo Domingo de los Colorados',
        profesion: 'Doctora en Ciencias de la Computación e Ingeniería de Software',
        institucion: 'Universidad Tecnológica Empresarial de Quito - Sede Santo Domingo'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert
      expect(result.idPersona).toBe(999999);
      expect(result.ciPasaporte).toBe('AB123456789');
      expect(result.nombres).toBe('María Fernanda Esperanza del Carmen');
      expect(result.apellidos).toBe('Vásquez Rodríguez de la Torre Mendoza');
      expect(result.numTelefono).toBe('+593-99-999-9999');
      expect(result.correo).toBe('maria.fernanda.esperanza.del.carmen@universidad-tecnologica-internacional.edu.ec');
      expect(result.pais).toBe('Ecuador');
      expect(result.provinciaEstado).toBe('Provincia de Santo Domingo de los Tsáchilas');
      expect(result.ciudad).toBe('Santo Domingo de los Colorados');
      expect(result.profesion).toBe('Doctora en Ciencias de la Computación e Ingeniería de Software');
      expect(result.institucion).toBe('Universidad Tecnológica Empresarial de Quito - Sede Santo Domingo');
    });
  });

  describe('Casos de Caracteres Especiales', () => {
    // MAP-PER-003: Mapeo con caracteres especiales (acentos, ñ, etc.)
    it('MAP-PER-003: debería mapear correctamente con caracteres especiales', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 10,
        ciPasaporte: '0987654321',
        nombres: 'José María',
        apellidos: 'Muñoz Peña',
        numTelefono: '+593-2-234-5678',
        correo: 'josé.muñoz@correo.com',
        pais: 'España',
        provinciaEstado: 'Comunidad Autónoma de Aragón',
        ciudad: 'Zaragoza',
        profesion: 'Médico Especialista en Cardiología',
        institucion: 'Hospital Universitario Miguel Servet'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert
      expect(result.nombres).toBe('José María');
      expect(result.apellidos).toBe('Muñoz Peña');
      expect(result.correo).toBe('josé.muñoz@correo.com');
      expect(result.provinciaEstado).toBe('Comunidad Autónoma de Aragón');
      expect(result.profesion).toBe('Médico Especialista en Cardiología');
    });
  });

  describe('Casos de Diferentes Tipos de Identificación', () => {
    // MAP-PER-004: Mapeo con cédula ecuatoriana
    it('MAP-PER-004: debería mapear correctamente con cédula ecuatoriana', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 1,
        ciPasaporte: '1234567890',
        nombres: 'Ana',
        apellidos: 'García',
        numTelefono: '+593-2-123-4567',
        correo: 'ana.garcia@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Abogada',
        institucion: 'Universidad Central'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert
      expect(result.ciPasaporte).toBe('1234567890');
      expect(result.ciPasaporte).toMatch(/^\d{10}$/); // Verificar formato de cédula
    });

    // MAP-PER-005: Mapeo con pasaporte extranjero
    it('MAP-PER-005: debería mapear correctamente con pasaporte extranjero', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 2,
        ciPasaporte: 'US123456789',
        nombres: 'John',
        apellidos: 'Smith',
        numTelefono: '+1-555-123-4567',
        correo: 'john.smith@email.com',
        pais: 'Estados Unidos',
        provinciaEstado: 'California',
        ciudad: 'San Francisco',
        profesion: 'Software Engineer',
        institucion: 'Stanford University'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert
      expect(result.ciPasaporte).toBe('US123456789');
      expect(result.ciPasaporte).toMatch(/^[A-Z]{2}\d{9}$/); // Verificar formato de pasaporte
    });
  });

  describe('Casos de Formatos de Teléfono', () => {
    // MAP-PER-006: Mapeo con diferentes formatos de teléfono
    it('MAP-PER-006: debería mapear correctamente diferentes formatos de teléfono', () => {
      const testCases = [
        {
          telefono: '+593-2-123-4567',
          descripcion: 'teléfono fijo Ecuador'
        },
        {
          telefono: '+593-99-123-4567',
          descripcion: 'celular Ecuador'
        },
        {
          telefono: '+1-555-123-4567',
          descripcion: 'teléfono USA'
        },
        {
          telefono: '+34-91-123-4567',
          descripcion: 'teléfono España'
        }
      ];

      testCases.forEach(({ telefono }) => {
        // Arrange
        const prismaDatosPersonales: PrismaDatosPersonales = {
          idPersona: 1,
          ciPasaporte: '1234567890',
          nombres: 'Test',
          apellidos: 'User',
          numTelefono: telefono,
          correo: 'test@email.com',
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: 'Tester',
          institucion: 'Test University'
        };

        // Act
        const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

        // Assert
        expect(result.numTelefono).toBe(telefono);
      });
    });
  });

  describe('Casos de Profesiones e Instituciones Variadas', () => {
    // MAP-PER-007: Mapeo con diferentes profesiones
    it('MAP-PER-007: debería mapear correctamente diferentes profesiones', () => {
      const testCases = [
        {
          profesion: 'Ingeniero de Sistemas',
          institucion: 'Universidad Tecnológica'
        },
        {
          profesion: 'Médico Especialista',
          institucion: 'Hospital Central'
        },
        {
          profesion: 'Abogado Constitucionalista',
          institucion: 'Universidad de Derecho'
        },
        {
          profesion: 'Arquitecto',
          institucion: 'Instituto de Arquitectura'
        }
      ];

      testCases.forEach(({ profesion, institucion }) => {
        // Arrange
        const prismaDatosPersonales: PrismaDatosPersonales = {
          idPersona: 1,
          ciPasaporte: '1234567890',
          nombres: 'Test',
          apellidos: 'Professional',
          numTelefono: '+593-2-123-4567',
          correo: 'test@email.com',
          pais: 'Ecuador',
          provinciaEstado: 'Pichincha',
          ciudad: 'Quito',
          profesion: profesion,
          institucion: institucion
        };

        // Act
        const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

        // Assert
        expect(result.profesion).toBe(profesion);
        expect(result.institucion).toBe(institucion);
      });
    });
  });

  describe('Casos de Integridad del Mapeo', () => {
    // MAP-PER-008: Verificar que no se pierdan campos en el mapeo
    it('MAP-PER-008: debería transferir todos los campos sin pérdida de información', () => {
      // Arrange
      const prismaDatosPersonales: PrismaDatosPersonales = {
        idPersona: 12345,
        ciPasaporte: '1234567890',
        nombres: 'Test',
        apellidos: 'User',
        numTelefono: '+593-2-123-4567',
        correo: 'test@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Ingeniero',
        institucion: 'Universidad Test'
      };

      // Act
      const result = toDatosPersonalesResponseDto(prismaDatosPersonales);

      // Assert - Verificar que tiene exactamente los campos esperados
      const expectedKeys = [
        'idPersona',
        'ciPasaporte',
        'nombres',
        'apellidos',
        'numTelefono',
        'correo',
        'pais',
        'provinciaEstado',
        'ciudad',
        'profesion',
        'institucion'
      ];
      
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result)).toHaveLength(expectedKeys.length);

      // Verificar que todos los valores sean exactamente iguales
      expect(result.idPersona).toBe(prismaDatosPersonales.idPersona);
      expect(result.ciPasaporte).toBe(prismaDatosPersonales.ciPasaporte);
      expect(result.nombres).toBe(prismaDatosPersonales.nombres);
      expect(result.apellidos).toBe(prismaDatosPersonales.apellidos);
      expect(result.numTelefono).toBe(prismaDatosPersonales.numTelefono);
      expect(result.correo).toBe(prismaDatosPersonales.correo);
      expect(result.pais).toBe(prismaDatosPersonales.pais);
      expect(result.provinciaEstado).toBe(prismaDatosPersonales.provinciaEstado);
      expect(result.ciudad).toBe(prismaDatosPersonales.ciudad);
      expect(result.profesion).toBe(prismaDatosPersonales.profesion);
      expect(result.institucion).toBe(prismaDatosPersonales.institucion);
    });

    // MAP-PER-009: Verificar que el mapper no modifica el objeto original
    it('MAP-PER-009: debería no modificar el objeto Prisma original', () => {
      // Arrange
      const original: PrismaDatosPersonales = {
        idPersona: 1,
        ciPasaporte: '1234567890',
        nombres: 'Original',
        apellidos: 'User',
        numTelefono: '+593-2-123-4567',
        correo: 'original@email.com',
        pais: 'Ecuador',
        provinciaEstado: 'Pichincha',
        ciudad: 'Quito',
        profesion: 'Original Profession',
        institucion: 'Original Institution'
      };

      const originalCopy = { ...original };

      // Act
      const result = toDatosPersonalesResponseDto(original);

      // Assert
      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original); // Debe ser un objeto diferente
    });
  });
});
