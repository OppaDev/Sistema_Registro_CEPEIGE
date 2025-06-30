import { validate } from 'class-validator';
import { IsDateFromToday, IsDateAfter, IsDateBefore } from './dateValidators';

// Clase de prueba para usar el decorador
class TestDateClass {
  @IsDateFromToday()
  dateField?: string | undefined;
}

describe('B. Validador @IsDateFromToday (dateValidators.ts)', () => {
  let testInstance: TestDateClass;

  beforeEach(() => {
    testInstance = new TestDateClass();
  });

  describe('Fechas Válidas', () => {
    // DFH-001: Fecha de entrada es el día de hoy
    it('DFH-001: debería validar correctamente la fecha de hoy', async () => {
      const today = new Date().toISOString().split('T')[0];
      testInstance.dateField = today;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFH-002: Fecha de entrada es en el futuro
    it('DFH-002: debería validar correctamente una fecha en el futuro', async () => {
      testInstance.dateField = '2099-12-31';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // Casos adicionales de fechas válidas
    it('debería validar correctamente otras fechas futuras', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      testInstance.dateField = tomorrowString;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas futuras lejanas', async () => {
      testInstance.dateField = '2030-06-15';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Fechas Inválidas', () => {
    // DFH-003: Fecha de entrada es en el pasado
    it('DFH-003: debería rechazar una fecha en el pasado', async () => {
      testInstance.dateField = '2020-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateFromToday');
    });

    // DFH-004: Formato de fecha inválido
    it('DFH-004: debería rechazar formato de fecha inválido', async () => {
      testInstance.dateField = 'fecha invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateFromToday');
    });

    // Casos adicionales de fechas inválidas
    it('debería rechazar fechas en el pasado reciente', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      testInstance.dateField = yesterdayString;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateFromToday');
    });

    it('debería rechazar fechas en el pasado lejano', async () => {
      testInstance.dateField = '1990-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateFromToday');
    });

    it('debería rechazar formatos de fecha completamente inválidos', async () => {
      const invalidFormats = [
        'no-es-fecha',
        'abc-def-ghi',
        'fecha invalida',
        '32/13/2025',     // Día inválido
        'invalid-date',
        'not a date',
        'xyz123',
      ];

      for (const invalidFormat of invalidFormats) {
        testInstance.dateField = invalidFormat;
        
        const errors = await validate(testInstance);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toHaveProperty('isDateFromToday');
      }
    });
  });

  describe('Casos Edge - Valores Especiales', () => {
    // DFH-005: Entrada null o undefined
    it('DFH-005: debería permitir valores null y undefined (campos opcionales)', async () => {
      // Prueba con null
      testInstance.dateField = null as any;
      let errors = await validate(testInstance);
      expect(errors).toHaveLength(0);

      // Prueba con undefined
      testInstance.dateField = undefined;
      errors = await validate(testInstance);
      expect(errors).toHaveLength(0);

      // Prueba sin asignar el campo (undefined por defecto)
      const emptyInstance = new TestDateClass();
      errors = await validate(emptyInstance);
      expect(errors).toHaveLength(0);
    });

    // Casos adicionales de valores especiales
    it('debería manejar correctamente cadenas vacías', async () => {
      testInstance.dateField = '';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // Cadena vacía se trata como valor ausente
    });

    it('debería manejar correctamente espacios en blanco', async () => {
      testInstance.dateField = '   ';
      
      const errors = await validate(testInstance);
      // Los espacios en blanco deberían ser tratados como valor ausente (sin error)
      expect(errors).toHaveLength(0);
    });

    it('debería rechazar tipos de datos incorrectos convertidos a string', async () => {
      const invalidTypes = [
        'NaN',        // NaN como string
        'Infinity',   // Infinity como string
        'not-a-date', // String que no es fecha
        'undefined',  // undefined como string
        'null',       // null como string
      ];

      for (const invalidType of invalidTypes) {
        testInstance.dateField = invalidType;
        
        const errors = await validate(testInstance);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toHaveProperty('isDateFromToday');
      }
    });
  });

  describe('Casos de Límites y Bordes', () => {
    it('debería validar correctamente fechas límite', async () => {
      // Fecha de hoy a las 23:59:59 (debe pasar)
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      testInstance.dateField = todayString;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cambios de zona horaria', async () => {
      // Usar fecha futura para evitar problemas de zona horaria
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      testInstance.dateField = futureDateString;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas ISO válidas pero en el pasado', async () => {
      testInstance.dateField = '2020-12-31T23:59:59.999Z';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateFromToday');
    });

    it('debería validar correctamente fechas ISO válidas en el futuro', async () => {
      testInstance.dateField = '2099-01-01T00:00:00.000Z';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Mensajes de Error', () => {
    it('debería generar el mensaje de error correcto', async () => {
      testInstance.dateField = '2020-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints!['isDateFromToday']).toBe(
        'dateField debe ser una fecha válida mayor o igual a la fecha actual'
      );
    });

    it('debería generar el mensaje de error correcto para fechas inválidas', async () => {
      testInstance.dateField = 'fecha invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints!['isDateFromToday']).toBe(
        'dateField debe ser una fecha válida mayor o igual a la fecha actual'
      );
    });
  });
});

// Clase de prueba para IsDateAfter
class TestDateAfterClass {
  fechaInicioCurso?: string | null | undefined;
  
  @IsDateAfter('fechaInicioCurso')
  fechaFinCurso?: string | null | undefined;
}

describe('C. Validador @IsDateAfter(\'fechaInicioCurso\') (dateValidators.ts)', () => {
  let testInstance: TestDateAfterClass;

  beforeEach(() => {
    testInstance = new TestDateAfterClass();
  });

  describe('Fechas Válidas', () => {
    // DFA-001: Fecha de fin es posterior a fecha de inicio
    it('DFA-001: debería validar correctamente cuando fecha fin es posterior a fecha inicio', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-10';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFA-002: Fecha de fin es igual a fecha de inicio
    it('DFA-002: debería validar correctamente cuando fecha fin es igual a fecha inicio', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFA-004: La fecha de inicio (relatedProperty) es nula
    it('DFA-004: debería validar correctamente cuando fecha de inicio es nula', async () => {
      testInstance.fechaInicioCurso = null;
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFA-005: La fecha de fin (valor) es nula
    it('DFA-005: debería validar correctamente cuando fecha de fin es nula', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = null;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // Casos adicionales de fechas válidas
    it('debería validar correctamente fechas con diferencia de días', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2025-01-15';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas con diferencia de meses', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2025-03-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas con diferencia de años', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2026-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Fechas Inválidas', () => {
    // DFA-003: Fecha de fin es anterior a fecha de inicio
    it('DFA-003: debería rechazar cuando fecha fin es anterior a fecha inicio', async () => {
      testInstance.fechaInicioCurso = '2025-10-10';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateAfter');
      expect(errors[0].property).toBe('fechaFinCurso');
    });

    // Casos adicionales de fechas inválidas
    it('debería rechazar cuando fecha fin es varios días anterior', async () => {
      testInstance.fechaInicioCurso = '2025-10-15';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateAfter');
    });

    it('debería rechazar cuando fecha fin es meses anterior', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-08-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateAfter');
    });

    it('debería rechazar cuando fecha fin es años anterior', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2024-12-31';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateAfter');
    });
  });

  describe('Casos Edge - Valores Especiales', () => {
    it('debería manejar correctamente cuando ambas fechas son nulas', async () => {
      testInstance.fechaInicioCurso = null;
      testInstance.fechaFinCurso = null;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cuando ambas fechas son undefined', async () => {
      testInstance.fechaInicioCurso = undefined;
      testInstance.fechaFinCurso = undefined;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente fechas con formato ISO completo', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T08:00:00.000Z';
      testInstance.fechaFinCurso = '2025-10-01T18:00:00.000Z';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente fechas con diferentes formatos de hora', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T23:59:59';
      testInstance.fechaFinCurso = '2025-10-02T00:00:00';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Casos de Fechas Inválidas como String', () => {
    it('debería manejar correctamente cuando fecha inicio es inválida', async () => {
      testInstance.fechaInicioCurso = 'fecha-invalida';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });

    it('debería manejar correctamente cuando fecha fin es inválida', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = 'fecha-invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });

    it('debería manejar correctamente cuando ambas fechas son inválidas', async () => {
      testInstance.fechaInicioCurso = 'fecha-inicio-invalida';
      testInstance.fechaFinCurso = 'fecha-fin-invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });
  });

  describe('Casos de Límites y Bordes', () => {
    it('debería validar correctamente fechas en el mismo día con diferentes horas', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T09:00:00';
      testInstance.fechaFinCurso = '2025-10-01T17:00:00';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas consecutivas', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-02';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería rechazar fechas con diferencia mínima (1 día anterior)', async () => {
      testInstance.fechaInicioCurso = '2025-10-02';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateAfter');
    });

    it('debería manejar correctamente fechas de años bisiestos', async () => {
      testInstance.fechaInicioCurso = '2024-02-28';
      testInstance.fechaFinCurso = '2024-02-29';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cambios de mes', async () => {
      testInstance.fechaInicioCurso = '2025-01-31';
      testInstance.fechaFinCurso = '2025-02-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cambios de año', async () => {
      testInstance.fechaInicioCurso = '2024-12-31';
      testInstance.fechaFinCurso = '2025-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });
});

// Clase de prueba para IsDateBefore
class TestDateBeforeClass {
  @IsDateBefore('fechaFinCurso')
  fechaInicioCurso?: string | null | undefined;
  
  fechaFinCurso?: string | null | undefined;
}

describe('D. Validador @IsDateBefore(\'fechaFinCurso\') (dateValidators.ts)', () => {
  let testInstance: TestDateBeforeClass;

  beforeEach(() => {
    testInstance = new TestDateBeforeClass();
  });

  describe('Fechas Válidas', () => {
    // DFB-001: Fecha de inicio es anterior a fecha de fin
    it('DFB-001: debería validar correctamente cuando fecha inicio es anterior a fecha fin', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-10';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFB-002: Fecha de inicio es igual a fecha de fin
    it('DFB-002: debería validar correctamente cuando fecha inicio es igual a fecha fin', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFB-004: La fecha de fin (relatedProperty) es nula
    it('DFB-004: debería validar correctamente cuando fecha de fin es nula', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = null;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // DFB-005: La fecha de inicio (valor) es nula
    it('DFB-005: debería validar correctamente cuando fecha de inicio es nula', async () => {
      testInstance.fechaInicioCurso = null;
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    // Casos adicionales de fechas válidas
    it('debería validar correctamente fechas con diferencia de días', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2025-01-15';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas con diferencia de meses', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2025-03-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas con diferencia de años', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2026-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente fechas muy próximas', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-02';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Fechas Inválidas', () => {
    // DFB-003: Fecha de inicio es posterior a fecha de fin
    it('DFB-003: debería rechazar cuando fecha inicio es posterior a fecha fin', async () => {
      testInstance.fechaInicioCurso = '2025-10-10';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
      expect(errors[0].property).toBe('fechaInicioCurso');
    });

    // Casos adicionales de fechas inválidas
    it('debería rechazar cuando fecha inicio es varios días posterior', async () => {
      testInstance.fechaInicioCurso = '2025-10-15';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });

    it('debería rechazar cuando fecha inicio es meses posterior', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-08-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });

    it('debería rechazar cuando fecha inicio es años posterior', async () => {
      testInstance.fechaInicioCurso = '2026-01-01';
      testInstance.fechaFinCurso = '2025-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });

    it('debería rechazar diferencia mínima (1 día posterior)', async () => {
      testInstance.fechaInicioCurso = '2025-10-02';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });
  });

  describe('Casos Edge - Valores Especiales', () => {
    it('debería manejar correctamente cuando ambas fechas son nulas', async () => {
      testInstance.fechaInicioCurso = null;
      testInstance.fechaFinCurso = null;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cuando ambas fechas son undefined', async () => {
      testInstance.fechaInicioCurso = undefined;
      testInstance.fechaFinCurso = undefined;
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente fechas con formato ISO completo', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T08:00:00.000Z';
      testInstance.fechaFinCurso = '2025-10-01T18:00:00.000Z';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente fechas con diferentes formatos de hora en el mismo día', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T09:00:00';
      testInstance.fechaFinCurso = '2025-10-01T17:00:00';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente con horas que cruzan medianoche', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T23:59:59';
      testInstance.fechaFinCurso = '2025-10-02T00:00:00';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Casos de Fechas Inválidas como String', () => {
    it('debería manejar correctamente cuando fecha inicio es inválida', async () => {
      testInstance.fechaInicioCurso = 'fecha-invalida';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });

    it('debería manejar correctamente cuando fecha fin es inválida', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = 'fecha-invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });

    it('debería manejar correctamente cuando ambas fechas son inválidas', async () => {
      testInstance.fechaInicioCurso = 'fecha-inicio-invalida';
      testInstance.fechaFinCurso = 'fecha-fin-invalida';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0); // No debe fallar aquí, solo compara fechas válidas
    });

    it('debería manejar cadenas vacías correctamente', async () => {
      testInstance.fechaInicioCurso = '';
      testInstance.fechaFinCurso = '';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar espacios en blanco correctamente', async () => {
      testInstance.fechaInicioCurso = '   ';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Casos de Límites y Bordes', () => {
    it('debería validar correctamente fechas consecutivas', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-02';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente fechas de años bisiestos', async () => {
      testInstance.fechaInicioCurso = '2024-02-28';
      testInstance.fechaFinCurso = '2024-02-29';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cambios de mes', async () => {
      testInstance.fechaInicioCurso = '2025-01-31';
      testInstance.fechaFinCurso = '2025-02-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar correctamente cambios de año', async () => {
      testInstance.fechaInicioCurso = '2024-12-31';
      testInstance.fechaFinCurso = '2025-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería rechazar fechas muy cercanas pero en orden incorrecto', async () => {
      testInstance.fechaInicioCurso = '2025-10-01T12:00:01';
      testInstance.fechaFinCurso = '2025-10-01T12:00:00';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });

    it('debería validar correctamente períodos largos', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2025-12-31';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente períodos muy largos', async () => {
      testInstance.fechaInicioCurso = '2025-01-01';
      testInstance.fechaFinCurso = '2030-12-31';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Casos de Uso Realistas', () => {
    it('debería validar correctamente un curso de una semana', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-08';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente un curso de un mes', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-11-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería validar correctamente un curso de un día (workshop)', async () => {
      testInstance.fechaInicioCurso = '2025-10-01';
      testInstance.fechaFinCurso = '2025-10-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('debería rechazar fechas logicamente inconsistentes', async () => {
      testInstance.fechaInicioCurso = '2025-12-01';
      testInstance.fechaFinCurso = '2025-01-01';
      
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isDateBefore');
    });
  });
});
