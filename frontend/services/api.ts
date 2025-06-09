// frontend/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para requests
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para responses
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url);
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url);
  }
}

export const api = new ApiClient();
