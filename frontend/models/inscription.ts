// models/inscription.ts
export interface InscriptionData {
  idInscripcion: number;
  fechaInscripcion: Date;
  estado: 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO';
  
  // Datos del participante
  participante: {
    idParticipante: number;
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
  };
  
  // Datos del curso
  curso: {
    idCurso: number;
    nombreCurso: string;
    precio: number;
    fechaInicio: Date;
    fechaFin: Date;
    modalidad: string;
  };
  
  // Datos de facturación
  facturacion: {
    idFacturacion: number;
    razonSocial: string;
    identificacionTributaria: string;
    telefono: string;
    correoFactura: string;
    direccion: string;
  };
  
  // Comprobante de pago
  comprobante?: {
    idComprobante: number;
    fechaSubida: Date;
    rutaComprobante: string;
    tipoArchivo: string;
    nombreArchivo: string;
  };
   //descuento?: {
    //idDescuento: number;
    //tipoDescuento: string;
    //valorDescuento: number;
    //porcentajeDescuento: number;
  //};
}

export interface InscriptionFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  curso?: string;
  busqueda?: string;
}

export interface InscriptionTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface EditableInscriptionData {
  // Datos del participante (editables)
  participante: {
    nombres: string;
    apellidos: string;
    numTelefono: string;
    correo: string;
    pais: string;
    provinciaEstado: string;
    ciudad: string;
    profesion: string;
    institucion: string;
    // CI/Pasaporte NO editable por seguridad
  };
  
  // Datos de facturación (editables)
  facturacion: {
    razonSocial: string;
    identificacionTributaria: string;
    telefono: string;
    correoFactura: string;
    direccion: string;
  };
  
  // Curso (editable solo por admin)
  curso?: {
    idCurso: number;
  };
}

export interface EditInscriptionRequest {
  idInscripcion: number;
  datosPersonales?: Partial<EditableInscriptionData['participante']>;
  datosFacturacion?: Partial<EditableInscriptionData['facturacion']>;
  nuevoCurso?: number; // Solo admin
}