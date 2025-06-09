// models/validation.ts (actualizado)
import { z } from 'zod';

export const participantSchema = z.object({
  // Validación del curso
  selectedCourse: z.object({
    courseId: z.number().min(1, 'Debe seleccionar un curso'),
    courseName: z.string().min(1, 'Nombre del curso requerido'),
    coursePrice: z.number().min(0, 'Precio del curso inválido')
  }).optional().refine((val) => val !== undefined, {
    message: 'Debe seleccionar un curso'
  }),
  
  // Validaciones existentes
  ciOrPassport: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  fullName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  lastName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  phoneNumber: z.string()
    .min(10, 'Mínimo 10 dígitos')
    .max(15, 'Máximo 15 dígitos'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Máximo 100 caracteres'),
  country: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  cityOrProvince: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  profession: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  institution: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
});

export const FIELD_PLACEHOLDERS: Record<string, string> = {
  ciOrPassport: 'Ej: 1234567890',
  fullName: 'Ej: Juan Carlos',
  lastName: 'Ej: Pérez García',
  phoneNumber: 'Ej: +593987654321',
  email: 'Ej: juan.perez@email.com',
  country: 'Ej: Ecuador',
  cityOrProvince: 'Ej: Quito',
  profession: 'Ej: Ingeniero de Sistemas',
  institution: 'Ej: Universidad Central'
};
