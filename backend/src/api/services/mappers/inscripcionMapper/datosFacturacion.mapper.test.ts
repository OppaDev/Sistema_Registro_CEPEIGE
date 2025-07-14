import { DatosFacturacion as PrismaDatosFacturacion } from "@prisma/client";
import { toDatosFacturacionResponseDto } from "./datosFacturacion.mapper";

describe('C. Mapper toDatosFacturacionResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-DAT-001: Mapeo de datos de facturación estándar
    it('MAP-DAT-001: debería mapear correctamente datos de facturación estándar', () => {
      // Arrange
      const prismaDatosFacturacion: PrismaDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Empresa Ejemplo S.A.',
        identificacionTributaria: '1234567890001',
        telefono: '+593-2-123-4567',
        correoFactura: 'facturacion@empresa.com',
        direccion: 'Av. Principal 123, Quito, Ecuador'
      };

      // Act
      const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

      // Assert
      expect(result).toEqual({
        idFacturacion: 1,
        razonSocial: 'Empresa Ejemplo S.A.',
        identificacionTributaria: '1234567890001',
        telefono: '+593-2-123-4567',
        correoFactura: 'facturacion@empresa.com',
        direccion: 'Av. Principal 123, Quito, Ecuador'
      });

      // Verificar que todos los campos estén presentes
      expect(result.idFacturacion).toBe(1);
      expect(result.razonSocial).toBe('Empresa Ejemplo S.A.');
      expect(result.identificacionTributaria).toBe('1234567890001');
      expect(result.telefono).toBe('+593-2-123-4567');
      expect(result.correoFactura).toBe('facturacion@empresa.com');
      expect(result.direccion).toBe('Av. Principal 123, Quito, Ecuador');
    });

    // MAP-DAT-002: Mapeo con valores de borde (ej. razón social larga)
    it('MAP-DAT-002: debería mapear correctamente con valores de borde', () => {
      // Arrange
      const prismaDatosFacturacion: PrismaDatosFacturacion = {
        idFacturacion: 999999,
        razonSocial: 'Corporación Internacional de Servicios Tecnológicos y Consultoría Empresarial S.A.S.',
        identificacionTributaria: '9999999999999',
        telefono: '+593-99-999-9999',
        correoFactura: 'departamento.facturacion.corporativa@corporacion-internacional-servicios.com.ec',
        direccion: 'Av. De las Américas Norte 123-456, Torre Empresarial Piso 25, Oficina 2501-2502, Sector Norte, Quito, Pichincha, Ecuador'
      };

      // Act
      const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

      // Assert
      expect(result.idFacturacion).toBe(999999);
      expect(result.razonSocial).toBe('Corporación Internacional de Servicios Tecnológicos y Consultoría Empresarial S.A.S.');
      expect(result.identificacionTributaria).toBe('9999999999999');
      expect(result.telefono).toBe('+593-99-999-9999');
      expect(result.correoFactura).toBe('departamento.facturacion.corporativa@corporacion-internacional-servicios.com.ec');
      expect(result.direccion).toBe('Av. De las Américas Norte 123-456, Torre Empresarial Piso 25, Oficina 2501-2502, Sector Norte, Quito, Pichincha, Ecuador');
    });
  });

  describe('Casos de Caracteres Especiales', () => {
    // MAP-DAT-003: Mapeo con caracteres especiales
    it('MAP-DAT-003: debería mapear correctamente con caracteres especiales', () => {
      // Arrange
      const prismaDatosFacturacion: PrismaDatosFacturacion = {
        idFacturacion: 10,
        razonSocial: 'Peña & Asociados Cía. Ltda.',
        identificacionTributaria: '1790123456001',
        telefono: '+1 (555) 123-4567',
        correoFactura: 'peña.asociados@compañía.com',
        direccion: 'Calle José María Peña Nº 45-67, Sector La Marañón'
      };

      // Act
      const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

      // Assert
      expect(result.razonSocial).toBe('Peña & Asociados Cía. Ltda.');
      expect(result.correoFactura).toBe('peña.asociados@compañía.com');
      expect(result.direccion).toBe('Calle José María Peña Nº 45-67, Sector La Marañón');
    });
  });

  describe('Casos de Formatos de Teléfono', () => {
    // MAP-DAT-004: Mapeo con diferentes formatos de teléfono
    it('MAP-DAT-004: debería mapear correctamente diferentes formatos de teléfono', () => {
      const testCases = [
        {
          telefono: '+593-2-123-4567',
          descripcion: 'formato internacional con guiones'
        },
        {
          telefono: '+1 (555) 123-4567',
          descripcion: 'formato estadounidense con paréntesis'
        },
        {
          telefono: '02-123-4567',
          descripcion: 'formato local con guiones'
        },
        {
          telefono: '0987654321',
          descripcion: 'formato móvil sin separadores'
        }
      ];

      testCases.forEach(({ telefono }) => {
        // Arrange
        const prismaDatosFacturacion: PrismaDatosFacturacion = {
          idFacturacion: 1,
          razonSocial: 'Empresa Test',
          identificacionTributaria: '1234567890001',
          telefono: telefono,
          correoFactura: 'test@empresa.com',
          direccion: 'Dirección Test'
        };

        // Act
        const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

        // Assert
        expect(result.telefono).toBe(telefono);
      });
    });
  });

  describe('Casos de Identificación Tributaria', () => {
    // MAP-DAT-005: Mapeo con diferentes tipos de identificación tributaria
    it('MAP-DAT-005: debería mapear correctamente diferentes identificaciones tributarias', () => {
      const testCases = [
        {
          identificacion: '1790123456001',
          descripcion: 'RUC persona jurídica'
        },
        {
          identificacion: '1234567890001',
          descripcion: 'RUC persona natural'
        },
        {
          identificacion: '0987654321',
          descripcion: 'Cédula de identidad'
        },
        {
          identificacion: 'AB1234567890',
          descripcion: 'Identificación extranjera'
        }
      ];

      testCases.forEach(({ identificacion }) => {
        // Arrange
        const prismaDatosFacturacion: PrismaDatosFacturacion = {
          idFacturacion: 1,
          razonSocial: 'Empresa Test',
          identificacionTributaria: identificacion,
          telefono: '+593-2-123-4567',
          correoFactura: 'test@empresa.com',
          direccion: 'Dirección Test'
        };

        // Act
        const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

        // Assert
        expect(result.identificacionTributaria).toBe(identificacion);
      });
    });
  });

  describe('Casos de Integridad del Mapeo', () => {
    // MAP-DAT-006: Verificar que no se pierdan campos en el mapeo
    it('MAP-DAT-006: debería transferir todos los campos sin pérdida de información', () => {
      // Arrange
      const prismaDatosFacturacion: PrismaDatosFacturacion = {
        idFacturacion: 12345,
        razonSocial: 'Test Corp',
        identificacionTributaria: '1790123456001',
        telefono: '+593-2-123-4567',
        correoFactura: 'info@testcorp.com',
        direccion: 'Test Address 123'
      };

      // Act
      const result = toDatosFacturacionResponseDto(prismaDatosFacturacion);

      // Assert - Verificar que tiene exactamente los campos esperados
      const expectedKeys = [
        'idFacturacion',
        'razonSocial', 
        'identificacionTributaria',
        'telefono',
        'correoFactura',
        'direccion'
      ];
      
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result)).toHaveLength(expectedKeys.length);

      // Verificar que todos los valores sean exactamente iguales
      expect(result.idFacturacion).toBe(prismaDatosFacturacion.idFacturacion);
      expect(result.razonSocial).toBe(prismaDatosFacturacion.razonSocial);
      expect(result.identificacionTributaria).toBe(prismaDatosFacturacion.identificacionTributaria);
      expect(result.telefono).toBe(prismaDatosFacturacion.telefono);
      expect(result.correoFactura).toBe(prismaDatosFacturacion.correoFactura);
      expect(result.direccion).toBe(prismaDatosFacturacion.direccion);
    });

    // MAP-DAT-007: Verificar que el mapper no modifica el objeto original
    it('MAP-DAT-007: debería no modificar el objeto Prisma original', () => {
      // Arrange
      const original: PrismaDatosFacturacion = {
        idFacturacion: 1,
        razonSocial: 'Original Corp',
        identificacionTributaria: '1234567890001',
        telefono: '+593-2-123-4567',
        correoFactura: 'original@corp.com',
        direccion: 'Original Address'
      };

      const originalCopy = { ...original };

      // Act
      const result = toDatosFacturacionResponseDto(original);

      // Assert
      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original); // Debe ser un objeto diferente
    });
  });
});
