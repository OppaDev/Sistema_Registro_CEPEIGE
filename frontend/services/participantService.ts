// services/participantService.ts
import axios from 'axios';
import { Participant } from '@/models/participant';

class ParticipantService {
  private baseURL = 'http://localhost:4000/api';

  async register(data: Participant) {
    const response = await axios.post(`${this.baseURL}/form-data`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
}

export const participantService = new ParticipantService();
