import { 
  GenerarInformeData, 
  InformeCompleto, 
  EstadisticasInforme,
  CursoDisponible,
  ConfiguracionInformes,
  FiltrosInforme,
  InformeApiResponse,
  FormatoExportacion
} from '@/models/informe/informe';
import { api } from '@/services/api';

class InformeService {
  private async makeRequest<T>(endpoint: string): Promise<InformeApiResponse<T>> {
    try {
      console.log(`🌐 Making request to: ${endpoint}`);
      const response = await api.get(endpoint);
      console.log(`✅ Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error(`❌ Request failed for ${endpoint}:`, {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        error: axiosError.message
      });
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Error de conexión con el servidor';
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener datos completos del informe sin generar archivo
   */
  async obtenerDatosInforme(filtros: FiltrosInforme = {}): Promise<InformeCompleto> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filtros).forEach(([key, value]) => {
      // 🆕 CORREGIR: Permitir valores booleanos false
      if (value !== undefined && value !== null && (value !== '' || typeof value === 'boolean')) {
        queryParams.append(key, value.toString());
      }
    });

    console.log('🔍 obtenerDatosInforme - Query params construidos:', {
      filtros,
      queryString: queryParams.toString(),
      entries: Array.from(queryParams.entries())
    });

    const response = await this.makeRequest<InformeCompleto>(
      `/informes/datos?${queryParams.toString()}`
    );

    return response.data;
  }

  /**
   * Obtener solo estadísticas del informe
   */
  async obtenerEstadisticas(filtros: FiltrosInforme = {}): Promise<{
    estadisticas: EstadisticasInforme;
    filtrosAplicados: FiltrosInforme;
    fechaGeneracion: Date;
    totalRegistros: number;
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filtros).forEach(([key, value]) => {
      // 🆕 CORREGIR: Permitir valores booleanos false
      if (value !== undefined && value !== null && (value !== '' || typeof value === 'boolean')) {
        queryParams.append(key, value.toString());
      }
    });

    console.log('🔍 obtenerEstadisticas - Query params construidos:', {
      filtros,
      queryString: queryParams.toString(),
      entries: Array.from(queryParams.entries())
    });

    const response = await this.makeRequest<{
      estadisticas: EstadisticasInforme;
      filtrosAplicados: FiltrosInforme;
      fechaGeneracion: Date;
      totalRegistros: number;
    }>(`/informes/estadisticas?${queryParams.toString()}`);

    return response.data;
  }

  /**
   * Generar y descargar informe
   */
  async generarInforme(data: GenerarInformeData): Promise<void> {
    try {
      console.log('🎯 generarInforme - Datos enviados al backend:', {
        data,
        tipoInforme: data.tipoInforme,
        verificacionPago: data.verificacionPago,
        matricula: data.matricula,
        formato: data.formato
      });
      
      const response = await api.post('/informes/generar', data, {
        responseType: 'blob'
      });
      
      console.log('📊 generarInforme - Respuesta del backend:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data?.size || response.data?.length,
        contentType: response.headers['content-type']
      });

      // Obtener información del archivo desde headers
      const archivoInfo = response.headers['x-archivo-info'];
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let nombreArchivo = 'informe';
      
      console.log('📄 Información de descarga:', {
        archivoInfo,
        contentType,
        responseType: typeof response.data,
        dataLength: response.data?.size || response.data?.length,
        isBlob: response.data instanceof Blob,
        constructor: response.data?.constructor?.name
      });
      
      if (archivoInfo) {
        try {
          const info = JSON.parse(archivoInfo);
          nombreArchivo = info.nombre || nombreArchivo;
        } catch (error) {
          console.warn('Error al parsear información del archivo:', error);
        }
      }

      // Determinar el tipo MIME correcto
      let mimeType = contentType;
      if (data.formato === FormatoExportacion.PDF) {
        mimeType = 'application/pdf';
      } else if (data.formato === FormatoExportacion.EXCEL) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // Descargar archivo con el tipo MIME correcto
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Archivo descargado:', { nombreArchivo, mimeType, size: blob.size });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Error al generar el informe';
      throw new Error(errorMessage);
    }
  }

  /**
   * Generar informe Excel específicamente
   */
  async generarExcel(data: Omit<GenerarInformeData, 'formato'>): Promise<void> {
    return this.generarInforme({ ...data, formato: FormatoExportacion.EXCEL });
  }

  /**
   * Generar informe PDF específicamente
   */
  async generarPDF(data: Omit<GenerarInformeData, 'formato'>): Promise<void> {
    return this.generarInforme({ ...data, formato: FormatoExportacion.PDF });
  }

  /**
   * Obtener lista de cursos disponibles para filtros
   */
  async obtenerCursosDisponibles(): Promise<CursoDisponible[]> {
    const response = await this.makeRequest<CursoDisponible[]>('/informes/cursos');
    return response.data;
  }

  /**
   * Obtener tipos de informe y formatos disponibles
   */
  async obtenerConfiguracionInformes(): Promise<ConfiguracionInformes> {
    const response = await this.makeRequest<ConfiguracionInformes>('/informes/tipos');
    return response.data;
  }
}

export const informeService = new InformeService();
export default informeService;