// services/inscriptionService.ts
import { api } from './api';
import { EditInscriptionRequest, InscriptionData } from '@/models/inscription';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface InscriptionApiData {
  idInscripcion: number;
  curso: {
    idCurso: number;
    nombreCurso: string;
    modalidadCurso: string;
    valorCurso: number;
    fechaInicioCurso: string;
    fechaFinCurso: string;
  };
  datosPersonales: {
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
  };
  datosFacturacion: {
    idFacturacion: number;
    razonSocial: string;
    identificacionTributaria: string;
    telefono: string;
    correoFactura: string;
    direccion: string;
  };
  comprobante: {
    idComprobante: number;
    fechaSubida: string;
    rutaComprobante: string;
    tipoArchivo: string;
    nombreArchivo: string;
  };
  descuento?: {
    idDescuento: number;
    tipoDescuento: string;
    valorDescuento: number;
    porcentajeDescuento: number;
  };
  matricula: boolean;
  fechaInscripcion: string;
}

export interface InscriptionListResponse {
  success: boolean;
  data: InscriptionApiData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface InscriptionDetailResponse {
  success: boolean;
  data: InscriptionApiData;
  message: string;
}

export interface CreateInscriptionData {
  idCurso: number;
  idPersona: number;
  idFacturacion: number;
  idComprobante: number;
}

class InscriptionService {
  // Obtener todas las inscripciones con paginación
  async getAllInscriptions(params: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<InscriptionListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = 'fechaInscripcion',
        order = 'desc'
      } = params;

      console.log('🚀 Obteniendo inscripciones:', { page, limit, orderBy, order });

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        order
      });

      const response = await fetch(`${API_BASE_URL}/inscripciones?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 Respuesta inscripciones:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripciones');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error fetching inscriptions:', error);
      throw new Error(
        error.message || 'Error de conexión al obtener inscripciones'
      );
    }
  }

  // Obtener una inscripción por ID
  async getInscriptionById(id: number): Promise<InscriptionDetailResponse> {
    try {
      console.log('🚀 Obteniendo inscripción por ID:', id);

      const response = await fetch(`${API_BASE_URL}/inscripciones/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 Respuesta inscripción:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripción');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error fetching inscription:', error);
      throw new Error(
        error.message || 'Error de conexión al obtener inscripción'
      );
    }
  }

  // Crear nueva inscripción (para el formulario)
  async createInscription(inscriptionData: CreateInscriptionData): Promise<InscriptionDetailResponse> {
    try {
      console.log('🚀 Creando inscripción:', inscriptionData);

      const response = await fetch(`${API_BASE_URL}/inscripciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inscriptionData)
      });

      const data = await response.json();
      console.log('📥 Respuesta crear inscripción:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear inscripción');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error creating inscription:', error);
      throw new Error(
        error.message || 'Error al crear inscripción'
      );
    }
  }

  // Mapear datos de API a modelo del frontend
  mapApiDataToInscriptionData(apiData: InscriptionApiData): InscriptionData {
    return {
      idInscripcion: apiData.idInscripcion,
      participante: {
        idParticipante: apiData.datosPersonales.idPersona,
        ciPasaporte: apiData.datosPersonales.ciPasaporte,
        nombres: apiData.datosPersonales.nombres,
        apellidos: apiData.datosPersonales.apellidos,
        numTelefono: apiData.datosPersonales.numTelefono,
        correo: apiData.datosPersonales.correo,
        pais: apiData.datosPersonales.pais,
        provinciaEstado: apiData.datosPersonales.provinciaEstado,
        ciudad: apiData.datosPersonales.ciudad,
        profesion: apiData.datosPersonales.profesion,
        institucion: apiData.datosPersonales.institucion
      },
      curso: {
        idCurso: apiData.curso.idCurso,
        nombreCurso: apiData.curso.nombreCurso,
        modalidad: apiData.curso.modalidadCurso,
        precio: Number(apiData.curso.valorCurso),
        fechaInicio: new Date(apiData.curso.fechaInicioCurso),
        fechaFin: new Date(apiData.curso.fechaFinCurso)
      },
      facturacion: {
        idFacturacion: apiData.datosFacturacion.idFacturacion,
        razonSocial: apiData.datosFacturacion.razonSocial,
        identificacionTributaria: apiData.datosFacturacion.identificacionTributaria,
        telefono: apiData.datosFacturacion.telefono,
        correoFactura: apiData.datosFacturacion.correoFactura,
        direccion: apiData.datosFacturacion.direccion
      },
      comprobante: {
        idComprobante: apiData.comprobante.idComprobante,
        fechaSubida: new Date(apiData.comprobante.fechaSubida),
        rutaComprobante: apiData.comprobante.rutaComprobante,
        tipoArchivo: apiData.comprobante.tipoArchivo,
        nombreArchivo: apiData.comprobante.nombreArchivo
      },
      //
      //descuento: apiData.descuento ? {
       // idDescuento: apiData.descuento.idDescuento,
        //tipoDescuento: apiData.descuento.tipoDescuento,
        //valorDescuento: Number(apiData.descuento.valorDescuento),
        //porcentajeDescuento: Number(apiData.descuento.porcentajeDescuento)
      //} : undefined,
      estado: this.getEstadoFromMatricula(apiData.matricula),
      fechaInscripcion: new Date(apiData.fechaInscripcion)
    };
  }

  // Determinar estado basado en matrícula y otros factores
 private getEstadoFromMatricula(matricula: boolean): "PENDIENTE" | "VALIDADO" | "RECHAZADO" {
  if (matricula) {
    return "VALIDADO";
  } else {
    return "PENDIENTE";
  }
}
  // Funciones auxiliares para la UI
  getStatusBadge(estado: string) {
    switch (estado) {
      case 'pendiente':
        return {
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-100',
          text: 'Pendiente'
        };
      case 'validada':
        return {
          color: 'text-green-800',
          bgColor: 'bg-green-100',
          text: 'Validada'
        };
      case 'rechazada':
        return {
          color: 'text-red-800',
          bgColor: 'bg-red-100',
          text: 'Rechazada'
        };
      default:
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-100',
          text: 'Sin estado'
        };
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
    async updateInscription(updateData: EditInscriptionRequest): Promise<InscriptionDetailResponse> {
    try {
      console.log('🚀 Actualizando inscripción:', updateData);

      const response = await fetch(`${API_BASE_URL}/inscripciones/${updateData.idInscripcion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('📥 Respuesta actualización:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar inscripción');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error updating inscription:', error);
      throw new Error(
        error.message || 'Error al actualizar inscripción'
      );
    }
  }
   async deleteInscription(inscriptionId: number): Promise<InscriptionDetailResponse> {
    try {
      console.log('🗑️ Eliminando inscripción:', inscriptionId);

      const response = await fetch(`${API_BASE_URL}/inscripciones/${inscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 Respuesta eliminación:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la inscripción');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error deleting inscription:', error);
      throw new Error(
        error.message || 'Error al eliminar la inscripción'
      );
    }
  }

  // 🆕 VERIFICAR SI UNA INSCRIPCIÓN ES ELIMINABLE
  isInscriptionDeletable(inscription: InscriptionData): boolean {
    // Solo se pueden eliminar inscripciones PENDIENTES
    return inscription.estado === 'PENDIENTE';
  }

  // Obtener cursos disponibles para cambio (solo admin)
  async getAvailableCoursesForChange(): Promise<{ id: number; nombre: string; precio: number }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cursos/disponibles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cursos');
      }

      return data.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching courses for change:', error);
      throw new Error(error.message || 'Error al obtener cursos disponibles');
    }
  }

  // Validar si inscripción es editable
  isInscriptionEditable(inscription: InscriptionData): boolean {
    // Solo se pueden editar inscripciones PENDIENTES
    return inscription.estado === 'PENDIENTE';
  }

  // Obtener campos editables según rol
  getEditableFields(userType: 'admin' | 'accountant') {
    const commonFields = {
      participante: [
        'nombres', 'apellidos', 'numTelefono', 'correo', 
        'pais', 'provinciaEstado', 'ciudad', 'profesion', 'institucion'
      ],
      facturacion: [
        'razonSocial', 'identificacionTributaria', 'telefono', 
        'correoFactura', 'direccion'
      ]
    };

    if (userType === 'admin') {
      return {
        ...commonFields,
        curso: ['idCurso'] // Admin puede cambiar curso
      };
    }

    return commonFields; // Contador no puede cambiar curso
  }
}

export const inscriptionService = new InscriptionService();

// Importar el tipo InscriptionData del modelo existente
