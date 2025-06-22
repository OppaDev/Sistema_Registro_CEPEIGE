import { CedulaEcuatorianaValidator } from './utils/cedulaValidator';

// Verificar las cédulas proporcionadas por el usuario
const cedulasAVerificar = ['0402084040', '0450041645', '0450041629'];

console.log('Verificando cédulas proporcionadas:');
cedulasAVerificar.forEach(cedula => {
  const esValida = CedulaEcuatorianaValidator.isValid(cedula);
  const provincia = CedulaEcuatorianaValidator.getProvinciaInfo(cedula);
  
  console.log(`Cédula: ${cedula}`);
  console.log(`Válida: ${esValida}`);
  if (provincia) {
    console.log(`Provincia: ${provincia.nombre} (código: ${provincia.codigo})`);
  }
  console.log('---');
});
