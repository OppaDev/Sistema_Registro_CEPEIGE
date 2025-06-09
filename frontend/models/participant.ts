// frontend/models/participant.ts
import { CourseSelection } from './course'; // Importar desde course.ts

export interface Participant {
  // Datos del curso seleccionado
  selectedCourse?: CourseSelection;
  
  // Datos personales
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

export interface ApiParticipant {
  id?: number;
  ciOrPassport: string;
  fullName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  country: string;
  cityOrProvince: string;
  profession: string;
  institution: string;
  selectedCourseId?: number;
  createdAt?: string;
  updatedAt?: string;
}
