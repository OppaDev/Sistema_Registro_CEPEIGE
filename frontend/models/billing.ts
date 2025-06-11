// models/billing.ts
import { z } from 'zod';

export interface BillingData {
  idFacturacion?: number;
  razonSocial: string;
  identificacionTributaria: string;
  telefono: string;
  correoFactura: string;
  direccion: string;
}

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
