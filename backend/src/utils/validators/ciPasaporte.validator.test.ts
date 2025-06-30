import { IsCiPasaporteConstraint } from './ciPasaporte.validator';

describe('IsCiPasaporteConstraint', () => {
  let validator: IsCiPasaporteConstraint;

  beforeEach(() => {
    validator = new IsCiPasaporteConstraint();
  });

  describe('A. Validación de Cédulas Ecuatorianas', () => {
    describe('Cédulas Válidas', () => {
      // CP-CI-001: Cédula ecuatoriana válida (10 dígitos, algoritmo correcto)
      it('CP-CI-001: debería validar cédula ecuatoriana válida', () => {
        expect(validator.validate('0402084040')).toBe(true);
      });

      // CP-CI-002: Cédula ecuatoriana válida con espacios
      it('CP-CI-002: debería validar cédula ecuatoriana válida con espacios', () => {
        expect(validator.validate(' 0402084040 ')).toBe(true);
      });

      // Casos adicionales de cédulas válidas para mayor cobertura
      it('debería validar otras cédulas ecuatorianas válidas', () => {
        expect(validator.validate('0926687856')).toBe(true);
        expect(validator.validate('0107197790')).toBe(true);
        expect(validator.validate('1717695496')).toBe(true);
      });
    });

    describe('Cédulas Inválidas', () => {
      // CP-CI-003: Cédula ecuatoriana con dígito verificador incorrecto
      it('CP-CI-003: debería rechazar cédula con dígito verificador incorrecto', () => {
        expect(validator.validate('0926687850')).toBe(false);
      });

      // CP-CI-004: Cédula con código de provincia inválido (> 24)
      it('CP-CI-004: debería rechazar cédula con código de provincia inválido', () => {
        expect(validator.validate('9912345678')).toBe(false);
      });

      // CP-CI-005: Cadena numérica con menos de 10 dígitos
      it('CP-CI-005: debería rechazar cadena numérica con menos de 10 dígitos', () => {
        expect(validator.validate('123456789')).toBe(false);
      });

      // CP-CI-006: Cadena numérica con más de 10 dígitos
      it('CP-CI-006: debería rechazar cadena numérica con más de 10 dígitos', () => {
        expect(validator.validate('12345678901')).toBe(false);
      });

      // Casos adicionales de cédulas inválidas
      it('debería rechazar otras cédulas inválidas', () => {
        expect(validator.validate('1234567890')).toBe(false); // Dígito verificador incorrecto
        expect(validator.validate('0000000000')).toBe(false); // Todos ceros
        expect(validator.validate('1111111111')).toBe(false); // Todos unos
        expect(validator.validate('175001485a')).toBe(false); // Contiene letra
      });
    });
  });

  describe('B. Validación de Pasaportes', () => {
    describe('Pasaportes Válidos', () => {
      // CP-PA-001: Pasaporte válido (6 caracteres alfanuméricos)
      it('CP-PA-001: debería validar pasaporte válido de 6 caracteres', () => {
        expect(validator.validate('ABC123')).toBe(true);
      });

      // CP-PA-002: Pasaporte válido (9 caracteres alfanuméricos)
      it('CP-PA-002: debería validar pasaporte válido de 9 caracteres', () => {
        expect(validator.validate('A1B2C3D4E')).toBe(true);
      });

      // Casos adicionales de pasaportes válidos
      it('debería validar otros pasaportes válidos', () => {
        expect(validator.validate('AB123456')).toBe(true);  // 8 caracteres con letras y números
        expect(validator.validate('XYZ789')).toBe(true);    // 6 caracteres con letras y números
        expect(validator.validate('ABCDEF')).toBe(true);    // Solo letras (6 caracteres)
        expect(validator.validate('ABC123G')).toBe(true);   // 7 caracteres mixtos
        expect(validator.validate('AB12CD34')).toBe(true);  // 8 caracteres mixtos
      });
    });

    describe('Pasaportes Inválidos', () => {
      // CP-PA-003: Pasaporte con menos de 6 caracteres
      it('CP-PA-003: debería rechazar pasaporte con menos de 6 caracteres', () => {
        expect(validator.validate('AB123')).toBe(false);
      });

      // CP-PA-004: Pasaporte con más de 9 caracteres
      it('CP-PA-004: debería rechazar pasaporte con más de 9 caracteres', () => {
        expect(validator.validate('ABC123DEF4')).toBe(false);
      });

      // CP-PA-005: Pasaporte con caracteres en minúscula
      it('CP-PA-005: debería rechazar pasaporte con caracteres en minúscula', () => {
        expect(validator.validate('ab123456')).toBe(false);
      });

      // CP-PA-006: Pasaporte con caracteres especiales
      it('CP-PA-006: debería rechazar pasaporte con caracteres especiales', () => {
        expect(validator.validate('ABC-123')).toBe(false);
      });

      // Casos adicionales de pasaportes inválidos
      it('debería rechazar otros pasaportes inválidos', () => {
        expect(validator.validate('AB12')).toBe(false);       // Muy corto (4 caracteres)
        expect(validator.validate('AB123@56')).toBe(false);   // Caracteres especiales (@)
        expect(validator.validate('AB 123456')).toBe(false);  // Espacios en el medio
        expect(validator.validate('AB.123456')).toBe(false);  // Punto
        expect(validator.validate('AB_123456')).toBe(false);  // Guión bajo
      });

      // Casos especiales: números puros que no son cédulas válidas
      it('debería rechazar números puros que no son cédulas válidas de 10 dígitos', () => {
        expect(validator.validate('123456')).toBe(false);     // 6 dígitos puros
        expect(validator.validate('1234567')).toBe(false);    // 7 dígitos puros
        expect(validator.validate('12345678')).toBe(false);   // 8 dígitos puros
        expect(validator.validate('123456789')).toBe(false);  // 9 dígitos puros
      });
    });
  });

  describe('C. Casos Edge (Entradas Especiales)', () => {
    // CP-ED-001: Cadena de entrada vacía
    it('CP-ED-001: debería rechazar cadena de entrada vacía', () => {
      expect(validator.validate('')).toBe(false);
    });

    // CP-ED-002: Entrada null
    it('CP-ED-002: debería rechazar entrada null', () => {
      expect(validator.validate(null as any)).toBe(false);
    });

    // CP-ED-003: Entrada undefined
    it('CP-ED-003: debería rechazar entrada undefined', () => {
      expect(validator.validate(undefined as any)).toBe(false);
    });

    // Casos adicionales de tipos inválidos
    it('debería rechazar tipos que no sean string', () => {
      expect(validator.validate(1750014856 as any)).toBe(false); // Número
      expect(validator.validate({} as any)).toBe(false);         // Objeto
      expect(validator.validate([] as any)).toBe(false);         // Array
      expect(validator.validate(true as any)).toBe(false);       // Boolean
    });

    // Casos de cadenas solo con espacios
    it('debería rechazar cadenas que solo contienen espacios', () => {
      expect(validator.validate('   ')).toBe(false);
      expect(validator.validate('\t')).toBe(false);
      expect(validator.validate('\n')).toBe(false);
    });
  });

  describe('D. Casos de Distinción', () => {
    it('debería distinguir correctamente entre cédula y pasaporte', () => {
      // Una cédula válida no debe validarse como pasaporte incorrecto
      expect(validator.validate('0402084040')).toBe(true);
      
      // Un pasaporte válido no debe validarse como cédula incorrecta
      expect(validator.validate('AB123456')).toBe(true);
      
      // Casos límite: números de diferentes longitudes
      expect(validator.validate('123456')).toBe(false);    // 6 dígitos: ni cédula ni pasaporte válido
      expect(validator.validate('1234567890')).toBe(false); // 10 dígitos: cédula inválida
    });
  });

  describe('E. Mensaje por Defecto', () => {
    it('debería retornar el mensaje por defecto correcto', () => {
      const expectedMessage = 'Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-9 caracteres alfanuméricos en mayúsculas)';
      expect(validator.defaultMessage()).toBe(expectedMessage);
    });
  });
});
