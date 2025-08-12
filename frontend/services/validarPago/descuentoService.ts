// services/validarPago/descuentoService.ts
import {
  Descuento,
  CreateDescuentoRequest,
  UpdateDescuentoRequest,
  DescuentoResponse,
  DescuentoListResponse,
  TipoDescuento,
  DescuentoInscripcion,
  validateDescuentoData,
  calcularDescuento,
  formatTipoDescuento
} from '@/models/validarPago/descuento';
import { authService } from '@/services/login/authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class DescuentoService {
  // Crear nuevo descuento
  async createDescuento(data: CreateDescuentoRequest): Promise<DescuentoResponse> {
    try {
      // Validar datos antes de enviar
      const errors = validateDescuentoData(data);
      if (errors.length > 0) {
        throw new Error(`Datos inválidos: ${errors.join(', ')}`);
      }

      console.log('🏷️ Creando descuento:', data);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/descuentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('📥 Respuesta crear descuento:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear descuento');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error creating descuento:', error);
      throw new Error(error.message || 'Error al crear descuento');
    }
  }

  // Obtener descuento por ID
  async getDescuentoById(id: number): Promise<DescuentoResponse> {
    try {
      console.log('🔍 Obteniendo descuento por ID:', id);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/descuentos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta descuento por ID:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener descuento');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching descuento by ID:', error);
      throw new Error(error.message || 'Error al obtener descuento');
    }
  }

  // Obtener todos los descuentos
  async getAllDescuentos(options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<DescuentoListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = 'fechaCreacion',
        order = 'desc'
      } = options;

      console.log('📋 Obteniendo todos los descuentos:', { page, limit, orderBy, order });
      
      const authHeaders = authService.getAuthHeader();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy,
        order
      });
      
      const response = await fetch(`${API_BASE_URL}/descuentos?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta todos los descuentos:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener descuentos');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching all descuentos:', error);
      throw new Error(error.message || 'Error al obtener descuentos');
    }
  }

  // Actualizar descuento
  async updateDescuento(id: number, data: UpdateDescuentoRequest): Promise<DescuentoResponse> {
    try {
      console.log('📝 Actualizando descuento:', { id, data });
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/descuentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('📥 Respuesta actualizar descuento:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar descuento');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error updating descuento:', error);
      throw new Error(error.message || 'Error al actualizar descuento');
    }
  }

  // Eliminar descuento
  async deleteDescuento(id: number): Promise<DescuentoResponse> {
    try {
      console.log('🗑️ Eliminando descuento:', id);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/descuentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta eliminar descuento:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar descuento');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error deleting descuento:', error);
      throw new Error(error.message || 'Error al eliminar descuento');
    }
  }

  // Crear descuento para inscripción grupal
  async createDescuentoGrupal(inscripcionInfo: DescuentoInscripcion): Promise<DescuentoResponse> {
    try {
      const descuentoData: CreateDescuentoRequest = {
        tipoDescuento: 'GRUPAL',
        valorDescuento: inscripcionInfo.cantidadDescuento,
        porcentajeDescuento: 0,
        descripcion: inscripcionInfo.descripcion || 
          `Descuento grupal para ${inscripcionInfo.numeroEstudiantes} estudiantes`
      };

      return await this.createDescuento(descuentoData);
    } catch (error: any) {
      console.error('❌ Error creating descuento grupal:', error);
      throw new Error(error.message || 'Error al crear descuento grupal');
    }
  }

  // Aplicar descuento a inscripción
  async aplicarDescuentoAInscripcion(inscripcionId: number, descuentoId: number): Promise<any> {
    try {
      console.log('🔗 Aplicando descuento a inscripción:', { inscripcionId, descuentoId });
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/inscripciones/${inscripcionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          idDescuento: descuentoId
        })
      });

      const result = await response.json();
      console.log('📥 Respuesta aplicar descuento:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al aplicar descuento');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error applying descuento:', error);
      throw new Error(error.message || 'Error al aplicar descuento a inscripción');
    }
  }

  // Calcular descuento para monto
  calcularDescuentoParaMonto(monto: number, descuento: Descuento): {
    montoDescuento: number;
    montoFinal: number;
    porcentajeAplicado: number;
  } {
    const montoDescuento = calcularDescuento(monto, descuento);
    const montoFinal = monto - montoDescuento;
    const porcentajeAplicado = monto > 0 ? (montoDescuento / monto) * 100 : 0;

    return {
      montoDescuento,
      montoFinal,
      porcentajeAplicado
    };
  }

  // Validar si descuento es aplicable
  isDescuentoAplicable(descuento: Descuento, montoBase: number): boolean {
    if (descuento.valorDescuento > 0) {
      return descuento.valorDescuento <= montoBase;
    }
    
    return descuento.porcentajeDescuento > 0 && descuento.porcentajeDescuento <= 100;
  }

  // Helper para formatear monto
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Helper para formatear tipo
  formatTipo = formatTipoDescuento;

  // Helper para formatear porcentaje
  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(1)}%`;
  }

  // Obtener tipos de descuento disponibles
  getTiposDescuento(): { value: TipoDescuento; label: string }[] {
    return [
      { value: 'INDIVIDUAL', label: 'Individual' },
      { value: 'GRUPAL', label: 'Grupal' },
      { value: 'INSTITUCIONAL', label: 'Institucional' },
      { value: 'PROMOCIONAL', label: 'Promocional' }
    ];
  }
}

export const descuentoService = new DescuentoService();