// services/participantService.ts - VERSIÓN CORREGIDA
import { Participant } from '@/models/participant';

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
      console.log('🚀 Registrando participante:', participant);
      
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
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
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
}

export const participantService = new ParticipantService();
