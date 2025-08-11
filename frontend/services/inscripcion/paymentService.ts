// services/paymentService.ts
import { PaymentReceipt } from '@/models/inscripcion/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface PaymentReceiptUploadData {
  file: File;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

class PaymentService {
  async uploadReceipt(file: File): Promise<ApiResponse<PaymentReceipt>> {
    try {
      console.log('🚀 Subiendo comprobante de pago:', file.name);
      
      const formData = new FormData();
      formData.append('comprobanteFile', file); // 'comprobanteFile' según el backend

      const response = await fetch(`${API_BASE_URL}/comprobantes`, {
        method: 'POST',
        body: formData // No establecer Content-Type, el navegador lo hará automáticamente
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir el comprobante');
      }

      return {
        success: data.success,
        data: {
          idComprobante: data.data.idComprobante,
          fechaSubida: new Date(data.data.fechaSubida),
          rutaComprobante: data.data.rutaComprobante,
          tipoArchivo: data.data.tipoArchivo,
          nombreArchivo: data.data.nombreArchivo
        },
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Error uploading payment receipt:', error);
      throw error;
    }
  }

  async getReceiptById(id: number): Promise<ApiResponse<PaymentReceipt>> {
    try {
      const response = await fetch(`${API_BASE_URL}/comprobantes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener comprobante');
      }

      return {
        success: data.success,
        data: {
          idComprobante: data.data.idComprobante,
          fechaSubida: new Date(data.data.fechaSubida),
          rutaComprobante: data.data.rutaComprobante,
          tipoArchivo: data.data.tipoArchivo,
          nombreArchivo: data.data.nombreArchivo
        },
        message: data.message
      };
    } catch (error: any) {
      console.error('❌ Error getting payment receipt by ID:', error);
      throw error;
    }
  }

  async deleteReceipt(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/comprobantes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar comprobante');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error deleting payment receipt:', error);
      throw error;
    }
  }

  // Validar archivo antes de subir
  validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos PNG, JPG, JPEG o PDF'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo no debe superar 5MB'
      };
    }

    return { isValid: true };
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtener icono según tipo de archivo
  getFileIcon(mimeType: string): string {
    switch (mimeType) {
      case 'application/pdf':
        return '📄';
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return '🖼️';
      default:
        return '📎';
    }
  }
}

export const paymentService = new PaymentService();
