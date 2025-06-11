// models/participant.ts (actualizado)


export interface Participant {
  selectedCourse?: {
    courseId: number;
    courseName: string;
    coursePrice: number;
  };
  ciPasaporte: string;        // ✅ Cambio: ciOrPassport → ciPasaporte
  nombres: string;            // ✅ Cambio: fullName → nombres  
  apellidos: string;          // ✅ Cambio: lastName → apellidos
  numTelefono: string;        // ✅ Cambio: phoneNumber → numTelefono
  correo: string;             // ✅ Cambio: email → correo
  pais: string;               // ✅ Cambio: country → pais
  provinciaEstado: string;    // ✅ Cambio: cityOrProvince → provinciaEstado
  ciudad: string;             // ✅ NUEVO CAMPO
  profesion: string;          // ✅ Igual
  institucion: string;        // ✅ Igual
}

export interface FormMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface FieldErrors {
  [key: string]: string;
}
