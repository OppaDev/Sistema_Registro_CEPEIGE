import {
  Factura as PrismaFactura,
  Inscripcion as PrismaInscripcion,
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  toFacturaResponseDto,
  toFacturaWithRelationsResponseDto,
  PrismaFacturaConRelaciones,
} from "@/api/services/mappers/validarPagoMapper/factura.mapper";

describe('F. Mapper toFacturaResponseDto', () => {
  describe('Casos de Mapeo Básico', () => {
    // MAP-FAC-001: Mapeo de una factura estándar sin relaciones
    it('MAP-FAC-001: debería mapear correctamente una factura estándar', () => {
      // Arrange
      const prismaFactura: PrismaFactura = {
        idFactura: 1,
        idInscripcion: 10,
        idFacturacion: 5,
        valorPagado: new Decimal(150.00),
        verificacionPago: true,
        numeroIngreso: "ING-2025-001",
        numeroFactura: "FAC-2025-001",
      };

      // Act
      const result = toFacturaResponseDto(prismaFactura);

      // Assert
      expect(result).toEqual({
        idFactura: 1,
        idInscripcion: 10,
        idFacturacion: 5,
        valorPagado: new Decimal(150.00),
        verificacionPago: true,
        numeroIngreso: "ING-2025-001",
        numeroFactura: "FAC-2025-001",
      });

      // Verificar tipos específicos
      expect(result.idFactura).toBe(1);
      expect(result.idInscripcion).toBe(10);
      expect(result.idFacturacion).toBe(5);
      expect(result.valorPagado).toBeInstanceOf(Decimal);
      expect(result.verificacionPago).toBe(true);
      expect(result.numeroIngreso).toBe("ING-2025-001");
      expect(result.numeroFactura).toBe("FAC-2025-001");
    });

    // MAP-FAC-002: Mapeo de factura con verificación pendiente
    it('MAP-FAC-002: debería mapear correctamente factura con verificación pendiente', () => {
      // Arrange
      const prismaFactura: PrismaFactura = {
        idFactura: 2,
        idInscripcion: 11,
        idFacturacion: 6,
        valorPagado: new Decimal(200.50),
        verificacionPago: false,
        numeroIngreso: "ING-2025-002",
        numeroFactura: "FAC-2025-002",
      };

      // Act
      const result = toFacturaResponseDto(prismaFactura);

      // Assert
      expect(result.verificacionPago).toBe(false);
      expect(result.valorPagado).toEqual(new Decimal(200.50));
      expect(result.numeroIngreso).toBe("ING-2025-002");
      expect(result.numeroFactura).toBe("FAC-2025-002");
    });
  });

  describe('Casos de Mapeo con Relaciones', () => {
    // MAP-FAC-003: Mapeo de factura con relaciones completas
    it('MAP-FAC-003: debería mapear correctamente factura con relaciones completas', () => {
      // Arrange
      const prismaCurso: PrismaCurso = {
        idCurso: 1,
        nombreCortoCurso: "JS101",
        nombreCurso: "JavaScript Fundamentals",
        modalidadCurso: "Virtual",
        descripcionCurso: "Curso introductorio de JavaScript",
        valorCurso: new Decimal(180.00),
        enlacePago: 'https://payment.example.com/test-course',
        fechaInicioCurso: new Date("2025-08-01"),
        fechaFinCurso: new Date("2025-10-01"),
      };

      const prismaPersona: PrismaDatosPersonales = {
        idPersona: 1,
        nombres: "Juan Carlos",
        apellidos: "Pérez López",
        ciPasaporte: "1234567890",
        correo: "juan.perez@email.com",
        numTelefono: "0987654321",
        pais: "Ecuador",
        provinciaEstado: "Pichincha",
        ciudad: "Quito",
        profesion: "Ingeniero",
        institucion: "Universidad Central",
      };

      const prismaInscripcion: PrismaInscripcion = {
        idInscripcion: 10,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 5,
        idComprobante: 1,
        idDescuento: null,
        fechaInscripcion: new Date("2025-07-15"),
        matricula: true,
      };

      const prismaFacturaConRelaciones: PrismaFacturaConRelaciones = {
        idFactura: 1,
        idInscripcion: 10,
        idFacturacion: 5,
        valorPagado: new Decimal(150.00),
        verificacionPago: true,
        numeroIngreso: "ING-2025-001",
        numeroFactura: "FAC-2025-001",
        inscripcion: {
          ...prismaInscripcion,
          curso: prismaCurso,
          persona: prismaPersona,
        },
      };

      // Act
      const result = toFacturaWithRelationsResponseDto(prismaFacturaConRelaciones);

      // Assert
      expect(result).toEqual({
        idFactura: 1,
        idInscripcion: 10,
        idFacturacion: 5,
        valorPagado: new Decimal(150.00),
        verificacionPago: true,
        numeroIngreso: "ING-2025-001",
        numeroFactura: "FAC-2025-001",
        inscripcion: {
          idInscripcion: 10,
          fechaInscripcion: new Date("2025-07-15"),
          matricula: true,
          curso: {
            idCurso: 1,
            nombreCurso: "JavaScript Fundamentals",
            nombreCortoCurso: "JS101",
            modalidadCurso: "Virtual",
            valorCurso: new Decimal(180.00),
          },
          persona: {
            idPersona: 1,
            nombres: "Juan Carlos",
            apellidos: "Pérez López",
            ciPasaporte: "1234567890",
            correo: "juan.perez@email.com",
          },
        },
      });

      // Verificar estructura de relaciones
      expect(result.inscripcion).toBeDefined();
      expect(result.inscripcion?.curso).toBeDefined();
      expect(result.inscripcion?.persona).toBeDefined();
      
      if (result.inscripcion?.curso) {
        expect(result.inscripcion.curso.nombreCurso).toBe("JavaScript Fundamentals");
      }
      
      if (result.inscripcion?.persona) {
        expect(result.inscripcion.persona.nombres).toBe("Juan Carlos");
      }
    });

    // MAP-FAC-004: Mapeo de factura con valores decimales precisos
    it('MAP-FAC-004: debería mantener precisión en valores decimales', () => {
      // Arrange
      const prismaFactura: PrismaFactura = {
        idFactura: 3,
        idInscripcion: 12,
        idFacturacion: 7,
        valorPagado: new Decimal(99.99),
        verificacionPago: true,
        numeroIngreso: "ING-2025-003",
        numeroFactura: "FAC-2025-003",
      };

      // Act
      const result = toFacturaResponseDto(prismaFactura);

      // Assert
      expect(result.valorPagado).toEqual(new Decimal(99.99));
      expect(result.valorPagado.toString()).toBe("99.99");
    });
  });

  describe('Casos Edge', () => {
    // MAP-FAC-005: Mapeo con números de factura e ingreso complejos
    it('MAP-FAC-005: debería mapear correctamente números de factura e ingreso complejos', () => {
      // Arrange
      const prismaFactura: PrismaFactura = {
        idFactura: 4,
        idInscripcion: 13,
        idFacturacion: 8,
        valorPagado: new Decimal(0.01),
        verificacionPago: false,
        numeroIngreso: "ING-2025-ESPECIAL-001",
        numeroFactura: "FAC-PROMO-2025-XYZ",
      };

      // Act
      const result = toFacturaResponseDto(prismaFactura);

      // Assert
      expect(result.numeroIngreso).toBe("ING-2025-ESPECIAL-001");
      expect(result.numeroFactura).toBe("FAC-PROMO-2025-XYZ");
      expect(result.valorPagado).toEqual(new Decimal(0.01));
    });

    // MAP-FAC-006: Mapeo con valor pagado cero
    it('MAP-FAC-006: debería mapear correctamente factura con valor pagado cero', () => {
      // Arrange
      const prismaFactura: PrismaFactura = {
        idFactura: 5,
        idInscripcion: 14,
        idFacturacion: 9,
        valorPagado: new Decimal(0.00),
        verificacionPago: false,
        numeroIngreso: "ING-2025-GRATIS",
        numeroFactura: "FAC-2025-GRATUITO",
      };

      // Act
      const result = toFacturaResponseDto(prismaFactura);

      // Assert
      expect(result.valorPagado).toEqual(new Decimal(0.00));
      expect(result.valorPagado.toString()).toBe("0");
      expect(result.verificacionPago).toBe(false);
    });
  });
});
