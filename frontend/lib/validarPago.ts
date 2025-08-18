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
export const isPaymentValidated = (inscription: Record<string, unknown>): boolean => {
  // Lógica para determinar si el pago está validado
  // Puede basarse en el estado, existencia de factura con verificación, etc.
  return inscription.estado === 'VALIDADO' || inscription.matricula === true;
};

// Determinar el paso actual en el flujo de validación
export const getValidationStep = (inscription: Record<string, unknown>, factura: Record<string, unknown> | null): PaymentValidationStep => {
  if (!factura) {
    return PAYMENT_VALIDATION_STEPS.PENDING;
  }
  
  if (!factura.verificacionPago) {
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