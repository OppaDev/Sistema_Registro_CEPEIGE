// lib/validarPago.ts
// Configuración y utilidades para el flujo de validación de pagos

export const PAYMENT_VALIDATION_STEPS = {
  PENDING: 'pending',
  CREATING_INVOICE: 'creating_invoice', 
  READY_TO_VALIDATE: 'ready_to_validate',
  VALIDATED: 'validated'
} as const;

export const ENROLLMENT_STATUS = {
  NOT_ENROLLED: 'not_enrolled',
  ENROLLED: 'enrolled'
} as const;

export const DISCOUNT_TYPES = {
  ESTUDIANTE: 'estudiante',
  INSTITUCION: 'institucion', 
  PROMOCIONAL: 'promocional',
  OTRO: 'otro'
} as const;

export type PaymentValidationStep = typeof PAYMENT_VALIDATION_STEPS[keyof typeof PAYMENT_VALIDATION_STEPS];
export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];
export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];

// Determinar si el pago ha sido validado basado en el estado de la inscripción
<<<<<<< HEAD
export const isPaymentValidated = (inscription: Record<string, unknown>): boolean => {
=======
export const isPaymentValidated = (inscription: unknown): boolean => {
  const typedInscription = inscription as { estado?: string; matricula?: boolean };
>>>>>>> 6dbacb0d99939f9f59772c82424aaa1ccffab05b
  // Lógica para determinar si el pago está validado
  // Puede basarse en el estado, existencia de factura con verificación, etc.
  return typedInscription.estado === 'VALIDADO' || typedInscription.matricula === true;
};

// Determinar el paso actual en el flujo de validación
<<<<<<< HEAD
export const getValidationStep = (inscription: Record<string, unknown>, factura: Record<string, unknown> | null): PaymentValidationStep => {
  if (!factura) {
=======
export const getValidationStep = (inscription: unknown, factura: unknown): PaymentValidationStep => {
  const typedFactura = factura as { verificacionPago?: boolean } | null;
  if (!typedFactura) {
>>>>>>> 6dbacb0d99939f9f59772c82424aaa1ccffab05b
    return PAYMENT_VALIDATION_STEPS.PENDING;
  }
  
  if (!typedFactura.verificacionPago) {
    return PAYMENT_VALIDATION_STEPS.READY_TO_VALIDATE;
  }
  
  return PAYMENT_VALIDATION_STEPS.VALIDATED;
};

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)} USD`;
};

export const formatInvoiceNumber = (numero: string): string => {
  return numero.toUpperCase();
};

export const formatReceiptNumber = (numero: string): string => {
  return numero.toUpperCase();
};