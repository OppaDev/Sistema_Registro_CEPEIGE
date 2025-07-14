import { 
  Curso as PrismaCurso,
  DatosPersonales as PrismaDatosPersonales,
  DatosFacturacion as PrismaDatosFacturacion,
  Comprobante as PrismaComprobante,
  Descuento as PrismaDescuento
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { 
  toInscripcionResponseDto, 
  toInscripcionAdminResponseDto,
  PrismaInscripcionConRelaciones,
  PrismaInscripcionAdminConRelaciones
} from "./inscripcion.mapper";

describe('F. Mappers de Inscripción', () => {
  // Datos de prueba base
  const baseCurso: PrismaCurso = {
    idCurso: 1,
    nombreCortoCurso: 'TS',
    nombreCurso: 'Curso de TypeScript',
    modalidadCurso: 'Virtual',
    valorCurso: new Decimal(150.00),
    fechaInicioCurso: new Date('2025-07-01'),
    fechaFinCurso: new Date('2025-07-31'),
    descripcionCurso: 'Curso completo de TypeScript'
  };

  const baseDatosPersonales: PrismaDatosPersonales = {
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

  const baseDatosFacturacion: PrismaDatosFacturacion = {
    idFacturacion: 1,
    razonSocial: 'Juan Pérez',
    identificacionTributaria: '1234567890',
    telefono: '+593-2-123-4567',
    correoFactura: 'juan.perez@email.com',
    direccion: 'Av. Principal 123, Quito'
  };

  const baseComprobante: PrismaComprobante = {
    idComprobante: 1,
    fechaSubida: new Date('2025-06-30'),
    rutaComprobante: 'uploads/comprobantes/comprobante1.pdf',
    tipoArchivo: 'pdf',
    nombreArchivo: 'comprobante1.pdf'
  };

  const baseDescuento: PrismaDescuento = {
    idDescuento: 1,
    tipoDescuento: 'Estudiante',
    valorDescuento: new Decimal(20.00),
    porcentajeDescuento: new Decimal(0.1),
    descripcionDescuento: 'Descuento para estudiantes'
  };

  describe('F.1 Mapper toInscripcionResponseDto (Vista de Usuario)', () => {
    // MAP-INS-USR-001: Mapeo de una inscripción completa sin descuento
    it('MAP-INS-USR-001: debería mapear correctamente una inscripción completa sin descuento', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionConRelaciones = {
        idInscripcion: 1,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: false,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: null,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante
      };

      // Act
      const result = toInscripcionResponseDto(prismaInscripcion);

      // Assert
      expect(result.idInscripcion).toBe(1);
      expect(result.fechaInscripcion).toEqual(new Date('2025-06-30'));
      
      // Verificar que los sub-objetos están correctamente mapeados
      expect(result.curso).toBeDefined();
      expect(result.curso.idCurso).toBe(1);
      expect(result.curso.nombreCurso).toBe('Curso de TypeScript');
      
      expect(result.datosPersonales).toBeDefined();
      expect(result.datosPersonales.idPersona).toBe(1);
      expect(result.datosPersonales.nombres).toBe('Juan Carlos');
      
      expect(result.datosFacturacion).toBeDefined();
      expect(result.datosFacturacion.idFacturacion).toBe(1);
      expect(result.datosFacturacion.razonSocial).toBe('Juan Pérez');
      
      expect(result.comprobante).toBeDefined();
      expect(result.comprobante.idComprobante).toBe(1);
      expect(result.comprobante.nombreArchivo).toBe('comprobante1.pdf');
    });

    // MAP-INS-USR-002: Mapeo de una inscripción (asegurar que campos de admin no están)
    it('MAP-INS-USR-002: no debería contener campos de administrador (matricula, descuento)', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionConRelaciones = {
        idInscripcion: 2,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: true, // Este campo NO debe aparecer en la respuesta de usuario
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: 1, // Este campo NO debe aparecer en la respuesta de usuario
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante
      };

      // Act
      const result = toInscripcionResponseDto(prismaInscripcion);

      // Assert
      expect(result).not.toHaveProperty('matricula');
      expect(result).not.toHaveProperty('descuento');
      expect(result).not.toHaveProperty('idDescuento');
      
      // Verificar que solo tiene los campos esperados
      const expectedKeys = [
        'idInscripcion',
        'fechaInscripcion',
        'curso',
        'datosPersonales',
        'datosFacturacion',
        'comprobante'
      ];
      
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result)).toHaveLength(expectedKeys.length);
    });
  });

  describe('F.2 Mapper toInscripcionAdminResponseDto (Vista de Administrador)', () => {
    // MAP-INS-ADM-001: Mapeo de inscripción con descuento
    it('MAP-INS-ADM-001: debería mapear correctamente inscripción con descuento', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionAdminConRelaciones = {
        idInscripcion: 3,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: true,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: 1,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante,
        descuento: baseDescuento
      };

      // Act
      const result = toInscripcionAdminResponseDto(prismaInscripcion);

      // Assert
      expect(result.idInscripcion).toBe(3);
      expect(result.fechaInscripcion).toEqual(new Date('2025-06-30'));
      expect(result.matricula).toBe(true);
      
      // Verificar que el descuento está incluido y correctamente mapeado
      expect(result.descuento).toBeDefined();
      expect(result.descuento!.idDescuento).toBe(1);
      expect(result.descuento!.tipoDescuento).toBe('Estudiante');
      expect(result.descuento!.valorDescuento).toEqual(new Decimal(20.00));
      
      // Verificar otros sub-objetos
      expect(result.curso).toBeDefined();
      expect(result.datosPersonales).toBeDefined();
      expect(result.datosFacturacion).toBeDefined();
      expect(result.comprobante).toBeDefined();
    });

    // MAP-INS-ADM-002: Mapeo de inscripción sin descuento
    it('MAP-INS-ADM-002: debería mapear correctamente inscripción sin descuento', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionAdminConRelaciones = {
        idInscripcion: 4,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: false,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: null,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante,
        descuento: null
      };

      // Act
      const result = toInscripcionAdminResponseDto(prismaInscripcion);

      // Assert
      expect(result.idInscripcion).toBe(4);
      expect(result.matricula).toBe(false);
      
      // El descuento no debe estar presente cuando es null
      expect(result).not.toHaveProperty('descuento');
      
      // Verificar que otros campos están presentes
      expect(result.curso).toBeDefined();
      expect(result.datosPersonales).toBeDefined();
      expect(result.datosFacturacion).toBeDefined();
      expect(result.comprobante).toBeDefined();
    });

    // MAP-INS-ADM-003: Mapeo de inscripción con matricula en true
    it('MAP-INS-ADM-003: debería mapear correctamente matricula en true', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionAdminConRelaciones = {
        idInscripcion: 5,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: true,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: null,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante,
        descuento: null
      };

      // Act
      const result = toInscripcionAdminResponseDto(prismaInscripcion);

      // Assert
      expect(result.matricula).toBe(true);
      expect(typeof result.matricula).toBe('boolean');
    });

    // MAP-INS-ADM-004: Mapeo de inscripción con matricula en false
    it('MAP-INS-ADM-004: debería mapear correctamente matricula en false', () => {
      // Arrange
      const prismaInscripcion: PrismaInscripcionAdminConRelaciones = {
        idInscripcion: 6,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: false,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: null,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante,
        descuento: null
      };

      // Act
      const result = toInscripcionAdminResponseDto(prismaInscripcion);

      // Assert
      expect(result.matricula).toBe(false);
      expect(typeof result.matricula).toBe('boolean');
    });
  });

  describe('Casos de Integridad del Mapeo', () => {
    // Verificar que los mappers invocan correctamente los mappers anidados
    it('debería invocar correctamente todos los mappers anidados', () => {
      // Arrange
      const prismaInscripcionAdmin: PrismaInscripcionAdminConRelaciones = {
        idInscripcion: 7,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: true,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: 1,
        curso: baseCurso,
        persona: baseDatosPersonales,
        datosFacturacion: baseDatosFacturacion,
        comprobante: baseComprobante,
        descuento: baseDescuento
      };

      // Act
      const result = toInscripcionAdminResponseDto(prismaInscripcionAdmin);

      // Assert - Verificar que cada sub-objeto tiene la estructura correcta
      
      // Curso mapper
      expect(result.curso).toEqual({
        idCurso: 1,
        nombreCortoCurso: 'TS',
        nombreCurso: 'Curso de TypeScript',
        modalidadCurso: 'Virtual',
        valorCurso: new Decimal(150.00),
        fechaInicioCurso: new Date('2025-07-01'),
        fechaFinCurso: new Date('2025-07-31'),
        descripcionCurso: 'Curso completo de TypeScript'
      });

      // DatosPersonales mapper
      expect(result.datosPersonales).toEqual({
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

      // DatosFacturacion mapper
      expect(result.datosFacturacion).toEqual({
        idFacturacion: 1,
        razonSocial: 'Juan Pérez',
        identificacionTributaria: '1234567890',
        telefono: '+593-2-123-4567',
        correoFactura: 'juan.perez@email.com',
        direccion: 'Av. Principal 123, Quito'
      });

      // Comprobante mapper
      expect(result.comprobante).toEqual({
        idComprobante: 1,
        fechaSubida: new Date('2025-06-30'),
        rutaComprobante: 'uploads/comprobantes/comprobante1.pdf',
        tipoArchivo: 'pdf',
        nombreArchivo: 'comprobante1.pdf'
      });

      // Descuento mapper
      expect(result.descuento).toEqual({
        idDescuento: 1,
        tipoDescuento: 'Estudiante',
        valorDescuento: new Decimal(20.00),
        porcentajeDescuento: new Decimal(0.1),
        descripcionDescuento: 'Descuento para estudiantes'
      });
    });

    // Verificar que los mappers no modifican los objetos originales
    it('debería no modificar los objetos Prisma originales', () => {
      // Arrange
      const originalInscripcion: PrismaInscripcionConRelaciones = {
        idInscripcion: 8,
        fechaInscripcion: new Date('2025-06-30'),
        matricula: false,
        idCurso: 1,
        idPersona: 1,
        idFacturacion: 1,
        idComprobante: 1,
        idDescuento: null,
        curso: { ...baseCurso },
        persona: { ...baseDatosPersonales },
        datosFacturacion: { ...baseDatosFacturacion },
        comprobante: { ...baseComprobante }
      };

      const originalCopy = {
        ...originalInscripcion,
        curso: { ...originalInscripcion.curso },
        persona: { ...originalInscripcion.persona },
        datosFacturacion: { ...originalInscripcion.datosFacturacion },
        comprobante: { ...originalInscripcion.comprobante }
      };

      // Act
      const result = toInscripcionResponseDto(originalInscripcion);

      // Assert
      expect(originalInscripcion).toEqual(originalCopy);
      expect(result).not.toBe(originalInscripcion);
    });
  });
});
