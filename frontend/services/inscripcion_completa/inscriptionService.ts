// services/inscriptionService.ts
import { EditInscriptionRequest, InscriptionData } from '@/models/inscripcion_completa/inscription';
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
    descripcionDescuento: string;
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

      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();

      const response = await fetch(`${API_BASE_URL}/inscripciones?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      const data = await response.json();
      console.log('📥 Respuesta inscripciones:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripciones');
      }

      // 🆕 ENRIQUECER CON DATOS DE FACTURAS PARA DETERMINAR ESTADO REAL
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('🔄 Enriqueciendo inscripciones con datos de facturas...');
        const enrichedData = await this.enrichInscriptionsWithFacturas(data.data);
        return {
          ...data,
          data: enrichedData
        };
      }

      return data;
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error fetching inscriptions:', error);
      throw new Error(
        errorObj.message || 'Error de conexión al obtener inscripciones'
      );
    }
  }

  // Obtener una inscripción por ID
  async getInscriptionById(id: number): Promise<InscriptionDetailResponse> {
    try {
      console.log('🚀 Obteniendo inscripción por ID:', id);

      // Obtener headers de autenticación
      const authHeaders = authService.getAuthHeader();

      const response = await fetch(`${API_BASE_URL}/inscripciones/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      const data = await response.json();
      console.log('📥 Respuesta inscripción:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripción');
      }

      // 🆕 ENRIQUECER CON DATOS DE FACTURAS PARA DETERMINAR ESTADO REAL
      if (data.success && data.data) {
        console.log('🔄 Enriqueciendo inscripción individual con datos de facturas...');
        const enrichedData = await this.enrichInscriptionsWithFacturas([data.data]);
        return {
          ...data,
          data: enrichedData[0]
        };
      }

      return data;
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error fetching inscription:', error);
      throw new Error(
        errorObj.message || 'Error de conexión al obtener inscripción'
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
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error creating inscription:', error);
      throw new Error(
        errorObj.message || 'Error al crear inscripción'
      );
    }
  }

  // Enriquecer inscripciones con estado real basado en facturas
  async enrichInscriptionsWithFacturas(inscriptions: InscriptionApiData[]): Promise<InscriptionApiData[]> {
    console.log(`🔄 Enriqueciendo ${inscriptions.length} inscripciones con datos de facturas...`);
    
    try {
      // Procesar cada inscripción para obtener su estado real
      const enrichedInscriptions = await Promise.all(
        inscriptions.map(async (inscription) => {
          try {
            console.log(`📋 Procesando inscripción ${inscription.idInscripcion}, matricula: ${inscription.matricula}`);
            
            // Si ya está matriculado, mantener el estado
            if (inscription.matricula) {
              console.log(`✅ Inscripción ${inscription.idInscripcion} ya está matriculada`);
              return inscription;
            }

            // Verificar facturas para inscripciones no matriculadas
            console.log(`🔍 Consultando facturas para inscripción ${inscription.idInscripcion}...`);
            
            // Obtener headers de autenticación
            const authHeaders = authService.getAuthHeader();
            
            const response = await fetch(`${API_BASE_URL}/facturas/inscripcion/${inscription.idInscripcion}`, {
              method: 'GET',
              headers: { 
                'Content-Type': 'application/json',
                ...authHeaders
              },
            });

            console.log(`📥 Respuesta facturas para ${inscription.idInscripcion}:`, {
              ok: response.ok,
              status: response.status
            });

            if (response.ok) {
              const facturaData = await response.json();
              console.log(`💰 Datos facturas para ${inscription.idInscripcion}:`, {
                success: facturaData.success,
                dataLength: facturaData.data?.length,
                data: facturaData.data
              });

              if (facturaData.success && facturaData.data && Array.isArray(facturaData.data)) {
                // Verificar si hay facturas con pago verificado
                const facturaVerificada = facturaData.data.find((factura: { verificacionPago?: boolean }) => factura.verificacionPago === true);
                
                if (facturaVerificada) {
                  console.log(`✅ Inscripción ${inscription.idInscripcion} tiene pago verificado! Factura:`, facturaVerificada);
                  // Marcar como "pseudo-matriculada" para mostrar estado VALIDADO
                  return {
                    ...inscription,
                    matricula: false, // Mantener matrícula real
                    // Agregar flag temporal para distinguir estados
                    _pagoVerificado: true
                  } as InscriptionApiData & { _pagoVerificado?: boolean };
                } else {
                  console.log(`⏳ Inscripción ${inscription.idInscripcion} tiene facturas pero ninguna verificada`);
                }
              } else {
                console.log(`ℹ️ Inscripción ${inscription.idInscripcion} no tiene facturas`);
              }
            } else {
              console.log(`❌ Error consultando facturas para ${inscription.idInscripcion}:`, response.status);
            }

            return inscription;
          } catch (error) {
            console.warn(`❌ Error verificando facturas para inscripción ${inscription.idInscripcion}:`, error);
            return inscription;
          }
        })
      );

      console.log(`✅ Enriquecimiento completado. ${enrichedInscriptions.length} inscripciones procesadas`);
      return enrichedInscriptions;
    } catch (error) {
      console.warn('❌ Error enriqueciendo inscripciones:', error);
      return inscriptions;
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
      descuento: apiData.descuento ? {
        idDescuento: apiData.descuento.idDescuento,
        tipoDescuento: apiData.descuento.tipoDescuento,
        valorDescuento: Number(apiData.descuento.valorDescuento),
        porcentajeDescuento: Number(apiData.descuento.porcentajeDescuento),
        descripcionDescuento: apiData.descuento.descripcionDescuento || `Descuento ${apiData.descuento.tipoDescuento} - $${apiData.descuento.valorDescuento}`
      } : undefined,
      // Estado basado en matrícula O verificación de pago
      estado: this.determinarEstadoFromApiData(apiData),
      matricula: apiData.matricula,
      fechaInscripcion: new Date(apiData.fechaInscripcion)
    };
  }

  // Determinar estado real considerando matrícula y verificación de pago
  private determinarEstadoFromApiData(apiData: InscriptionApiData & { _pagoVerificado?: boolean }): "PENDIENTE" | "VALIDADO" | "RECHAZADO" {
    console.log(`🎯 Determinando estado para inscripción ${apiData.idInscripcion}:`, {
      matricula: apiData.matricula,
      _pagoVerificado: (apiData as InscriptionApiData & { _pagoVerificado?: boolean })._pagoVerificado
    });
    
    // Si está matriculado, siempre VALIDADO
    if (apiData.matricula) {
      console.log(`✅ Estado: VALIDADO (matriculado) para ${apiData.idInscripcion}`);
      return "VALIDADO";
    }
    
    // Si tiene pago verificado (flag temporal), VALIDADO
    if ((apiData as InscriptionApiData & { _pagoVerificado?: boolean })._pagoVerificado) {
      console.log(`✅ Estado: VALIDADO (pago verificado) para ${apiData.idInscripcion}`);
      return "VALIDADO";
    }
    
    // Por defecto, PENDIENTE
    console.log(`⏳ Estado: PENDIENTE para ${apiData.idInscripcion}`);
    return "PENDIENTE";
  }

  // Determinar estado basado en matrícula
  private getEstadoFromInscripcion(
    matricula: boolean
  ): "PENDIENTE" | "VALIDADO" | "RECHAZADO" {
    
    // Si ya está matriculado, está validado
    if (matricula) {
      return "VALIDADO";
    }
    
    // Por defecto está pendiente (las facturas se verificarán por separado)
    return "PENDIENTE";
  }

  // Nuevo método para verificar estado con facturas
  async getEstadoWithFacturas(inscripcionId: number, matricula: boolean): Promise<"PENDIENTE" | "VALIDADO" | "RECHAZADO"> {
    try {
      // Si ya está matriculado, está validado
      if (matricula) {
        return "VALIDADO";
      }

      // Verificar si tiene facturas verificadas
      const authHeaders = authService.getAuthHeader();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_BASE_URL}/facturas/inscripcion/${inscripcionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          const tieneFacturaVerificada = data.data.some((factura: { verificacionPago?: boolean }) => factura.verificacionPago === true);
          if (tieneFacturaVerificada) {
            return "VALIDADO";
          }
        }
      }

      return "PENDIENTE";
    } catch (error) {
      console.warn('Error verificando facturas para estado:', error);
      return matricula ? "VALIDADO" : "PENDIENTE";
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
      
      const updatePromises: Promise<unknown>[] = [];
      
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
        const typedResponse = response as Response;
        if (!typedResponse.ok) {
          const errorData = await typedResponse.json();
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
      
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error updating inscription:', error);
      throw new Error(
        errorObj.message || 'Error al actualizar inscripción'
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
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error deleting inscription:', error);
      throw new Error(
        errorObj.message || 'Error al eliminar la inscripción'
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
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error fetching courses for change:', error);
      throw new Error(errorObj.message || 'Error al obtener cursos disponibles');
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
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error matriculating inscription:', error);
      throw new Error(
        errorObj.message || 'Error al matricular la inscripción'
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
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('❌ Error downloading receipt:', error);
      throw new Error(
        errorObj.message || 'Error al descargar el comprobante'
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

  // 🆕 VERIFICAR SI EL ADMIN PUEDE MATRICULAR
  async canMatriculate(inscripcionId: number, userType: 'admin' | 'accountant'): Promise<boolean> {
    try {
      if (userType !== 'admin') return false;

      // Verificar si tiene facturas verificadas
      const authHeaders = authService.getAuthHeader();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_BASE_URL}/facturas/inscripcion/${inscripcionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          // Solo puede matricular si hay facturas verificadas
          return data.data.some((factura: { verificacionPago?: boolean }) => factura.verificacionPago === true);
        }
      }

      return false;
    } catch (error) {
      console.warn('Error verificando si puede matricular:', error);
      return false;
    }
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
