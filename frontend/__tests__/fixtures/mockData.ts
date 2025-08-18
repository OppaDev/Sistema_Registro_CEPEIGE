// Datos de prueba para los tests
export const mockCourses = [
  { 
    idCurso: 1, 
    nombreCorto: 'PYTHON-BAS', 
    nombreLargo: 'Curso de Python - Nivel Básico',
    costoTotal: 100,
    activo: true
  },
  { 
    idCurso: 2, 
    nombreCorto: 'JAVA-ADV', 
    nombreLargo: 'Curso de Java - Nivel Avanzado',
    costoTotal: 150,
    activo: true
  },
  { 
    idCurso: 3, 
    nombreCorto: 'REACT-INT', 
    nombreLargo: 'Curso de React - Nivel Intermedio',
    costoTotal: 120,
    activo: true
  }
];

// Datos personales de prueba (PREF-002)
export const mockPersonalData = {
  nombres: 'Ana',
  apellidos: 'Gómez',
  ciPasaporte: '1234567890',
  numTelefono: '0999999999',
  correo: 'ana@mail.com',
  pais: 'Ecuador',
  provinciaEstado: 'Pichincha',
  ciudad: 'Quito',
  profesion: 'Ingeniera',
  institucion: 'ESPE'
};

// Datos de facturación de prueba (PREF-003)
export const mockBillingData = {
  razonSocial: 'Ana Gómez',
  identificacionTributaria: '1790010010001',
  telefono: '0988888888',
  correoFactura: 'facturas@ana.com',
  direccion: 'Av. América y Av. Patria'
};

// Inscripción completa de prueba
export const mockInscription = {
  idInscripcion: 1,
  fechaInscripcion: new Date('2024-01-15'),
  estado: 'PENDIENTE' as const,
  matricula: false,
  participante: {
    idParticipante: 1,
    ...mockPersonalData
  },
  facturacion: {
    idFacturacion: 1,
    ...mockBillingData
  },
  curso: {
    idCurso: 1,
    nombreCurso: 'Curso de Python - Nivel Básico',
    precio: 100,
    fechaInicio: new Date('2024-02-01'),
    fechaFin: new Date('2024-02-28'),
    modalidad: 'Virtual'
  },
  comprobante: {
    idComprobante: 1,
    fechaSubida: new Date('2024-01-16'),
    rutaComprobante: 'uploads/comprobantes/comprobante_123.jpg',
    tipoArchivo: 'image/jpeg',
    nombreArchivo: 'comprobante_123.jpg'
  }
};

// Archivo de prueba válido (PREF-004)
export const createMockFile = (name: string, type: string) => {
  return new File(['dummy content'], name, { type });
};

export const mockValidFiles = {
  pdf: () => createMockFile('comprobante_pago.pdf', 'application/pdf'),
  png: () => createMockFile('comprobante.png', 'image/png'),
  jpg: () => createMockFile('comprobante.jpg', 'image/jpeg'),
};

export const mockInvalidFiles = {
  txt: () => createMockFile('documento.txt', 'text/plain'),
  doc: () => createMockFile('documento.doc', 'application/msword'),
  exe: () => createMockFile('virus.exe', 'application/octet-stream'),
};
