/**
 * Pruebas y ejemplos de la validación de cédula ecuatoriana
 * Ejecutar con: node -r ts-node/register cedulaTest.ts
 */

import { CedulaEcuatorianaValidator } from './cedulaValidator';

console.log('=== PRUEBAS DE VALIDACIÓN DE CÉDULA ECUATORIANA ===\n');

// Casos de prueba
const testCases = [
  // Cédulas válidas
  { cedula: '1712345678', expected: true, description: 'Cédula válida de Pichincha' },
  { cedula: '0912345678', expected: true, description: 'Cédula válida de Guayas' },
  { cedula: '0102345678', expected: true, description: 'Cédula válida de Azuay' },
  
  // Cédulas inválidas
  { cedula: '1712345679', expected: false, description: 'Cédula con dígito verificador incorrecto' },
  { cedula: '2512345678', expected: false, description: 'Cédula con código de provincia inválido (25)' },
  { cedula: '1762345678', expected: false, description: 'Cédula con tercer dígito mayor a 5' },
  { cedula: '171234567', expected: false, description: 'Cédula con menos de 10 dígitos' },
  { cedula: '17123456789', expected: false, description: 'Cédula con más de 10 dígitos' },
  { cedula: '171234567a', expected: false, description: 'Cédula con caracteres no numéricos' },
  { cedula: '', expected: false, description: 'Cédula vacía' },
  { cedula: '0012345678', expected: false, description: 'Cédula con código de provincia 00' },
];

// Ejecutar pruebas
testCases.forEach((testCase, index) => {
  const result = CedulaEcuatorianaValidator.isValid(testCase.cedula);
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${index + 1}. ${status} - ${testCase.description}`);
  console.log(`   Cédula: ${testCase.cedula || '(vacía)'}`);
  console.log(`   Esperado: ${testCase.expected}, Obtenido: ${result}`);
  
  if (result && testCase.expected) {
    const provinciaInfo = CedulaEcuatorianaValidator.getProvinciaInfo(testCase.cedula);
    if (provinciaInfo) {
      console.log(`   Provincia: ${provinciaInfo.nombre} (${provinciaInfo.codigo})`);
    }
  }
  console.log('');
});

// Prueba de formateo
console.log('=== PRUEBAS DE FORMATEO ===\n');

const formatTests = [
  '1712345678',
  '171-234-5678',
  '171 234 5678',
  '1712345679', // Inválida
];

formatTests.forEach((cedula, index) => {
  const formatted = CedulaEcuatorianaValidator.validateAndFormat(cedula);
  console.log(`${index + 1}. Entrada: "${cedula}"`);
  console.log(`   Formateada: ${formatted || 'INVÁLIDA'}`);
  console.log('');
});

console.log('=== ALGORITMO DE VALIDACIÓN ===');
console.log('1. Verificar que tenga exactamente 10 dígitos');
console.log('2. Verificar que los primeros 2 dígitos sean un código de provincia válido (01-24)');
console.log('3. Verificar que el tercer dígito sea menor a 6 (personas naturales)');
console.log('4. Aplicar algoritmo del dígito verificador:');
console.log('   - Multiplicar por 2 los dígitos en posiciones pares (0,2,4,6,8)');
console.log('   - Si el resultado es > 9, restar 9');
console.log('   - Sumar todos los dígitos procesados');
console.log('   - El dígito verificador debe ser: (10 - (suma % 10)) % 10');
