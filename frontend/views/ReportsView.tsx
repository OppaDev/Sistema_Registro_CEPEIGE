'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReportGeneratorModal from '@/views/components/informe/ReportGeneratorModal';
import ReportStatsCard from '@/views/components/informe/ReportStatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TipoInforme, 
  FormatoExportacion,
  FiltrosInforme,
  CursoDisponible,
  InformeCompleto
} from '@/models/informe/informe';
import informeService from '@/services/informeService';
import { 
  FileText, 
  Download, 
  Filter, 
  RefreshCw, 
  Calendar,
  Search,
  Eye,
  BarChart3,
  Users,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';

export default function ReportsView() {
  console.log('📊 ReportsView: Componente montado');
  
  const { user } = useAuth();
  console.log('📊 ReportsView: Usuario recibido:', user);
  
  // Mejorar la detección del rol del usuario
  const userRole = user?.roles?.[0] || 'usuario';
  const canViewReports = ['admin', 'contador', 'administrador'].includes(userRole.toLowerCase());
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [cursosDisponibles, setCursosDisponibles] = useState<CursoDisponible[]>([]);
  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosInforme>({});
  const [datosInforme, setDatosInforme] = useState<InformeCompleto | null>(null);
  const [loading, setLoading] = useState(true); // Cambiar a true inicialmente
  const [error, setError] = useState<string | null>(null);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const loadInitialData = useCallback(async () => {
    try {
      console.log('🚀 Iniciando carga de datos iniciales...');
      console.log('👤 Usuario actual:', user);
      console.log('🔑 Rol detectado:', userRole);
      
      setLoading(true);
      setError(null);
      
      // Test simple de conectividad primero
      console.log('🧪 Probando conectividad básica...');
      
      const cursos = await informeService.obtenerCursosDisponibles();
      console.log('✅ Cursos cargados:', cursos);
      setCursosDisponibles(cursos);
      
    } catch (err) {
      console.error('❌ Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos iniciales');
    } finally {
      console.log('🔚 Terminando carga de datos iniciales');
      setLoading(false);
    }
  }, [user, userRole]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFilterChange = (field: keyof FiltrosInforme, value: string | number | boolean | undefined) => {
    setFiltrosActivos(prev => ({
      ...prev,
      [field]: value === '' || value === 'all' ? undefined : value
    }));
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const datos = await informeService.obtenerDatosInforme(filtrosActivos);
      setDatosInforme(datos);
      setStatsRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos del informe');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltrosActivos({});
    setDatosInforme(null);
    setError(null);
  };

  const generarInformeRapido = async (tipo: TipoInforme, formato: FormatoExportacion) => {
    try {
      setLoading(true);
      
      const filtrosEspecificos = { ...filtrosActivos };
      
      if (tipo === TipoInforme.PENDIENTES) {
        filtrosEspecificos.verificacionPago = false;
      } else if (tipo === TipoInforme.PAGADOS) {
        filtrosEspecificos.verificacionPago = true;
      } else if (tipo === TipoInforme.MATRICULADOS) {
        filtrosEspecificos.matricula = true;
      }
      
      await informeService.generarInforme({
        tipoInforme: tipo,
        formato: formato,
        ...filtrosEspecificos
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  // Debug: agregar console.log para verificar
  console.log('🔍 Debug ReportsView:', {
    user,
    userRole,
    userRoleLower: userRole.toLowerCase(),
    canViewReports,
    roles: user?.roles,
    isAuthenticated: user !== null
  });

  if (!canViewReports) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            No tienes permisos para acceder a los informes del sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar loading mientras se cargan datos iniciales
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-medium">Cargando informes...</h3>
                <p className="text-gray-500">Obteniendo datos del sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-x-2">
          <Button onClick={loadInitialData} variant="outline">
            Reintentar
          </Button>
          <Button 
            onClick={async () => {
              try {
                console.log('🔧 Test directo de API...');
                const response = await fetch('/api/v1/informes/cursos', {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                console.log('📊 Response status:', response.status);
                console.log('📊 Response headers:', response.headers);
                const data = await response.text();
                console.log('📊 Response data:', data);
              } catch (err) {
                console.error('💥 Direct test failed:', err);
              }
            }}
            variant="secondary"
          >
            Test API Directo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Centro de Informes
          </h1>
          <p className="text-gray-600 mt-1">
            Genere y analice informes de inscripciones, pagos y matrículas
          </p>
        </div>
        <Button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generar Informe Personalizado
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <ReportStatsCard 
        filtros={filtrosActivos} 
        refreshTrigger={statsRefreshTrigger} 
      />

      {/* Panel de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fechaInicio"
                  type="date"
                  value={filtrosActivos.fechaInicio || ''}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
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
                  value={filtrosActivos.fechaFin || ''}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Curso */}
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select
                value={filtrosActivos.idCurso?.toString() || ''}
                onValueChange={(value) => handleFilterChange('idCurso', value ? parseInt(value) : undefined)}
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={aplicarFiltros}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Aplicar Filtros
            </Button>

            <Button
              variant="outline"
              onClick={limpiarFiltros}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Filtros Activos */}
          {(filtrosActivos.fechaInicio || filtrosActivos.fechaFin || filtrosActivos.idCurso) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500">Filtros activos:</span>
              {filtrosActivos.fechaInicio && (
                <Badge variant="secondary">
                  Desde: {new Date(filtrosActivos.fechaInicio).toLocaleDateString('es-ES')}
                </Badge>
              )}
              {filtrosActivos.fechaFin && (
                <Badge variant="secondary">
                  Hasta: {new Date(filtrosActivos.fechaFin).toLocaleDateString('es-ES')}
                </Badge>
              )}
              {filtrosActivos.idCurso && (
                <Badge variant="secondary">
                  Curso: {cursosDisponibles.find(c => c.idCurso === filtrosActivos.idCurso)?.nombreCurso}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Informes Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Todas las Inscripciones */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Todas las Inscripciones</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.INSCRIPCIONES, FormatoExportacion.PDF)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileImage className="h-3 w-3" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.INSCRIPCIONES, FormatoExportacion.EXCEL)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Estudiantes Matriculados */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Matriculados</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.MATRICULADOS, FormatoExportacion.PDF)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileImage className="h-3 w-3" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.MATRICULADOS, FormatoExportacion.EXCEL)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Pagos Verificados */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="font-medium">Pagos Verificados</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.PAGADOS, FormatoExportacion.PDF)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileImage className="h-3 w-3" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.PAGADOS, FormatoExportacion.EXCEL)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Pagos Pendientes */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Pagos Pendientes</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.PENDIENTES, FormatoExportacion.PDF)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileImage className="h-3 w-3" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generarInformeRapido(TipoInforme.PENDIENTES, FormatoExportacion.EXCEL)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado de Búsqueda */}
      {datosInforme && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Resultados de la Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {datosInforme.totalRegistros}
                  </div>
                  <div className="text-sm text-gray-600">Total Encontrados</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {datosInforme.estadisticas.matriculados}
                  </div>
                  <div className="text-sm text-gray-600">Matriculados</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded">
                  <div className="text-2xl font-bold text-emerald-600">
                    {datosInforme.estadisticas.pagosVerificados}
                  </div>
                  <div className="text-sm text-gray-600">Pagos Verificados</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {datosInforme.estadisticas.pagosPendientes}
                  </div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <strong>Fecha de generación:</strong> {new Date(datosInforme.fechaGeneracion).toLocaleString('es-ES')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensajes */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Modal de Generación de Informes */}
      <ReportGeneratorModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}