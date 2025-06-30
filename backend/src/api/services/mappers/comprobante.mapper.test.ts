import { Comprobante as PrismaComprobante } from "@prisma/client";
import { ComprobanteResponseDto } from "@/api/dtos/comprobante.dto";
import { toComprobanteResponseDto } from "./comprobante.mapper";

describe('A. Mapper toComprobanteResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-COM-001: Mapeo de un comprobante estándar
    it('MAP-COM-001: debería mapear correctamente un comprobante estándar', () => {
      // Arrange
      const mockDate = new Date('2025-06-30T10:30:00.000Z');
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 1,
        fechaSubida: mockDate,
        rutaComprobante: 'uploads/comprobantes/comprobante_1.pdf',
        tipoArchivo: 'pdf',
        nombreArchivo: 'comprobante_pago.pdf'
      };

      // Act
      const result = toComprobanteResponseDto(prismaComprobante);

      // Assert
      expect(result).toEqual({
        idComprobante: 1,
        fechaSubida: mockDate,
        rutaComprobante: 'uploads/comprobantes/comprobante_1.pdf',
        tipoArchivo: 'pdf',
        nombreArchivo: 'comprobante_pago.pdf'
      } as ComprobanteResponseDto);
    });

    // MAP-COM-002: Mapeo con valores de borde (ej. nombre de archivo largo)
    it('MAP-COM-002: debería mapear correctamente comprobante con nombre de archivo largo', () => {
      // Arrange
      const mockDate = new Date('2025-06-30T15:45:30.000Z');
      const longFileName = 'un_nombre_de_archivo_muy_largo_y_complejo_que_puede_contener_muchos_caracteres_y_detalles.pdf';
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 999,
        fechaSubida: mockDate,
        rutaComprobante: 'uploads/comprobantes/path/to/very/deep/directory/structure/',
        tipoArchivo: 'application/pdf',
        nombreArchivo: longFileName
      };

      // Act
      const result = toComprobanteResponseDto(prismaComprobante);

      // Assert
      expect(result).toEqual({
        idComprobante: 999,
        fechaSubida: mockDate,
        rutaComprobante: 'uploads/comprobantes/path/to/very/deep/directory/structure/',
        tipoArchivo: 'application/pdf',
        nombreArchivo: longFileName
      } as ComprobanteResponseDto);

      // Verificar que no hay truncamiento
      expect(result.nombreArchivo).toBe(longFileName);
      expect(result.nombreArchivo.length).toBe(longFileName.length);
    });
  });

  describe('Casos de Diferentes Tipos de Archivo', () => {
    it('debería mapear correctamente comprobante PDF', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 2,
        fechaSubida: new Date('2025-06-30T12:00:00.000Z'),
        rutaComprobante: 'uploads/pdf/documento.pdf',
        tipoArchivo: 'application/pdf',
        nombreArchivo: 'factura_001.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.tipoArchivo).toBe('application/pdf');
      expect(result.nombreArchivo).toMatch(/\.pdf$/);
    });

    it('debería mapear correctamente comprobante JPG', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 3,
        fechaSubida: new Date('2025-06-30T14:30:00.000Z'),
        rutaComprobante: 'uploads/images/foto.jpg',
        tipoArchivo: 'image/jpeg',
        nombreArchivo: 'foto_comprobante.jpg'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.tipoArchivo).toBe('image/jpeg');
      expect(result.nombreArchivo).toMatch(/\.jpg$/);
    });

    it('debería mapear correctamente comprobante PNG', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 4,
        fechaSubida: new Date('2025-06-30T16:15:00.000Z'),
        rutaComprobante: 'uploads/images/captura.png',
        tipoArchivo: 'image/png',
        nombreArchivo: 'captura_pantalla.png'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.tipoArchivo).toBe('image/png');
      expect(result.nombreArchivo).toMatch(/\.png$/);
    });
  });

  describe('Casos de Valores Límite', () => {
    it('debería mapear correctamente con ID mínimo', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 1,
        fechaSubida: new Date('2025-01-01T00:00:00.000Z'),
        rutaComprobante: '/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'a.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.idComprobante).toBe(1);
      expect(result.rutaComprobante).toBe('/');
      expect(result.nombreArchivo).toBe('a.pdf');
    });

    it('debería mapear correctamente con ID grande', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 2147483647, // Max INT
        fechaSubida: new Date('2025-12-31T23:59:59.999Z'),
        rutaComprobante: 'uploads/comprobantes/',
        tipoArchivo: 'application/pdf',
        nombreArchivo: 'comprobante_max_id.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.idComprobante).toBe(2147483647);
      expect(result.fechaSubida).toEqual(new Date('2025-12-31T23:59:59.999Z'));
    });

    it('debería mapear correctamente con ruta compleja', () => {
      const complexPath = 'uploads/comprobantes/2025/06/30/user_123/subdirectory/nested/very/deep/';
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 100,
        fechaSubida: new Date('2025-06-30T20:00:00.000Z'),
        rutaComprobante: complexPath,
        tipoArchivo: 'application/pdf',
        nombreArchivo: 'documento_complejo.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.rutaComprobante).toBe(complexPath);
      expect(result.rutaComprobante.length).toBe(complexPath.length);
    });
  });

  describe('Casos de Fechas Especiales', () => {
    it('debería mapear correctamente fecha actual', () => {
      const now = new Date();
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 5,
        fechaSubida: now,
        rutaComprobante: 'uploads/current/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'actual.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.fechaSubida).toEqual(now);
      expect(result.fechaSubida.getTime()).toBe(now.getTime());
    });

    it('debería mapear correctamente fecha histórica', () => {
      // Crear la fecha en la zona horaria local para evitar problemas de UTC
      const historicDate = new Date(2020, 0, 1); // Año 2020, mes 0 (enero), día 1
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 6,
        fechaSubida: historicDate,
        rutaComprobante: 'uploads/historic/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'historico.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.fechaSubida).toEqual(historicDate);
      expect(result.fechaSubida.getFullYear()).toBe(2020);
      expect(result.fechaSubida.getMonth()).toBe(0); // Enero es 0
      expect(result.fechaSubida.getDate()).toBe(1);
    });

    it('debería mapear correctamente fecha futura', () => {
      const futureDate = new Date('2030-12-31T23:59:59.999Z');
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 7,
        fechaSubida: futureDate,
        rutaComprobante: 'uploads/future/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'futuro.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.fechaSubida).toEqual(futureDate);
      expect(result.fechaSubida.getFullYear()).toBe(2030);
    });
  });

  describe('Integridad del Mapeo', () => {
    it('debería mantener la referencia de fecha sin mutar el objeto original', () => {
      const originalDate = new Date('2025-06-30T10:00:00.000Z');
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 8,
        fechaSubida: originalDate,
        rutaComprobante: 'uploads/test/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'test.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      // Verificar que la fecha no es la misma referencia pero tiene el mismo valor
      expect(result.fechaSubida).toEqual(originalDate);
      expect(result.fechaSubida.getTime()).toBe(originalDate.getTime());
    });

    it('debería crear un nuevo objeto sin referencias al original', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 9,
        fechaSubida: new Date('2025-06-30T11:00:00.000Z'),
        rutaComprobante: 'uploads/reference/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'reference.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      // Modificar el resultado no debe afectar el original
      result.nombreArchivo = 'modified.pdf';
      expect(prismaComprobante.nombreArchivo).toBe('reference.pdf');
    });

    it('debería mapear todos los campos requeridos', () => {
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 10,
        fechaSubida: new Date('2025-06-30T13:00:00.000Z'),
        rutaComprobante: 'uploads/complete/',
        tipoArchivo: 'pdf',
        nombreArchivo: 'complete.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      // Verificar que todos los campos están presentes
      expect(result).toHaveProperty('idComprobante');
      expect(result).toHaveProperty('fechaSubida');
      expect(result).toHaveProperty('rutaComprobante');
      expect(result).toHaveProperty('tipoArchivo');
      expect(result).toHaveProperty('nombreArchivo');

      // Verificar que no hay campos adicionales
      const resultKeys = Object.keys(result);
      expect(resultKeys).toHaveLength(5);
    });
  });

  describe('Casos de Caracteres Especiales', () => {
    it('debería mapear correctamente nombres con caracteres especiales', () => {
      const specialFileName = 'comprobante_ñáéíóú_#$%&_-_archivo.pdf';
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 11,
        fechaSubida: new Date('2025-06-30T17:00:00.000Z'),
        rutaComprobante: 'uploads/special/',
        tipoArchivo: 'pdf',
        nombreArchivo: specialFileName
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.nombreArchivo).toBe(specialFileName);
      expect(result.nombreArchivo).toContain('ñáéíóú');
      expect(result.nombreArchivo).toContain('#$%&');
    });

    it('debería mapear correctamente rutas con caracteres especiales', () => {
      const specialPath = 'uploads/año_2025/mes_06/día_30/usuário_123/';
      
      const prismaComprobante: PrismaComprobante = {
        idComprobante: 12,
        fechaSubida: new Date('2025-06-30T18:00:00.000Z'),
        rutaComprobante: specialPath,
        tipoArchivo: 'pdf',
        nombreArchivo: 'documento.pdf'
      };

      const result = toComprobanteResponseDto(prismaComprobante);

      expect(result.rutaComprobante).toBe(specialPath);
      expect(result.rutaComprobante).toContain('año_2025');
      expect(result.rutaComprobante).toContain('usuário_123');
    });
  });
});
