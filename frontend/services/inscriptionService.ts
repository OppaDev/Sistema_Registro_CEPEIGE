// services/inscriptionService.ts
import { InscriptionData, InscriptionFilters } from '@/models/inscription';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}

class InscriptionService {
  async getAllInscriptions(
    page: number = 1,
    limit: number = 10,
    filters?: InscriptionFilters
  ): Promise<ApiResponse<InscriptionData[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      console.log('🔍 Consultando inscripciones:', { page, limit, filters });

      const response = await fetch(`${API_BASE_URL}/inscripciones?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripciones');
      }

      return {
        success: data.success,
        data: data.data.map((item: any) => ({
          idInscripcion: item.idInscripcion,
          fechaInscripcion: new Date(item.fechaInscripcion),
          estado: item.estado,
          participante: {
            idParticipante: item.participante.idParticipante,
            ciPasaporte: item.participante.ciPasaporte,
            nombres: item.participante.nombres,
            apellidos: item.participante.apellidos,
            numTelefono: item.participante.numTelefono,
            correo: item.participante.correo,
            pais: item.participante.pais,
            provinciaEstado: item.participante.provinciaEstado,
            ciudad: item.participante.ciudad,
            profesion: item.participante.profesion,
            institucion: item.participante.institucion
          },
          curso: {
            idCurso: item.curso.idCurso,
            nombreCurso: item.curso.nombreCurso,
            precio: item.curso.precio,
            fechaInicio: new Date(item.curso.fechaInicio),
            fechaFin: new Date(item.curso.fechaFin),
            modalidad: item.curso.modalidad
          },
          facturacion: {
            idFacturacion: item.facturacion.idFacturacion,
            razonSocial: item.facturacion.razonSocial,
            identificacionTributaria: item.facturacion.identificacionTributaria,
            telefono: item.facturacion.telefono,
            correoFactura: item.facturacion.correoFactura,
            direccion: item.facturacion.direccion
          },
          comprobante: item.comprobante ? {
            idComprobante: item.comprobante.idComprobante,
            fechaSubida: new Date(item.comprobante.fechaSubida),
            rutaComprobante: item.comprobante.rutaComprobante,
            tipoArchivo: item.comprobante.tipoArchivo,
            nombreArchivo: item.comprobante.nombreArchivo
          } : undefined
        })),
        message: data.message,
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error: any) {
      console.error('❌ Error getting inscriptions:', error);
      throw error;
    }
  }

  async getInscriptionById(id: number): Promise<ApiResponse<InscriptionData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inscripciones/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener inscripción');
      }

      return {
        success: data.success,
        data: {
          idInscripcion: data.data.idInscripcion,
          fechaInscripcion: new Date(data.data.fechaInscripcion),
          estado: data.data.estado,
          participante: data.data.participante,
          curso: data.data.curso,
          facturacion: data.data.facturacion,
          comprobante: data.data.comprobante
        },
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Error getting inscription by ID:', error);
      throw error;
    }
  }

  // Formatear fecha para mostrar
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Obtener badge de estado
  getStatusBadge(estado: string): { color: string; text: string; bgColor: string } {
    switch (estado) {
      case 'PENDIENTE':
        return { color: 'text-yellow-800', text: 'Pendiente', bgColor: 'bg-yellow-100' };
      case 'VALIDADO':
        return { color: 'text-green-800', text: 'Validado', bgColor: 'bg-green-100' };
      case 'RECHAZADO':
        return { color: 'text-red-800', text: 'Rechazado', bgColor: 'bg-red-100' };
      default:
        return { color: 'text-gray-800', text: estado, bgColor: 'bg-gray-100' };
    }
  }
}

export const inscriptionService = new InscriptionService();
