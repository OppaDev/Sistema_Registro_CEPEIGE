// services/validarPago/descuentoService.ts
import { apiClient } from '@/services/api';
import { CreateDescuentoData, UpdateDescuentoData, DescuentoData, DescuentoResponse } from '@/models/validarPago/descuento';

class DescuentoService {
  private baseUrl = '/descuentos';

  // Crear un nuevo descuento
  async createDescuento(data: CreateDescuentoData): Promise<DescuentoData> {
    try {
      const response = await apiClient.post<DescuentoResponse>(this.baseUrl, data);
      return response.data.data as DescuentoData;
    } catch (error) {
      console.error('Error creating descuento:', error);
      throw error;
    }
  }

  // Obtener todos los descuentos
  async getAllDescuentos(params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ descuentos: DescuentoData[]; total: number }> {
    try {
      const response = await apiClient.get<DescuentoResponse>(this.baseUrl, { params });
      const data = response.data;
      return {
        descuentos: Array.isArray(data.data) ? data.data : [data.data],
        total: data.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching descuentos:', error);
      throw error;
    }
  }

  // Obtener descuento por ID
  async getDescuentoById(id: number): Promise<DescuentoData> {
    try {
      const response = await apiClient.get<DescuentoResponse>(`${this.baseUrl}/${id}`);
      return response.data.data as DescuentoData;
    } catch (error) {
      console.error('Error fetching descuento by ID:', error);
      throw error;
    }
  }

  // Actualizar descuento
  async updateDescuento(id: number, data: UpdateDescuentoData): Promise<DescuentoData> {
    try {
      const response = await apiClient.put<DescuentoResponse>(`${this.baseUrl}/${id}`, data);
      return response.data.data as DescuentoData;
    } catch (error) {
      console.error('Error updating descuento:', error);
      throw error;
    }
  }

  // Eliminar descuento
  async deleteDescuento(id: number): Promise<DescuentoData> {
    try {
      const response = await apiClient.delete<DescuentoResponse>(`${this.baseUrl}/${id}`);
      return response.data.data as DescuentoData;
    } catch (error) {
      console.error('Error deleting descuento:', error);
      throw error;
    }
  }
}

export const descuentoService = new DescuentoService();