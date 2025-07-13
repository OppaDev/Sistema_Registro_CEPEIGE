import { Descuento as PrismaDescuento } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { toDescuentoResponseDto } from "./descuento.mapper";

describe('E. Mapper toDescuentoResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-DES-001: Mapeo de un descuento estándar
    it('MAP-DES-001: debería mapear correctamente un descuento estándar', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 1,
        tipoDescuento: 'Estudiante',
        valorDescuento: new Decimal(20.00),
        porcentajeDescuento: new Decimal(0.1),
        descripcionDescuento: 'Descuento para estudiantes universitarios'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert
      expect(result).toEqual({
        idDescuento: 1,
        tipoDescuento: 'Estudiante',
        valorDescuento: new Decimal(20.00),
        porcentajeDescuento: new Decimal(0.1),
        descripcionDescuento: 'Descuento para estudiantes universitarios'
      });

      // Verificar tipos específicos
      expect(result.idDescuento).toBe(1);
      expect(result.tipoDescuento).toBe('Estudiante');
      expect(result.valorDescuento).toBeInstanceOf(Decimal);
      expect(result.porcentajeDescuento).toBeInstanceOf(Decimal);
      expect(result.descripcionDescuento).toBe('Descuento para estudiantes universitarios');
    });

    // MAP-DES-002: Mapeo de descuento con porcentaje cero
    it('MAP-DES-002: debería mapear correctamente descuento con porcentaje cero', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 2,
        tipoDescuento: 'Descuento Fijo',
        valorDescuento: new Decimal(50.00),
        porcentajeDescuento: new Decimal(0.00),
        descripcionDescuento: 'Descuento de valor fijo sin porcentaje'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert
      expect(result.porcentajeDescuento).toEqual(new Decimal(0.00));
      expect(result.porcentajeDescuento.toNumber()).toBe(0);
      expect(result.valorDescuento).toEqual(new Decimal(50.00));
    });
  });

  describe('Casos de Valores de Borde', () => {
    // Mapeo con valor de descuento cero
    it('debería mapear correctamente descuento con valor cero', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 3,
        tipoDescuento: 'Sin Descuento',
        valorDescuento: new Decimal(0.00),
        porcentajeDescuento: new Decimal(0.00),
        descripcionDescuento: 'Sin descuento aplicable'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert
      expect(result.valorDescuento).toEqual(new Decimal(0.00));
      expect(result.valorDescuento.toNumber()).toBe(0);
      expect(result.porcentajeDescuento).toEqual(new Decimal(0.00));
      expect(result.porcentajeDescuento.toNumber()).toBe(0);
    });

    // Mapeo con valores máximos
    it('debería mapear correctamente descuento con valores máximos', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 999999,
        tipoDescuento: 'Descuento Especial Premium para Eventos Corporativos',
        valorDescuento: new Decimal(999.99),
        porcentajeDescuento: new Decimal(1.00), // 100%
        descripcionDescuento: 'Descuento especial para eventos corporativos de gran envergadura con múltiples participantes y duración extendida'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert
      expect(result.idDescuento).toBe(999999);
      expect(result.tipoDescuento).toBe('Descuento Especial Premium para Eventos Corporativos');
      expect(result.valorDescuento).toEqual(new Decimal(999.99));
      expect(result.porcentajeDescuento).toEqual(new Decimal(1.00));
      expect(result.descripcionDescuento).toBe('Descuento especial para eventos corporativos de gran envergadura con múltiples participantes y duración extendida');
    });
  });

  describe('Casos de Tipos de Descuento', () => {
    // Diferentes tipos de descuento
    it('debería mapear correctamente diferentes tipos de descuento', () => {
      const tiposDescuento = [
        'Estudiante',
        'Tercera Edad',
        'Pronto Pago',
        'Empleado',
        'Corporativo',
        'Promocional',
        'Descuento de Temporada'
      ];

      tiposDescuento.forEach((tipo, index) => {
        // Arrange
        const prismaDescuento: PrismaDescuento = {
          idDescuento: index + 1,
          tipoDescuento: tipo,
          valorDescuento: new Decimal(10.00 + index * 5),
          porcentajeDescuento: new Decimal(0.05 + index * 0.02),
          descripcionDescuento: `Descripción para ${tipo}`
        };

        // Act
        const result = toDescuentoResponseDto(prismaDescuento);

        // Assert
        expect(result.tipoDescuento).toBe(tipo);
      });
    });
  });

  describe('Casos de Precisión Decimal', () => {
    // Mapeo con valores decimales de alta precisión
    it('debería mapear correctamente valores decimales con alta precisión', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 4,
        tipoDescuento: 'Descuento Preciso',
        valorDescuento: new Decimal('123.456789'),
        porcentajeDescuento: new Decimal('0.123456'),
        descripcionDescuento: 'Descuento con valores de alta precisión'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert
      expect(result.valorDescuento).toEqual(new Decimal('123.456789'));
      expect(result.porcentajeDescuento).toEqual(new Decimal('0.123456'));
      expect(result.valorDescuento.toString()).toBe('123.456789');
      expect(result.porcentajeDescuento.toString()).toBe('0.123456');
    });
  });

  describe('Casos de Integridad del Mapeo', () => {
    // Verificar que no se pierdan campos en el mapeo
    it('debería transferir todos los campos sin pérdida de información', () => {
      // Arrange
      const prismaDescuento: PrismaDescuento = {
        idDescuento: 12345,
        tipoDescuento: 'Test Descuento',
        valorDescuento: new Decimal(75.25),
        porcentajeDescuento: new Decimal(0.15),
        descripcionDescuento: 'Descripción de prueba'
      };

      // Act
      const result = toDescuentoResponseDto(prismaDescuento);

      // Assert - Verificar que tiene exactamente los campos esperados
      const expectedKeys = [
        'idDescuento',
        'tipoDescuento',
        'valorDescuento',
        'porcentajeDescuento',
        'descripcionDescuento'
      ];
      
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result)).toHaveLength(expectedKeys.length);

      // Verificar que todos los valores sean exactamente iguales
      expect(result.idDescuento).toBe(prismaDescuento.idDescuento);
      expect(result.tipoDescuento).toBe(prismaDescuento.tipoDescuento);
      expect(result.valorDescuento).toEqual(prismaDescuento.valorDescuento);
      expect(result.porcentajeDescuento).toEqual(prismaDescuento.porcentajeDescuento);
      expect(result.descripcionDescuento).toBe(prismaDescuento.descripcionDescuento);
    });

    // Verificar que el mapper no modifica el objeto original
    it('debería no modificar el objeto Prisma original', () => {
      // Arrange
      const original: PrismaDescuento = {
        idDescuento: 1,
        tipoDescuento: 'Original',
        valorDescuento: new Decimal(100.00),
        porcentajeDescuento: new Decimal(0.20),
        descripcionDescuento: 'Original Description'
      };

      const originalCopy = {
        ...original,
        valorDescuento: new Decimal(original.valorDescuento.toString()),
        porcentajeDescuento: new Decimal(original.porcentajeDescuento.toString())
      };

      // Act
      const result = toDescuentoResponseDto(original);

      // Assert
      expect(original.idDescuento).toBe(originalCopy.idDescuento);
      expect(original.tipoDescuento).toBe(originalCopy.tipoDescuento);
      expect(original.valorDescuento.toString()).toBe(originalCopy.valorDescuento.toString());
      expect(original.porcentajeDescuento.toString()).toBe(originalCopy.porcentajeDescuento.toString());
      expect(original.descripcionDescuento).toBe(originalCopy.descripcionDescuento);
      expect(result).not.toBe(original); // Debe ser un objeto diferente
    });
  });
});
