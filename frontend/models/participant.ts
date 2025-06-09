// models/participant.ts
export interface Participant {
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

export interface ParticipantFormData extends Participant {}

export interface FormMessage {
  text: string;
  type: 'success' | 'error';
}

export interface FieldErrors {
  [key: string]: string;
}
