// models/validation.ts
import { z } from "zod";

export const participantSchema = z.object({

   selectedCourse: z.object({
    courseId: z.number().min(1, 'Debe seleccionar un curso'),
    courseName: z.string().min(1, 'Nombre del curso requerido'),
    coursePrice: z.number().min(0, 'Precio del curso inválido')
  }).optional().refine((val) => val !== undefined, {
    message: 'Debe seleccionar un curso'
  }),
  ciOrPassport: z.string()
    .regex(/^\d{10}$|^[A-Z]{2}\d{6}$/, 
      "Cédula: 10 dígitos o Pasaporte: 2 letras y 6 dígitos"),
  fullName: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/, 
      "Solo letras y espacios, mínimo 2 caracteres"),
  lastName: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/, 
      "Solo letras y espacios, mínimo 2 caracteres"),
  phoneNumber: z.string()
    .regex(/^\+?\d{7,15}$/, 
      "Solo números, entre 7 y 15 dígitos, puede iniciar con +"),
  email: z.string()
    .email("Correo: formato inválido"),
  country: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/, 
      "Solo letras y espacios, mínimo 2 caracteres"),
  cityOrProvince: z.string().min(1, "Campo requerido"),
  profession: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/, 
      "Solo letras y espacios, mínimo 2 caracteres"),
  institution: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/, 
      "Solo letras y espacios, mínimo 2 caracteres")
});

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
