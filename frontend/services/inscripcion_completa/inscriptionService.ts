// services/inscriptionService.ts
import { api } from '../api';
import { EditInscriptionRequest, InscriptionData, FiscalInformationRequest } from '@/models/inscripcion_completa/inscription';
import { authService } from '@/services/login/authService';

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
    switch (estado.toUpperCase()) {
      case 'PENDIENTE':
        return {
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-100',
          text: 'Pendiente de Validación'
        };
      case 'VALIDADO':
        return {
          color: 'text-green-800',
          bgColor: 'bg-green-100',
          text: 'Pago Validado'
        };
      case 'RECHAZADO':
        return {
          color: 'text-red-800',
          bgColor: 'bg-red-100',
          text: 'Pago Rechazado'
        };
      default:
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-100',
          text: 'Sin Estado'
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
      console.log('🚀 Actualizando inscripción con múltiples endpoints:', updateData);
      
      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();
      
      // Obtener los IDs necesarios de la inscripción actual
      const inscriptionResponse = await this.getInscriptionById(updateData.idInscripcion);
      if (!inscriptionResponse.success) {
        throw new Error('No se pudo obtener la inscripción para actualizar');
      }
      
      const inscription = inscriptionResponse.data;
      const idPersona = inscription.datosPersonales.idPersona;
      const idFacturacion = inscription.datosFacturacion.idFacturacion;
      
      const updatePromises: Promise<any>[] = [];
      
      // 1. Actualizar datos personales si se proporcionaron
      if (updateData.datosPersonales && Object.keys(updateData.datosPersonales).length > 0) {
        console.log('📝 Actualizando datos personales...');
        const personalDataPromise = fetch(`${API_BASE_URL}/datos-personales/${idPersona}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify(updateData.datosPersonales)
        });
        updatePromises.push(personalDataPromise);
      }
      
      // 2. Actualizar datos de facturación si se proporcionaron
      if (updateData.datosFacturacion && Object.keys(updateData.datosFacturacion).length > 0) {
        console.log('💰 Actualizando datos de facturación...');
        const billingDataPromise = fetch(`${API_BASE_URL}/datos-facturacion/${idFacturacion}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify(updateData.datosFacturacion)
        });
        updatePromises.push(billingDataPromise);
      }
      
      // 3. Actualizar curso si se proporcionó (solo admin)
      if (updateData.nuevoCurso !== undefined && updateData.nuevoCurso !== null) {
        console.log('📚 Actualizando curso...', { 
          inscripcionId: updateData.idInscripcion,
          nuevoCursoId: updateData.nuevoCurso,
          cursoAnterior: inscription.curso.idCurso
        });
        const courseUpdatePromise = fetch(`${API_BASE_URL}/inscripciones/${updateData.idInscripcion}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({ idCurso: updateData.nuevoCurso })
        });
        updatePromises.push(courseUpdatePromise);
      }
      
      // Ejecutar todas las actualizaciones en paralelo
      const responses = await Promise.all(updatePromises);
      
      // Verificar que todas las respuestas sean exitosas
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error en una de las actualizaciones');
        }
      }
      
      console.log('✅ Todas las actualizaciones completadas exitosamente');
      
      // Retornar una respuesta simulada de éxito (el controlador recargará los datos)
      return {
        success: true,
        data: inscription, // Los datos se recargarán desde el servidor
        message: 'Inscripción actualizada exitosamente'
      };
      
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

      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();

      const response = await fetch(`${API_BASE_URL}/inscripciones/${inscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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
      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();

      const response = await fetch(`${API_BASE_URL}/cursos/disponibles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  // 🆕 MATRICULAR INSCRIPCIÓN - Actualizar solo matrícula después de validación de pago
  async matricularInscripcion(inscriptionId: number): Promise<InscriptionDetailResponse> {
    try {
      console.log('🎓 Matriculando inscripción:', inscriptionId);

      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();

      // Actualizar matrícula en la inscripción
      const response = await fetch(`${API_BASE_URL}/inscripciones/${inscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ 
          matricula: true
        })
      });

      const data = await response.json();
      console.log('📥 Respuesta matriculación:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al matricular inscripción');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error matriculating inscription:', error);
      throw new Error(
        error.message || 'Error al matricular la inscripción'
      );
    }
  }



  // 🆕 DESCARGAR COMPROBANTE
  async downloadReceipt(inscription: InscriptionData): Promise<Blob> {
    try {
      if (!inscription.comprobante) {
        throw new Error('No hay comprobante disponible');
      }

      console.log('📥 Descargando comprobante:', inscription.comprobante.nombreArchivo);

      const response = await fetch(`${API_BASE_URL}/comprobantes/${inscription.comprobante.idComprobante}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al descargar comprobante');
      }

      return await response.blob();
    } catch (error: any) {
      console.error('❌ Error downloading receipt:', error);
      throw new Error(
        error.message || 'Error al descargar el comprobante'
      );
    }
  }

  // 🆕 OBTENER URL DE COMPROBANTE PARA VISUALIZACIÓN
  getReceiptViewUrl(inscription: InscriptionData): string {
    if (!inscription.comprobante) {
      return '';
    }
    return `${API_BASE_URL}/comprobantes/${inscription.comprobante.idComprobante}/view`;
  }

  // 🆕 VERIFICAR SI EL CONTADOR PUEDE VALIDAR
  canValidatePayment(inscription: InscriptionData, userType: 'admin' | 'accountant'): boolean {
    // Solo contador y admin pueden validar
    // Solo se pueden validar inscripciones PENDIENTES
    return (userType === 'accountant' || userType === 'admin') && inscription.estado === 'PENDIENTE';
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
