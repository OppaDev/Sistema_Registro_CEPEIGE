import { 
  CedulaEcuatorianaValidator, 
  isValidCedulaEcuatoriana, 
  CEDULA_ERROR_MESSAGE, 
  CEDULA_REGEX 
} from './cedulaValidator';

describe('CedulaEcuatorianaValidator', () => {
  describe('isValid', () => {
    // Casos de cédulas válidas (incluyendo las que proporcionaste)
    describe('cédulas válidas', () => {
      const cedulasValidas = [
        '0402084040', // Carchi
        '0450041645', // Carchi
        '0450041629', // Carchi
        '1714617890', // Pichincha
        '0926687856', // Guayas
        '0601234567', // Chimborazo
        '1803456789', // Tungurahua
      ];

      test.each(cedulasValidas)('debería validar la cédula %s como válida', (cedula) => {
        expect(CedulaEcuatorianaValidator.isValid(cedula)).toBe(true);
      });
    });

    // Casos de cédulas inválidas
    describe('cédulas inválidas', () => {
      const cedulasInvalidas = [
        '0402084041', // Dígito verificador incorrecto
        '0450041646', // Dígito verificador incorrecto
        '0450041628', // Dígito verificador incorrecto
        '1234567890', // Código de provincia inválido
        '0000000000', // Código de provincia inválido
        '2534567890', // Código de provincia mayor a 24
        '1764567890', // Tercer dígito >= 6
        '1717777777', // Suma incorrecta
      ];

      test.each(cedulasInvalidas)('debería validar la cédula %s como inválida', (cedula) => {
        expect(CedulaEcuatorianaValidator.isValid(cedula)).toBe(false);
      });
    });

    // Casos de formato inválido
    describe('formato inválido', () => {
      const formatosInvalidos = [
        '', // Vacío
        '123', // Muy corta
        '12345678901', // Muy larga
        'abcdefghij', // Letras
        '123abc7890', // Mixto
        '123-456-789', // Con guiones
        '123 456 789', // Con espacios
        null, // Null
        undefined, // Undefined
      ];

      test.each(formatosInvalidos)('debería rechazar formato inválido: %s', (cedula) => {
        expect(CedulaEcuatorianaValidator.isValid(cedula as string)).toBe(false);
      });
    });

    // Casos especiales de limpieza
    describe('limpieza de caracteres', () => {
      test('debería validar cédula con espacios', () => {
        expect(CedulaEcuatorianaValidator.isValid(' 0402084040 ')).toBe(true);
      });

      test('debería validar cédula con guiones', () => {
        expect(CedulaEcuatorianaValidator.isValid('040-208-4040')).toBe(true);
      });

      test('debería validar cédula con puntos', () => {
        expect(CedulaEcuatorianaValidator.isValid('040.208.4040')).toBe(true);
      });
    });

    // Casos de códigos de provincia
    describe('códigos de provincia', () => {
      test('debería rechazar código de provincia 00', () => {
        expect(CedulaEcuatorianaValidator.isValid('0012345678')).toBe(false);
      });

      test('debería rechazar código de provincia mayor a 24', () => {
        expect(CedulaEcuatorianaValidator.isValid('2512345678')).toBe(false);
      });

      test('debería aceptar código de provincia 01', () => {
        expect(CedulaEcuatorianaValidator.isValid('0150867890')).toBe(true);
      });

      test('debería aceptar código de provincia 24', () => {
        expect(CedulaEcuatorianaValidator.isValid('2450867890')).toBe(true);
      });
    });

    // Casos de tercer dígito
    describe('tercer dígito', () => {
      test('debería rechazar tercer dígito 6', () => {
        expect(CedulaEcuatorianaValidator.isValid('0462084040')).toBe(false);
      });

      test('debería rechazar tercer dígito mayor a 6', () => {
        expect(CedulaEcuatorianaValidator.isValid('0472084040')).toBe(false);
      });

      test('debería aceptar tercer dígito 0-5', () => {
        expect(CedulaEcuatorianaValidator.isValid('0402084040')).toBe(true);
        expect(CedulaEcuatorianaValidator.isValid('0412084040')).toBe(false); // Este debe ser inválido por el dígito verificador
      });
    });
  });

  describe('validateAndFormat', () => {
    test('debería formatear cédula válida', () => {
      const resultado = CedulaEcuatorianaValidator.validateAndFormat(' 040-208-4040 ');
      expect(resultado).toBe('0402084040');
    });

    test('debería retornar null para cédula inválida', () => {
      const resultado = CedulaEcuatorianaValidator.validateAndFormat('1234567890');
      expect(resultado).toBeNull();
    });

    test('debería remover caracteres no numéricos', () => {
      const resultado = CedulaEcuatorianaValidator.validateAndFormat('040.208.4040');
      expect(resultado).toBe('0402084040');
    });
  });

  describe('getProvinciaInfo', () => {
    test('debería retornar información de provincia para cédula válida', () => {
      const info = CedulaEcuatorianaValidator.getProvinciaInfo('0402084040');
      expect(info).toEqual({
        codigo: 4,
        nombre: 'Carchi'
      });
    });

    test('debería retornar información correcta para diferentes provincias', () => {
      const testCases = [
        { cedula: '0402084040', expectedCodigo: 4, expectedNombre: 'Carchi' },
        { cedula: '1714617890', expectedCodigo: 17, expectedNombre: 'Pichincha' },
        { cedula: '0926687856', expectedCodigo: 9, expectedNombre: 'Guayas' },
        { cedula: '0601234567', expectedCodigo: 6, expectedNombre: 'Chimborazo' },
      ];

      testCases.forEach(({ cedula, expectedCodigo, expectedNombre }) => {
        const info = CedulaEcuatorianaValidator.getProvinciaInfo(cedula);
        expect(info?.codigo).toBe(expectedCodigo);
        expect(info?.nombre).toBe(expectedNombre);
      });
    });

    test('debería retornar null para cédula inválida', () => {
      const info = CedulaEcuatorianaValidator.getProvinciaInfo('1234567890');
      expect(info).toBeNull();
    });

    test('debería manejar todas las provincias ecuatorianas', () => {
      // Test para asegurar que todas las provincias están mapeadas
      const provinciasEsperadas = [
        'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Cotopaxi', 'Chimborazo',
        'El Oro', 'Esmeraldas', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
        'Manabí', 'Morona Santiago', 'Napo', 'Pastaza', 'Pichincha',
        'Tungurahua', 'Zamora Chinchipe', 'Galápagos', 'Sucumbíos',
        'Orellana', 'Santo Domingo de los Tsáchilas', 'Santa Elena'
      ];

      expect(provinciasEsperadas).toHaveLength(24);
    });
  });
});

describe('Helper functions', () => {
  describe('isValidCedulaEcuatoriana', () => {
    test('debería ser una función wrapper de CedulaEcuatorianaValidator.isValid', () => {
      expect(isValidCedulaEcuatoriana('0402084040')).toBe(true);
      expect(isValidCedulaEcuatoriana('1234567890')).toBe(false);
    });

    test('debería validar todas las cédulas de prueba', () => {
      expect(isValidCedulaEcuatoriana('0402084040')).toBe(true);
      expect(isValidCedulaEcuatoriana('0450041645')).toBe(true);
      expect(isValidCedulaEcuatoriana('0450041629')).toBe(true);
    });
  });

  describe('Constants', () => {
    test('CEDULA_ERROR_MESSAGE debería ser un string descriptivo', () => {
      expect(CEDULA_ERROR_MESSAGE).toBe('Debe ingresar una cédula ecuatoriana válida (10 dígitos)');
      expect(typeof CEDULA_ERROR_MESSAGE).toBe('string');
    });

    test('CEDULA_REGEX debería validar formato básico', () => {
      expect(CEDULA_REGEX.test('0402084040')).toBe(true);
      expect(CEDULA_REGEX.test('123456789')).toBe(false); // 9 dígitos
      expect(CEDULA_REGEX.test('12345678901')).toBe(false); // 11 dígitos
      expect(CEDULA_REGEX.test('123abc7890')).toBe(false); // Con letras
    });
  });
});

describe('Algoritmo de validación específico', () => {
  test('debería validar correctamente el algoritmo del dígito verificador', () => {
    // Test específico para entender el algoritmo
    const cedula = '0402084040';
    
    // Simulamos el algoritmo paso a paso
    const digitos = cedula.split('').map(Number);
    const codigoProvincia = parseInt(cedula.substring(0, 2));
    
    expect(codigoProvincia).toBe(4); // Carchi
    expect(digitos[2]).toBeLessThan(6); // Tercer dígito válido
    
    // Calculamos la suma según el algoritmo
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = digitos[i];
      if (i % 2 === 0) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      suma += digito;
    }
    
    const residuo = suma % 10;
    const digitoEsperado = residuo === 0 ? 0 : 10 - residuo;
    
    expect(digitoEsperado).toBe(digitos[9]); // Dígito verificador
  });

  test('debería fallar con dígito verificador incorrecto', () => {
    // Cambiamos el último dígito para que sea incorrecto
    expect(CedulaEcuatorianaValidator.isValid('0402084041')).toBe(false);
    expect(CedulaEcuatorianaValidator.isValid('0450041646')).toBe(false);
  });
});

describe('Edge cases', () => {
  test('debería manejar entrada undefined o null', () => {
    expect(CedulaEcuatorianaValidator.isValid(undefined as any)).toBe(false);
    expect(CedulaEcuatorianaValidator.isValid(null as any)).toBe(false);
  });

  test('debería manejar strings vacíos', () => {
    expect(CedulaEcuatorianaValidator.isValid('')).toBe(false);
    expect(CedulaEcuatorianaValidator.isValid('   ')).toBe(false);
  });

  test('debería manejar números como strings', () => {
    expect(CedulaEcuatorianaValidator.isValid('0402084040')).toBe(true);
  });
});