// models/participant.ts (actualizado)
import { CourseSelection } from './course';

export interface Participant {
  // Datos del curso seleccionado
  selectedCourse?: CourseSelection;
  
  // Datos personales existentes
  ciOrPassport: string;
  fullName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  country: string;
  cityOrProvince: string;
  profession: string;
  institution: string;
}

export interface FormMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface FieldErrors {
  [key: string]: string;
}
