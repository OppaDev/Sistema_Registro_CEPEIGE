// models/payment.ts
import { z } from 'zod';

export interface PaymentReceipt {
  idComprobante?: number;
  fechaSubida?: Date;
  rutaComprobante?: string;
  tipoArchivo?: string;
  nombreArchivo?: string;
  file?: File;
}

export const paymentReceiptSchema = z.object({
  file: z.any()
    .refine((file) => file instanceof File, 'Debe seleccionar un archivo')
    .refine((file) => file && file.size <= 5 * 1024 * 1024, 'El archivo no debe superar 5MB')
    .refine(
      (file) => file && ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type),
      'Solo se permiten archivos PNG, JPG, JPEG o PDF'
    )
});

export interface PaymentFormMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface PaymentFieldErrors {
  [key: string]: string;
}

export const ALLOWED_FILE_TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'application/pdf': '.pdf'
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
