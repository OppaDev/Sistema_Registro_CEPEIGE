'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TipoInforme, 
  FormatoExportacion, 
  GenerarInformeData,
  CursoDisponible,
  ConfiguracionInformes
} from '@/models/informe/informe';
import informeService from '@/services/informeService';
import { Download, FileText, Calendar, Filter, X } from 'lucide-react';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'contador'; // Hacer opcional ya que no se usa
}

export default function ReportGeneratorModal({ isOpen, onClose }: ReportGeneratorModalProps) {
  const [formData, setFormData] = useState<GenerarInformeData>({
    tipoInforme: TipoInforme.INSCRIPCIONES,
    formato: FormatoExportacion.PDF,
  });
  
  const [cursosDisponibles, setCursosDisponibles] = useState<CursoDisponible[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionInformes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cursos, config] = await Promise.all([
        informeService.obtenerCursosDisponibles(),
        informeService.obtenerConfiguracionInformes()
      ]);
      
      setCursosDisponibles(cursos);
      setConfiguracion(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GenerarInformeData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' || value === 'all' ? undefined : value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validar datos requeridos
      if (!formData.tipoInforme || !formData.formato) {
        throw new Error('Tipo de informe y formato son requeridos');
      }

      // Validar fechas si se proporcionan
      if (formData.fechaInicio && formData.fechaFin) {
        const fechaInicio = new Date(formData.fechaInicio);
        const fechaFin = new Date(formData.fechaFin);
        
        if (fechaInicio > fechaFin) {
          throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
        }
      }

      await informeService.generarInforme(formData);
      
      setSuccess(`Informe ${formData.formato.toUpperCase()} generado y descargado exitosamente`);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipoInforme: TipoInforme.INSCRIPCIONES,
      formato: FormatoExportacion.PDF,
    });
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador de Informes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Tipo de Informe */}
          <div className="space-y-2">
            <Label htmlFor="tipoInforme">Tipo de Informe *</Label>
            <Select
              value={formData.tipoInforme}
              onValueChange={(value) => handleInputChange('tipoInforme', value as TipoInforme)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de informe" />
              </SelectTrigger>
              <SelectContent>
                {configuracion?.tiposInforme.map((tipo) => (
                  <SelectItem key={tipo.valor} value={tipo.valor}>
                    <div>
                      <div className="font-medium">{tipo.etiqueta}</div>
                      <div className="text-sm text-gray-500">{tipo.descripcion}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formato de Exportación */}
          <div className="space-y-2">
            <Label htmlFor="formato">Formato de Exportación *</Label>
            <Select
              value={formData.formato}
              onValueChange={(value) => handleInputChange('formato', value as FormatoExportacion)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el formato" />
              </SelectTrigger>
              <SelectContent>
                {configuracion?.formatosExportacion.map((formato) => (
                  <SelectItem key={formato.valor} value={formato.valor}>
                    {formato.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <Label className="text-sm font-medium">Filtros Opcionales</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha Inicio */}
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio || ''}
                    onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin || ''}
                    onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Curso */}
              <div className="space-y-2">
                <Label htmlFor="curso">Curso Específico</Label>
                <Select
                  value={formData.idCurso?.toString() || ''}
                  onValueChange={(value) => handleInputChange('idCurso', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los cursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los cursos</SelectItem>
                    {cursosDisponibles.map((curso) => (
                      <SelectItem key={curso.idCurso} value={curso.idCurso.toString()}>
                        {curso.nombreCurso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado de Matrícula */}
              <div className="space-y-2">
                <Label htmlFor="matricula">Estado de Matrícula</Label>
                <Select
                  value={formData.matricula === undefined ? '' : formData.matricula.toString()}
                  onValueChange={(value) => 
                    handleInputChange('matricula', value === '' ? undefined : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="true">Solo matriculados</SelectItem>
                    <SelectItem value="false">Solo no matriculados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verificación de Pago */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="verificacionPago">Estado de Verificación de Pago</Label>
                <Select
                  value={formData.verificacionPago === undefined ? '' : formData.verificacionPago.toString()}
                  onValueChange={(value) => 
                    handleInputChange('verificacionPago', value === '' ? undefined : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="true">Solo pagos verificados</SelectItem>
                    <SelectItem value="false">Solo pagos pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Limpiar Filtros
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={loading || !formData.tipoInforme || !formData.formato}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generar Informe
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}