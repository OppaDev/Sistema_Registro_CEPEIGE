// services/billingService.ts
import { BillingData } from '@/models/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface BillingRegistrationData {
  razonSocial: string;
  identificacionTributaria: string;
  telefono: string;
  correoFactura: string;
  direccion: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

class BillingService {
  async create(billingData: BillingData): Promise<ApiResponse> {
    try {
      console.log('🚀 Registrando datos de facturación:', billingData);
      
      const registrationData: BillingRegistrationData = {
        razonSocial: billingData.razonSocial,
        identificacionTributaria: billingData.identificacionTributaria,
        telefono: billingData.telefono,
        correoFactura: billingData.correoFactura,
        direccion: billingData.direccion
      };

      const response = await fetch(`${API_BASE_URL}/datos-facturacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro de facturación');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error in billing registration:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/datos-facturacion/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos de facturación');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error getting billing data by ID:', error);
      throw error;
    }
  }

  async update(id: number, billingData: Partial<BillingData>): Promise<ApiResponse> {
    try {
      const updateData: Partial<BillingRegistrationData> = {};
      
      if (billingData.razonSocial) updateData.razonSocial = billingData.razonSocial;
      if (billingData.identificacionTributaria) updateData.identificacionTributaria = billingData.identificacionTributaria;
      if (billingData.telefono) updateData.telefono = billingData.telefono;
      if (billingData.correoFactura) updateData.correoFactura = billingData.correoFactura;
      if (billingData.direccion) updateData.direccion = billingData.direccion;

      const response = await fetch(`${API_BASE_URL}/datos-facturacion/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar datos de facturación');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error updating billing data:', error);
      throw error;
    }
  }
}

export const billingService = new BillingService();
