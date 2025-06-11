// models/validation.ts
import { z } from "zod";

export const participantSchema = z.object({
  selectedCourse: z.object({
    courseId: z.number(),
    courseName: z.string(),
    coursePrice: z.number()
  }).optional(),
  ciPasaporte: z.string()
    .min(1, 'CI o Pasaporte es requerido')
    .max(20, 'CI o Pasaporte muy largo'),
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
    .max(15, 'Número muy largo'),
  correo: z.string()
    .email('Formato de correo inválido')
    .min(1, 'El correo es requerido')
    .max(100, 'Correo muy largo'),
  pais: z.string()
    .min(1, 'El país es requerido')
    .max(30, 'País muy largo'),
  provinciaEstado: z.string()
    .min(1, 'La provincia/estado es requerida')
    .max(50, 'Provincia/estado muy largo'),
  ciudad: z.string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'Ciudad muy larga'),
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
    .max(50, 'Identificación tributaria muy larga'),
  telefono: z.string()
    .min(1, 'El teléfono es requerido')
    .max(20, 'Teléfono muy largo'),
  correoFactura: z.string()
    .email('Formato de correo inválido')
    .min(1, 'El correo de facturación es requerido')
    .max(100, 'Correo muy largo'),
  direccion: z.string()
    .min(1, 'La dirección es requerida')
    .max(250, 'Dirección muy larga')
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
  phoneNumber: "0991234567",
  email: "juan@email.com",
  country: "Ecuador",
  cityOrProvince: "Quito",
  profession: "Ingeniero",
  institution: "Universidad Central"
};
// models/validation.ts - AGREGAR AL FINAL
export const BILLING_FIELD_PLACEHOLDERS: Record<string, string> = {
  razonSocial: "Mi Empresa S.A. o Juan Pérez",
  identificacionTributaria: "1791234567001 o 1004228621",
  telefono: "+593 99 999 9999",
  correoFactura: "facturacion@empresa.com",
  direccion: "Av. Principal 123 y Secundaria, Quito, Ecuador"
};

