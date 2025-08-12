// services/validarPago/facturaService.ts
import { 
  Factura, 
  CreateFacturaRequest, 
  UpdateFacturaRequest,
  FacturaResponse,
  FacturaListResponse,
  validateFacturaData 
} from '@/models/validarPago/factura';
import { authService } from '@/services/login/authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class FacturaService {
  // Crear nueva factura
  async createFactura(data: CreateFacturaRequest): Promise<FacturaResponse> {
    try {
      // Validar datos antes de enviar
      const errors = validateFacturaData(data);
      if (errors.length > 0) {
        throw new Error(`Datos inválidos: ${errors.join(', ')}`);
      }

      console.log('🧾 Creando factura:', data);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('📥 Respuesta crear factura:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear factura');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error creating factura:', error);
      throw new Error(error.message || 'Error al crear factura');
    }
  }

  // Obtener factura por ID
  async getFacturaById(id: number): Promise<FacturaResponse> {
    try {
      console.log('🔍 Obteniendo factura por ID:', id);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta factura por ID:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener factura');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching factura by ID:', error);
      throw new Error(error.message || 'Error al obtener factura');
    }
  }

  // Obtener facturas por inscripción
  async getFacturasByInscripcionId(inscripcionId: number): Promise<FacturaListResponse> {
    try {
      console.log('🔍 Obteniendo facturas por inscripción:', inscripcionId);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/inscripcion/${inscripcionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta facturas por inscripción:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener facturas');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching facturas by inscription:', error);
      throw new Error(error.message || 'Error al obtener facturas de la inscripción');
    }
  }

  // Actualizar factura
  async updateFactura(id: number, data: UpdateFacturaRequest): Promise<FacturaResponse> {
    try {
      console.log('📝 Actualizando factura:', { id, data });
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('📥 Respuesta actualizar factura:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar factura');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error updating factura:', error);
      throw new Error(error.message || 'Error al actualizar factura');
    }
  }

  // Verificar pago de factura
  async verificarPago(id: number): Promise<FacturaResponse> {
    try {
      console.log('✅ Verificando pago de factura:', id);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/${id}/verificar-pago`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta verificar pago:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al verificar pago');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error verifying payment:', error);
      throw new Error(error.message || 'Error al verificar pago');
    }
  }

  // Buscar factura por número de factura
  async getFacturaByNumeroFactura(numeroFactura: string): Promise<FacturaResponse> {
    try {
      console.log('🔍 Buscando por número de factura:', numeroFactura);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/numero-factura/${numeroFactura}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta por número de factura:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al buscar factura');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error searching by numero factura:', error);
      throw new Error(error.message || 'Error al buscar factura por número');
    }
  }

  // Buscar factura por número de ingreso
  async getFacturaByNumeroIngreso(numeroIngreso: string): Promise<FacturaResponse> {
    try {
      console.log('🔍 Buscando por número de ingreso:', numeroIngreso);
      
      const authHeaders = authService.getAuthHeader();
      
      const response = await fetch(`${API_BASE_URL}/facturas/numero-ingreso/${numeroIngreso}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const result = await response.json();
      console.log('📥 Respuesta por número de ingreso:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al buscar factura');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error searching by numero ingreso:', error);
      throw new Error(error.message || 'Error al buscar factura por número de ingreso');
    }
  }

  // Generar números temporales únicos
  generateTemporaryNumbers(inscripcionId: number): { numeroIngreso: string; numeroFactura: string } {
    const timestamp = Date.now();
    return {
      numeroIngreso: `TMP-ING-${inscripcionId}-${timestamp}`,
      numeroFactura: `TMP-FAC-${inscripcionId}-${timestamp}`
    };
  }

  // Validar si números son temporales
  isTemporaryNumber(numero: string): boolean {
    return numero.startsWith('TMP-');
  }

  // Helper para formatear valor
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Helper para formatear fecha
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

export const facturaService = new FacturaService();