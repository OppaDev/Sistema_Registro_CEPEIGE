// services/billingService.ts
import { BillingData } from '@/models/inscripcion/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface BillingRegistrationData {
  razonSocial: string;
  identificacionTributaria: string;
  telefono: string;
  correoFactura: string;
  direccion: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
}

class BillingService {
  async create(billingData: BillingData): Promise<ApiResponse> {
    try {
      console.log('🚀 Registrando datos de facturación:', billingData);
      
      // Intentar crear directamente primero
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
        // Si falla por datos duplicados, intentar buscar los datos existentes
        if (data.message && (
          data.message.includes('ya está registrado') || 
          data.message.includes('already exists') ||
          data.message.includes('correo de facturación ya está registrado') ||
          data.message.includes('identificación tributaria ya está registrada')
        )) {
          console.log('🔄 Datos de facturación ya existen, buscando datos existentes...');
          
          try {
            console.log('🔍 Buscando datos de facturación en todas las inscripciones...');
            
            // Usar el endpoint de inscripciones para encontrar datos de facturación existentes
            const inscriptionsResponse = await fetch(
              `${API_BASE_URL}/inscripciones?page=1&limit=500`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }
            );
            
            if (inscriptionsResponse.ok) {
              const inscriptionsData = await inscriptionsResponse.json();
              
              if (inscriptionsData.success && inscriptionsData.data && inscriptionsData.data.length > 0) {
                // Buscar una inscripción que tenga los mismos datos de facturación
                const matchingInscription = inscriptionsData.data.find((inscription: { datosFacturacion?: { identificacionTributaria?: string; correoFactura?: string; idFacturacion?: number; razonSocial?: string; telefono?: string; direccion?: string } }) => 
                  inscription.datosFacturacion && (
                    inscription.datosFacturacion.identificacionTributaria === billingData.identificacionTributaria ||
                    inscription.datosFacturacion.correoFactura === billingData.correoFactura
                  )
                );
                
                if (matchingInscription && matchingInscription.datosFacturacion) {
                  console.log('✅ Datos de facturación encontrados en inscripciones existentes');
                  console.log('📄 Datos encontrados:', matchingInscription.datosFacturacion);
                  
                  // Verificar si los datos son exactamente iguales o necesitan actualización
                  const existingData = matchingInscription.datosFacturacion;
                  const needsUpdate = (
                    existingData.razonSocial !== billingData.razonSocial ||
                    existingData.telefono !== billingData.telefono ||
                    existingData.direccion !== billingData.direccion
                  );
                  
                  if (needsUpdate) {
                    console.log('🔄 Los datos de facturación requieren actualización...');
                    try {
                      // Intentar actualizar los datos existentes
                      const updateResponse = await this.update(existingData.idFacturacion, {
                        razonSocial: billingData.razonSocial,
                        telefono: billingData.telefono,
                        direccion: billingData.direccion
                      });
                      
                      if (updateResponse.success) {
                        console.log('✅ Datos de facturación actualizados exitosamente');
                        return {
                          success: true,
                          data: {
                            ...existingData,
                            razonSocial: billingData.razonSocial,
                            telefono: billingData.telefono,
                            direccion: billingData.direccion
                          },
                          message: 'Datos de facturación encontrados y actualizados'
                        };
                      }
                    } catch (updateError: unknown) {
                      const errorObj = updateError as { message?: string };
                      console.warn('⚠️ No se pudieron actualizar los datos, usando existentes:', errorObj.message);
                    }
                  }
                  
                  // Retornar los datos existentes
                  return {
                    success: true,
                    data: existingData,
                    message: 'Datos de facturación encontrados y reutilizados'
                  };
                }
              }
            }
            
            console.log('⚠️ No se encontraron datos de facturación coincidentes');
            
          } catch (searchError) {
            console.warn('⚠️ Error buscando datos existentes:', searchError);
          }
        }
        
        throw new Error(data.message || 'Error en el registro de facturación');
      }

      return data;
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('❌ Error updating billing data:', error);
      throw error;
    }
  }
}

export const billingService = new BillingService();
