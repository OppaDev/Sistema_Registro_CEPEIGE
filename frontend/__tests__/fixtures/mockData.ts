// Datos de prueba para los tests
export const mockCourses = [
  { 
    idCurso: 1, 
    nombreCortoCurso: 'PYTHON-BAS', 
    nombreCurso: 'Curso de Python - Nivel Básico',
    descripcionCurso: 'Curso básico de Python',
    modalidadCurso: 'Virtual',
    valorCurso: 150.00,
    fechaInicioCurso: new Date('2024-01-01'),
    fechaFinCurso: new Date('2024-02-01'),
  },
  { 
    idCurso: 2, 
    nombreCortoCurso: 'JAVA-ADV', 
    nombreCurso: 'Curso de Java - Nivel Avanzado',
    descripcionCurso: 'Curso avanzado de Java',
    modalidadCurso: 'Presencial',
    valorCurso: 250.00,
    fechaInicioCurso: new Date('2024-02-01'),
    fechaFinCurso: new Date('2024-04-01'),
  },
  { 
    idCurso: 3, 
    nombreCortoCurso: 'REACT-INT', 
    nombreCurso: 'Curso de React - Nivel Intermedio',
    descripcionCurso: 'Curso intermedio de React',
    modalidadCurso: 'Virtual',
    valorCurso: 200.00,
    fechaInicioCurso: new Date('2024-03-01'),
    fechaFinCurso: new Date('2024-05-01'),
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
  participante: mockPersonalData,
  facturacion: mockBillingData,
  curso: mockCourses[0],
  fechaInscripcion: '2024-01-15',
  estadoPago: 'pendiente'
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
