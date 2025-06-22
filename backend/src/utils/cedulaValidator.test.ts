// backend/src/utils/cedulaValidator.test.ts
import { CedulaEcuatorianaValidator } from './cedulaValidator'; // Asegúrate de la ruta correcta

describe('CedulaEcuatorianaValidator', () => {
  describe('isValid', () => {
    // Casos de prueba para cédulas válidas
    const validCedulas = [
      { cedula: '0402084040', description: 'Cédula válida de Carchi' }
    ];

    validCedulas.forEach(testCase => {
      it(`should return true for ${testCase.description} (${testCase.cedula})`, () => {
        expect(CedulaEcuatorianaValidator.isValid(testCase.cedula)).toBe(true);
      });
    });

    // Casos de prueba para cédulas inválidas
    const invalidCedulas = [
      { cedula: '1712345679', description: 'Cédula con dígito verificador incorrecto' },
      { cedula: '2512345678', description: 'Cédula con código de provincia inválido (25)' },
      { cedula: '1762345678', description: 'Cédula con tercer dígito mayor a 5' },
      { cedula: '171234567', description: 'Cédula con menos de 10 dígitos' },
      { cedula: '17123456789', description: 'Cédula con más de 10 dígitos' },
      { cedula: '171234567a', description: 'Cédula con caracteres no numéricos' },
      { cedula: '', description: 'Cédula vacía' },
      { cedula: '0012345678', description: 'Cédula con código de provincia 00' },
    ];

    invalidCedulas.forEach(testCase => {
      it(`should return false for ${testCase.description} (${testCase.cedula})`, () => {
        expect(CedulaEcuatorianaValidator.isValid(testCase.cedula)).toBe(false);
      });
    });
  });

  describe('validateAndFormat', () => {
    it('should return formatted cedula for valid input with extra chars', () => {
      expect(CedulaEcuatorianaValidator.validateAndFormat('171-234-5678')).toBe('1712345678');
      expect(CedulaEcuatorianaValidator.validateAndFormat('091 234 5678')).toBe('0912345678');
    });

    it('should return formatted cedula for valid numeric string input', () => {
      expect(CedulaEcuatorianaValidator.validateAndFormat('0102345678')).toBe('0102345678');
    });

    it('should return null for invalid cedula', () => {
      expect(CedulaEcuatorianaValidator.validateAndFormat('1712345679')).toBeNull(); // Dígito verificador incorrecto
      expect(CedulaEcuatorianaValidator.validateAndFormat('123')).toBeNull(); // Muy corta
    });
  });

  describe('getProvinciaInfo', () => {
    it('should return provincia info for a valid cedula', () => {
      const info = CedulaEcuatorianaValidator.getProvinciaInfo('1712345678');
      expect(info).toEqual({ codigo: 17, nombre: 'Pichincha' });
    });

    it('should return null for an invalid cedula', () => {
      expect(CedulaEcuatorianaValidator.getProvinciaInfo('1712345679')).toBeNull();
    });
  });
});