// views/components/CourseDetailModal.tsx - NUEVO ARCHIVO

import React from 'react';
import { Course } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Calendar, DollarSign, Clock, MapPin, Info, FileText } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose
}) => {
  if (!isOpen || !course) return null;

  const getModalidadBadge = (modalidad: string) => {
    const { color, text, bgColor } = courseService.getModalidadBadge(modalidad);
    return (
      <Badge className={`${bgColor} ${color} border-0 text-sm px-3 py-1`}>
        {text}
      </Badge>
    );
  };

  const duration = courseService.calculateDuration(course.fechaInicioCurso, course.fechaFinCurso);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#02549E' }}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Detalles del Curso
              </h3>
              <p className="text-blue-100">
                ID: #{course.idCurso}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Principal */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 mr-2 text-gray-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre Corto</label>
                  <p className="text-lg font-semibold text-gray-900">{course.nombreCortoCurso}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                  <p className="text-lg font-semibold text-gray-900">{course.nombreCurso}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-700">
                    {course.descripcionCurso || 'Sin descripción disponible'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Modalidad</label>
                    <div className="mt-1">
                      {getModalidadBadge(course.modalidadCurso)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Fechas y Duración */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  Fechas y Duración
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    {courseService.formatDate(course.fechaInicioCurso)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Fin</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-red-600" />
                    {courseService.formatDate(course.fechaFinCurso)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Duración</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    {duration} días
                  </p>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Estado del Curso</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date() < course.fechaInicioCurso 
                      ? '🟡 Próximo a iniciar' 
                      : new Date() > course.fechaFinCurso 
                      ? '🔴 Finalizado' 
                      : '🟢 En progreso'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información de Precio */}
            <Card className="lg:col-span-2">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
                  Información Comercial
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <label className="text-sm font-medium text-gray-600">Precio del Curso</label>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#F3762B' }}>
                      {courseService.formatPrice(course.valorCurso)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <label className="text-sm font-medium text-gray-600">Disponibilidad</label>
                    <p className="text-lg font-semibold mt-2">
                      {courseService.canDeleteCourse(course) 
                        ? '✅ Disponible para modificaciones' 
                        : '⚠️ Curso en progreso o finalizado'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="px-6 py-2"
            style={{ backgroundColor: '#02549E' }}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
