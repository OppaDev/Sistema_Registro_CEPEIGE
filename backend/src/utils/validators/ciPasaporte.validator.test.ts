import { IsCiPasaporteConstraint } from './ciPasaporte.validator';

describe('IsCiPasaporteConstraint', () => {
  let validator: IsCiPasaporteConstraint;

  beforeEach(() => {
    validator = new IsCiPasaporteConstraint();
  });
  describe('Validación de Cédulas Ecuatorianas', () => {
    it('debería validar una cédula ecuatoriana válida', () => {
      // Cédulas válidas de prueba (tomadas de cedulaValidator.test.ts)
      expect(validator.validate('0402084040')).toBe(true);
      expect(validator.validate('0926687856')).toBe(true);
      expect(validator.validate('0107197790')).toBe(true);
      expect(validator.validate('1717695496')).toBe(true);
    });

    it('debería rechazar una cédula ecuatoriana inválida', () => {
      // Cédulas inválidas
      expect(validator.validate('1234567890')).toBe(false); // Dígito verificador incorrecto
      expect(validator.validate('0000000000')).toBe(false); // Todos ceros
      expect(validator.validate('1111111111')).toBe(false); // Todos unos
    });

    it('debería rechazar cédulas con formato incorrecto', () => {
      expect(validator.validate('175001485')).toBe(false);  // 9 dígitos
      expect(validator.validate('17500148567')).toBe(false); // 11 dígitos
      expect(validator.validate('175001485a')).toBe(false); // Contiene letra
    });
  });

  describe('Validación de Pasaportes', () => {    it('debería validar pasaportes válidos', () => {
      expect(validator.validate('AB123456')).toBe(true);  // 8 caracteres con letras y números
      expect(validator.validate('XYZ789')).toBe(true);    // 6 caracteres con letras y números
      expect(validator.validate('A1B2C3D4E')).toBe(true); // 9 caracteres con letras y números
      expect(validator.validate('ABCDEF')).toBe(true);    // Solo letras (6 caracteres)
      expect(validator.validate('ABC123')).toBe(true);    // Mixto (6 caracteres)
    });

    it('debería rechazar pasaportes inválidos', () => {
      expect(validator.validate('AB12')).toBe(false);       // Muy corto (4 caracteres)
      expect(validator.validate('AB1234567890')).toBe(false); // Muy largo (12 caracteres)
      expect(validator.validate('ab123456')).toBe(false);   // Letras minúsculas
      expect(validator.validate('AB123@56')).toBe(false);   // Caracteres especiales
      expect(validator.validate('AB 123456')).toBe(false);  // Espacios
    });
  });

  describe('Casos Edge', () => {
    it('debería rechazar valores null, undefined o vacíos', () => {
      expect(validator.validate('')).toBe(false);
      expect(validator.validate(null as any)).toBe(false);
      expect(validator.validate(undefined as any)).toBe(false);
    });

    it('debería rechazar tipos que no sean string', () => {
      expect(validator.validate(1750014856 as any)).toBe(false); // Número
      expect(validator.validate({} as any)).toBe(false);         // Objeto
      expect(validator.validate([] as any)).toBe(false);         // Array
    });    it('debería distinguir correctamente entre cédula y pasaporte', () => {
      // Una cédula válida no debe validarse como pasaporte incorrecto
      expect(validator.validate('0402084040')).toBe(true);
      
      // Un pasaporte válido no debe validarse como cédula incorrecta
      expect(validator.validate('AB123456')).toBe(true);
    });
  });

  describe('Mensaje por defecto', () => {
    it('debería retornar el mensaje por defecto correcto', () => {
      const expectedMessage = 'Debe ingresar una cédula ecuatoriana válida (10 dígitos) o un pasaporte válido (6-9 caracteres alfanuméricos en mayúsculas)';
      expect(validator.defaultMessage()).toBe(expectedMessage);
    });
  });
});
