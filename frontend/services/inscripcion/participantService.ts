// services/participantService.ts - VERSIÓN CORREGIDA
import { Participant } from '@/models/inscripcion/participant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ParticipantRegistrationData {
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
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

class ParticipantService {
  async register(participant: Participant): Promise<ApiResponse> {
    try {
      console.log('🚀 Iniciando registro/búsqueda de participante:', participant.ciPasaporte);
      
      // 1. PRIMERO: Verificar si ya existe el participante por CI/Pasaporte
      const existingParticipant = await this.checkExistingParticipant(participant.ciPasaporte);
      
      if (existingParticipant.success && existingParticipant.data) {
        console.log('✅ Participante ya existe:', existingParticipant.data);
        
        // Verificar si el correo es diferente y necesita actualización
        if (existingParticipant.data.correo !== participant.correo) {
          console.log('📧 Correo diferente detectado, actualizando datos del participante...');
          
          try {
            // Actualizar los datos del participante existente
            const updateResponse = await this.updateParticipant(existingParticipant.data.idPersona, {
              correo: participant.correo,
              // También actualizar otros campos si han cambiado
              nombres: participant.nombres,
              apellidos: participant.apellidos,
              numTelefono: participant.numTelefono,
              pais: participant.pais,
              provinciaEstado: participant.provinciaEstado,
              ciudad: participant.ciudad,
              profesion: participant.profesion,
              institucion: participant.institucion
            });

            if (updateResponse.success) {
              console.log('✅ Datos del participante actualizados exitosamente');
              return {
                success: true,
                data: {
                  ...existingParticipant.data,
                  correo: participant.correo,
                  nombres: participant.nombres,
                  apellidos: participant.apellidos,
                  numTelefono: participant.numTelefono,
                  pais: participant.pais,
                  provinciaEstado: participant.provinciaEstado,
                  ciudad: participant.ciudad,
                  profesion: participant.profesion,
                  institucion: participant.institucion
                },
                message: 'Datos del participante actualizados exitosamente'
              };
            } else {
              throw new Error(updateResponse.message || 'Error al actualizar los datos');
            }
          } catch (updateError: any) {
            console.warn('⚠️ No se pudieron actualizar los datos, usando datos existentes:', updateError.message);
            
            // Si falla la actualización, usar datos existentes con advertencia
            return {
              success: true,
              data: existingParticipant.data,
              message: `Participante encontrado. Nota: Se detectaron cambios en los datos, pero se usarán los datos registrados previamente (${existingParticipant.data.correo}).`
            };
          }
        }
        
        // Si el correo es el mismo, retornar los datos existentes
        return {
          ...existingParticipant,
          message: 'Participante encontrado con datos consistentes'
        };
      }
      
      console.log('📝 Participante no existe, creando nuevo registro...');
      
      // 2. SEGUNDO: Si no existe, crear nuevo participante
      const registrationData: ParticipantRegistrationData = {
        ciPasaporte: participant.ciPasaporte,
        nombres: participant.nombres,
        apellidos: participant.apellidos,
        numTelefono: participant.numTelefono,
        correo: participant.correo,
        pais: participant.pais,
        provinciaEstado: participant.provinciaEstado,
        ciudad: participant.ciudad,
        profesion: participant.profesion,
        institucion: participant.institucion
      };

      const response = await fetch(`${API_BASE_URL}/datos-personales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor (nuevo):', data);

      if (!response.ok) {
        // Si aún falla, intentar buscar de nuevo (posible condición de carrera)
        if (data.message && data.message.includes('ya está registrado')) {
          console.log('🔄 Detectada condición de carrera, reintentando búsqueda...');
          const retrySearch = await this.checkExistingParticipant(participant.ciPasaporte);
          if (retrySearch.success && retrySearch.data) {
            return retrySearch;
          }
        }
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error in participant registration:', error);
      throw error;
    }
  }

  async checkExistingParticipant(ciPasaporte: string): Promise<ApiResponse> {
    try {
      console.log('🔍 Buscando participante:', ciPasaporte);
      
      const response = await fetch(
        `${API_BASE_URL}/datos-personales/search?ciPasaporte=${encodeURIComponent(ciPasaporte)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      console.log('📥 Resultado búsqueda:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Error checking existing participant:', error);
      throw error;
    }
  }

  async getParticipantById(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/datos-personales/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener participante');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error getting participant by ID:', error);
      throw error;
    }
  }

  async updateParticipant(id: number, participant: Partial<Participant>): Promise<ApiResponse> {
    try {
      const updateData: Partial<ParticipantRegistrationData> = {};
      
      if (participant.nombres) updateData.nombres = participant.nombres;
      if (participant.apellidos) updateData.apellidos = participant.apellidos;
      if (participant.numTelefono) updateData.numTelefono = participant.numTelefono;
      if (participant.correo) updateData.correo = participant.correo;
      if (participant.pais) updateData.pais = participant.pais;
      if (participant.provinciaEstado) updateData.provinciaEstado = participant.provinciaEstado;
      if (participant.ciudad) updateData.ciudad = participant.ciudad;
      if (participant.profesion) updateData.profesion = participant.profesion;
      if (participant.institucion) updateData.institucion = participant.institucion;

      const response = await fetch(`${API_BASE_URL}/datos-personales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar participante');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error updating participant:', error);
      throw error;
    }
  }

  /**
   * Obtener datos para autocompletado con consentimiento del usuario
   * Solo se activa si el usuario da consentimiento explícito
   */
  async getDataForAutocomplete(ciPasaporte: string, hasConsent: boolean = false): Promise<ApiResponse> {
    try {
      if (!hasConsent) {
        return {
          success: false,
          message: 'Se requiere consentimiento explícito del participante para autocompletar datos'
        };
      }

      console.log('🔍 Obteniendo datos para autocompletar (con consentimiento):', ciPasaporte);
      
      const existingParticipant = await this.checkExistingParticipant(ciPasaporte);
      
      if (existingParticipant.success && existingParticipant.data) {
        return {
          success: true,
          data: existingParticipant.data,
          message: 'Datos encontrados para autocompletar'
        };
      }

      return {
        success: false,
        message: 'No se encontraron datos previos para este CI/Pasaporte'
      };
    } catch (error: any) {
      console.error('❌ Error getting data for autocomplete:', error);
      return {
        success: false,
        message: 'Error al buscar datos para autocompletar'
      };
    }
  }
}

export const participantService = new ParticipantService();
