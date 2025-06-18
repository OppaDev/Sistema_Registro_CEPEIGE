// models/validation.ts
import { z } from "zod";
// models/validation.ts

function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const digitos = cedula.split('').map(Number);
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = digitos[i];
    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
  }
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digitos[9];
}

export const participantSchema = z.object({
  selectedCourse: z.object({
    courseId: z.number(),
    courseName: z.string(),
    coursePrice: z.number()
  }).optional(),
 ciPasaporte: z.string()
  .min(1, 'CI o Pasaporte es requerido')
  .max(20, 'CI o Pasaporte muy largo')
  .refine(
    value =>
      (/^[A-Z]{2}\d{6,8}$/i.test(value)) || validarCedulaEcuatoriana(value),
    {
      message: "Debe ser una cédula ecuatoriana válida o un pasaporte (2 letras seguidas de 6 a 8 dígitos)",
    }
  ),
  nombres: z.string()
    .min(1, 'Los nombres son requeridos')
    .max(100, 'Nombres muy largos')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  apellidos: z.string()
    .min(1, 'Los apellidos son requeridos')
    .max(100, 'Apellidos muy largos')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  numTelefono: z.string()
    .min(1, 'El número de teléfono es requerido')
    .max(15, 'Número muy largo')
    // validar que solo sea numerico y que numero valido
    .regex(/^\+?\d{7,15}$/, 'Número de teléfono inválido. Debe tener entre 7 y 15 dígitos, con o sin el prefijo +'),
  
  correo: z.string()
    .email('Formato de correo inválido')
    .min(1, 'El correo es requerido')
    .max(100, 'Correo muy largo'),
  pais: z.string()
    .min(1, 'El país es requerido')
    .max(30, 'País muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  provinciaEstado: z.string()
    .min(1, 'La provincia/estado es requerida')
    .max(50, 'Provincia/estado muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  ciudad: z.string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'Ciudad muy larga')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  profesion: z.string()
    .min(1, 'La profesión es requerida')
    .max(100, 'Profesión muy larga')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  institucion: z.string()
    .min(1, 'La institución es requerida')
    .max(100, 'Institución muy larga')
});

export const billingSchema = z.object({
  razonSocial: z.string()
    .min(1, 'La razón social es requerida')
    .max(100, 'Razón social muy larga')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\&0-9]+$/, 
      'Solo letras, números, espacios y caracteres especiales permitidos (- . &)'),
  identificacionTributaria: z.string()
    .min(1, 'La identificación tributaria es requerida')
    .max(50, 'Identificación tributaria muy larga')
    // Validar que sea una cédula ecuatoriana válida o un RUC de 13 dígitos del ecuador
    .refine(value => {
      if (/^\d{10}$/.test(value)) {
        return validarCedulaEcuatoriana(value);
      }
      if (/^\d{13}$/.test(value)) {
        // Validar RUC (13 dígitos)
        const digitos = value.split('').map(Number);
        const provincia = parseInt(value.substring(0, 2), 10);
        if (provincia < 1 || provincia > 24) return false;
        const tercerDigito = digitos[2];
        if (![6, 9].includes(tercerDigito)) return false; // RUC debe empezar con 6 o 9
        let suma = 0;
        for (let i = 0; i < 12; i++) {
          let valor = digitos[i];
          if (i % 2 === 0) {
            valor *= 2;
            if (valor > 9) valor -= 9;
          }
          suma += valor;
        }
        const digitoVerificador = (10 - (suma % 10)) % 10;
        return digitoVerificador === digitos[12];
      }
      return false;
    }, 'Debe ser una cédula ecuatoriana válida o un RUC de 13 dígitos'),
  telefono: z.string()
    .min(1, 'El teléfono es requerido')
    .max(20, 'Teléfono muy largo')
    //validar que solo sea numerico y que numero valido
    .regex(/^\+?\d{7,15}$/, 'Número de teléfono inválido. Debe tener entre 7 y 15 dígitos, con o sin el prefijo +'),
  correoFactura: z.string()
    .email('Formato de correo inválido')
    .min(1, 'El correo de facturación es requerido')
    .max(100, 'Correo muy largo'),
  direccion: z.string()
    .min(1, 'La dirección es requerida')
    .max(250, 'Dirección muy larga')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  
});

export interface BillingFormMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface BillingFieldErrors {
  [key: string]: string;
}

export const FIELD_PLACEHOLDERS: Record<string, string> = {
  ciOrPassport: "1004228621 o 2AB123456",
  fullName: "Juan Carlos",
  lastName: "Pérez López",
  phoneNumber: "+593 991234567",
  email: "juan@email.com",
  country: "Ecuador",
  cityOrProvince: "Quito",
  profession: "Ingeniero",
  institution: "Universidad de las Fuerzas Armadas"
};
// models/validation.ts - AGREGAR AL FINAL
export const BILLING_FIELD_PLACEHOLDERS: Record<string, string> = {
  razonSocial: "Mi Empresa S.A. o Juan Pérez",
  identificacionTributaria: "1791234567001 o 1004228621",
  telefono: "+593 99 999 9999",
  correoFactura: "facturacion@empresa.com",
  direccion: "Av. Principal 123 y Secundaria, Quito, Ecuador"
};

