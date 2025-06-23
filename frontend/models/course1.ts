export interface Course {
 idCurso: number;
  nombreCorto: string;
  nombreCurso: string;
  modalidad: string;
  duracion: string;
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

