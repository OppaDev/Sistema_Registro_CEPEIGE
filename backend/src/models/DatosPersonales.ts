export interface DatosPersonales {
  idPersona: number;
  ciPasaporte: string;
  nombres: string;
  apellidos: string;
  numTelefono: string;
  correo: string;
  pais: string;
  provinciaEstado: string;
  ciudad: string;
  profesion: string;
  institucion: string;
}

export interface PersonaCompleta extends DatosPersonales {
  nombreCompleto: string; // Computed property
  inscripciones?: Inscripcion[];
}