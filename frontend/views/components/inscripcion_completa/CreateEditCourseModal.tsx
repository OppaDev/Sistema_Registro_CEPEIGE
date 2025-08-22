// views/components/CreateEditCourseModal.tsx - NUEVO ARCHIVO

import React, { useState, useEffect } from 'react';
import { Course, CreateCourseData, UpdateCourseData, MODALIDADES_CURSO } from '@/models/inscripcion/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, BookOpen, Save, AlertTriangle } from 'lucide-react';

interface CreateEditCourseModalProps {
  isOpen: boolean;
  course: Course | null; // null = crear, Course = editar
  isSubmitting: boolean;
  onSubmit: (data: CreateCourseData | UpdateCourseData) => Promise<void>;
  onClose: () => void;
}

export const CreateEditCourseModal: React.FC<CreateEditCourseModalProps> = ({
  isOpen,
  course,
  isSubmitting,
  onSubmit,
  onClose
}) => {
  const isEditing = !!course;
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateCourseData>({
    nombreCortoCurso: '',
    nombreCurso: '',
    descripcionCurso: '',
    modalidadCurso: '',
    valorCurso: 1,
    enlacePago: '',
    fechaInicioCurso: '',
    fechaFinCurso: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función para validar URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Cargar datos del curso si estamos editando
  useEffect(() => {
    if (isEditing && course) {
      setFormData({
        nombreCortoCurso: course.nombreCortoCurso,
        nombreCurso: course.nombreCurso,
        descripcionCurso: course.descripcionCurso,
        modalidadCurso: course.modalidadCurso,
        valorCurso: course.valorCurso,
        enlacePago: course.enlacePago,
        fechaInicioCurso: formatDateToInputValue(course.fechaInicioCurso),
        fechaFinCurso: formatDateToInputValue(course.fechaFinCurso)
      });
    } else {
      // Reset para crear nuevo
      setFormData({
        nombreCortoCurso: '',
        nombreCurso: '',
        descripcionCurso: '',
        modalidadCurso: '',
        valorCurso: 1,
        enlacePago: '',
        fechaInicioCurso: '',
        fechaFinCurso: ''
      });
    }
    setErrors({});
  }, [isEditing, course, isOpen]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof CreateCourseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreCortoCurso.trim()) {
      newErrors.nombreCortoCurso = 'El nombre corto es requerido';
    } else if (formData.nombreCortoCurso.length > 100) {
      newErrors.nombreCortoCurso = 'El nombre corto no puede exceder 100 caracteres';
    }

    if (!formData.nombreCurso.trim()) {
      newErrors.nombreCurso = 'El nombre completo es requerido';
    } else if (formData.nombreCurso.length > 100) {
      newErrors.nombreCurso = 'El nombre completo no puede exceder 100 caracteres';
    }

    if (!formData.modalidadCurso) {
      newErrors.modalidadCurso = 'La modalidad es requerida';
    }

    if (!formData.valorCurso || formData.valorCurso < 1) {
      newErrors.valorCurso = 'El precio debe ser mayor o igual a 1';
    }

    if (!formData.enlacePago.trim()) {
      newErrors.enlacePago = 'El enlace de pago es requerido';
    } else if (!isValidUrl(formData.enlacePago)) {
      newErrors.enlacePago = 'El enlace de pago debe ser una URL válida';
    }

    if (!formData.fechaInicioCurso) {
      newErrors.fechaInicioCurso = 'La fecha de inicio es requerida';
    }

    if (!formData.fechaFinCurso) {
      newErrors.fechaFinCurso = 'La fecha de fin es requerida';
    }

    if (formData.fechaInicioCurso && formData.fechaFinCurso) {
      const startDate = new Date(formData.fechaInicioCurso);
      const endDate = new Date(formData.fechaFinCurso);
      
      if (startDate >= endDate) {
        newErrors.fechaFinCurso = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      // Validar que la fecha de inicio sea futura (solo para nuevos cursos)
      if (!isEditing) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
          newErrors.fechaInicioCurso = 'La fecha de inicio debe ser mayor o igual a hoy';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para convertir fecha Date a string formato YYYY-MM-DD sin desfase UTC
  const formatDateToInputValue = (date: Date): string => {
    if (!date) return '';
    // Usar la fecha local sin conversión UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para convertir fecha string a ISO con hora local (evita problemas de timezone)
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return dateString;
    // Crear fecha como local (no UTC) y convertir a ISO
    const date = new Date(dateString + 'T12:00:00');
    return date.toISOString();
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos con fechas correctamente formateadas
      const preparedData = {
        ...formData,
        fechaInicioCurso: formatDateForBackend(formData.fechaInicioCurso),
        fechaFinCurso: formatDateForBackend(formData.fechaFinCurso)
      };

      if (isEditing && course) {
        const updateData: UpdateCourseData = {
          idCurso: course.idCurso,
          ...preparedData
        };
        await onSubmit(updateData);
      } else {
        await onSubmit(preparedData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#F3762B' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </h3>
              <p className="text-orange-100">
                {isEditing ? `Modificando curso #${course?.idCurso}` : 'Complete la información del curso'}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            className="text-white hover:bg-orange-600 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Corto *
                  </label>
                  <Input
                    value={formData.nombreCortoCurso}
                    onChange={(e) => handleInputChange('nombreCortoCurso', e.target.value)}
                    placeholder="Ej: REACT-BASIC"
                    maxLength={100}
                    className={errors.nombreCortoCurso ? 'border-red-500' : ''}
                  />
                  {errors.nombreCortoCurso && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombreCortoCurso}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <Input
                    value={formData.nombreCurso}
                    onChange={(e) => handleInputChange('nombreCurso', e.target.value)}
                    placeholder="Ej: Curso Básico de React y TypeScript"
                    maxLength={100}
                    className={errors.nombreCurso ? 'border-red-500' : ''}
                  />
                  {errors.nombreCurso && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombreCurso}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <Textarea
                    value={formData.descripcionCurso}
                    onChange={(e) => handleInputChange('descripcionCurso', e.target.value)}
                    placeholder="Describe el contenido y objetivos del curso..."
                    rows={4}
                    className={errors.descripcionCurso ? 'border-red-500' : ''}
                  />
                  {errors.descripcionCurso && (
                    <p className="text-red-500 text-xs mt-1">{errors.descripcionCurso}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración del Curso */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad *
                  </label>
                  <Select
                    value={formData.modalidadCurso}
                    onValueChange={(value) => handleInputChange('modalidadCurso', value)}
                  >
                    <SelectTrigger className={errors.modalidadCurso ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccione la modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODALIDADES_CURSO.map((modalidad) => (
                        <SelectItem key={modalidad} value={modalidad}>
                          {modalidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.modalidadCurso && (
                    <p className="text-red-500 text-xs mt-1">{errors.modalidadCurso}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (USD) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.valorCurso}
                    onChange={(e) => handleInputChange('valorCurso', parseFloat(e.target.value) || 1)}
                    placeholder="1.00"
                    className={errors.valorCurso ? 'border-red-500' : ''}
                  />
                  {errors.valorCurso && (
                    <p className="text-red-500 text-xs mt-1">{errors.valorCurso}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enlace de Pago *
                  </label>
                  <Input
                    type="url"
                    value={formData.enlacePago}
                    onChange={(e) => handleInputChange('enlacePago', e.target.value)}
                    placeholder="https://ejemplo.com/pago"
                    className={errors.enlacePago ? 'border-red-500' : ''}
                  />
                  {errors.enlacePago && (
                    <p className="text-red-500 text-xs mt-1">{errors.enlacePago}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    URL donde los participantes realizarán el pago del curso
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card className="lg:col-span-2">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Fechas del Curso</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <Input
                      type="date"
                      value={formData.fechaInicioCurso}
                      onChange={(e) => handleInputChange('fechaInicioCurso', e.target.value)}
                      className={errors.fechaInicioCurso ? 'border-red-500' : ''}
                    />
                    {errors.fechaInicioCurso && (
                      <p className="text-red-500 text-xs mt-1">{errors.fechaInicioCurso}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin *
                    </label>
                    <Input
                      type="date"
                      value={formData.fechaFinCurso}
                      onChange={(e) => handleInputChange('fechaFinCurso', e.target.value)}
                      className={errors.fechaFinCurso ? 'border-red-500' : ''}
                    />
                    {errors.fechaFinCurso && (
                      <p className="text-red-500 text-xs mt-1">{errors.fechaFinCurso}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mensaje de advertencia para edición */}
          {isEditing && (
            <Alert className="mt-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Advertencia:</strong> Los cambios en las fechas pueden afectar a las inscripciones existentes.
              </AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Actualizar Curso' : 'Crear Curso'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};