// services/validarPago/facturaService.ts
import { apiClient } from '@/services/api';
import { CreateFacturaData, UpdateFacturaData, FacturaData, FacturaResponse } from '@/models/validarPago/factura';

class FacturaService {
  private baseUrl = '/facturas';

  // Crear una nueva factura
  async createFactura(data: CreateFacturaData): Promise<FacturaData> {
    try {
      const response = await apiClient.post<FacturaResponse>(this.baseUrl, data);
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error creating factura:', error);
      throw error;
    }
  }

  // Obtener todas las facturas
  async getAllFacturas(params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
    includeRelations?: boolean;
  }): Promise<{ facturas: FacturaData[]; total: number }> {
    try {
      const response = await apiClient.get<FacturaResponse>(this.baseUrl, { params });
      const data = response.data;
      return {
        facturas: Array.isArray(data.data) ? data.data : [data.data],
        total: data.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching facturas:', error);
      throw error;
    }
  }

  // Obtener factura por ID
  async getFacturaById(id: number, includeRelations: boolean = true): Promise<FacturaData> {
    try {
      const response = await apiClient.get<FacturaResponse>(
        `${this.baseUrl}/${id}`,
        { params: { includeRelations } }
      );
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error fetching factura by ID:', error);
      throw error;
    }
  }

  // Obtener factura por número de factura
  async getFacturaByNumeroFactura(numeroFactura: string): Promise<FacturaData> {
    try {
      const response = await apiClient.get<FacturaResponse>(
        `${this.baseUrl}/numero-factura/${numeroFactura}`
      );
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error fetching factura by numero:', error);
      throw error;
    }
  }

  // Obtener factura por número de ingreso
  async getFacturaByNumeroIngreso(numeroIngreso: string): Promise<FacturaData> {
    try {
      const response = await apiClient.get<FacturaResponse>(
        `${this.baseUrl}/numero-ingreso/${numeroIngreso}`
      );
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error fetching factura by numero ingreso:', error);
      throw error;
    }
  }

  // Obtener facturas por ID de inscripción
  async getFacturasByInscripcionId(idInscripcion: number): Promise<FacturaData[]> {
    try {
      const response = await apiClient.get<FacturaResponse>(
        `${this.baseUrl}/inscripcion/${idInscripcion}`
      );
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error('Error fetching facturas by inscripcion:', error);
      throw error;
    }
  }

  // Verificar pago de una factura
  async verificarPago(id: number): Promise<FacturaData> {
    try {
      const response = await apiClient.patch<FacturaResponse>(
        `${this.baseUrl}/${id}/verificar-pago`
      );
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Actualizar factura
  async updateFactura(id: number, data: UpdateFacturaData): Promise<FacturaData> {
    try {
      const response = await apiClient.put<FacturaResponse>(`${this.baseUrl}/${id}`, data);
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error updating factura:', error);
      throw error;
    }
  }

  // Eliminar factura
  async deleteFactura(id: number): Promise<FacturaData> {
    try {
      const response = await apiClient.delete<FacturaResponse>(`${this.baseUrl}/${id}`);
      return response.data.data as FacturaData;
    } catch (error) {
      console.error('Error deleting factura:', error);
      throw error;
    }
  }
}

export const facturaService = new FacturaService();