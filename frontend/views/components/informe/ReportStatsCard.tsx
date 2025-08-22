'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  EstadisticasInforme, 
  FiltrosInforme 
} from '@/models/informe/informe';
import informeService from '@/services/informeService';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Clock, 
  DollarSign, 
  BookOpen,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface ReportStatsCardProps {
  filtros?: FiltrosInforme;
  refreshTrigger?: number;
}

export default function ReportStatsCard({ filtros = {}, refreshTrigger = 0 }: ReportStatsCardProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasInforme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaGeneracion, setFechaGeneracion] = useState<Date | null>(null);

  const loadEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await informeService.obtenerEstadisticas(filtros);
      setEstadisticas(response.estadisticas);
      setFechaGeneracion(new Date(response.fechaGeneracion));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadEstadisticas();
  }, [filtros, refreshTrigger, loadEstadisticas]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!estadisticas) {
    return null;
  }

  const calcularPorcentaje = (valor: number, total: number): number => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-blue-200 p-3 rounded-lg">
          <BarChart3 className="h-5 w-5" />
          Estadísticas del Sistema
        </CardTitle>
        {fechaGeneracion && (
          <p className="text-sm text-gray-500">
            Actualizado: {fechaGeneracion.toLocaleString('es-ES')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.totalInscripciones}
            </div>
            <div className="text-sm text-gray-600">Total Inscripciones</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.matriculados}
            </div>
            <div className="text-sm text-gray-600">Matriculados</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {calcularPorcentaje(estadisticas.matriculados, estadisticas.totalInscripciones)}%
            </Badge>
          </div>

          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600">
              {estadisticas.pagosVerificados}
            </div>
            <div className="text-sm text-gray-600">Pagos Verificados</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {calcularPorcentaje(estadisticas.pagosVerificados, estadisticas.totalInscripciones)}%
            </Badge>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {estadisticas.pagosPendientes}
            </div>
            <div className="text-sm text-gray-600">Pagos Pendientes</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {calcularPorcentaje(estadisticas.pagosPendientes, estadisticas.totalInscripciones)}%
            </Badge>
          </div>
        </div>

        {/* Información Financiera */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Monto Total Recaudado</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatearMoneda(estadisticas.montoTotalComprobantes)}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Total de Cursos</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.cursosUnicos}
            </div>
          </div>
        </div>

        {/* Distribución por Curso */}
        {estadisticas.inscripcionesPorCurso && Object.keys(estadisticas.inscripcionesPorCurso).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribución por Curso
            </h4>
            <div className="space-y-2">
              {Object.entries(estadisticas.inscripcionesPorCurso)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([nombreCurso, cantidad], index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium truncate flex-1 mr-2">
                    {nombreCurso}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {cantidad} estudiantes
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {calcularPorcentaje(cantidad, estadisticas.totalInscripciones)}%
                    </Badge>
                  </div>
                </div>
              ))}
              {Object.keys(estadisticas.inscripcionesPorCurso).length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  +{Object.keys(estadisticas.inscripcionesPorCurso).length - 5} cursos más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Distribución por Tipo de Comprobante */}
        {estadisticas.tiposComprobante && Object.keys(estadisticas.tiposComprobante).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribución por Tipo de Comprobante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(estadisticas.tiposComprobante)
                .sort(([,a], [,b]) => b - a)
                .map(([tipo, cantidad], index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">
                    {tipo}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {cantidad}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {calcularPorcentaje(cantidad, estadisticas.totalInscripciones)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}