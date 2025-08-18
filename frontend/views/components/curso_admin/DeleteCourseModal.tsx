// views/components/DeleteCourseModal.tsx - NUEVO ARCHIVO

import React from 'react';
import { Course } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Trash2, AlertTriangle, BookOpen } from 'lucide-react';

interface DeleteCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  isDeleting: boolean;
  onConfirm: (courseId: number) => Promise<void>;
  onCancel: () => void;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  course,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !course) return null;

  const handleConfirm = async () => {
    await onConfirm(course.idCurso);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-900">
                Eliminar Curso
              </h3>
              <p className="text-red-700 text-xs sm:text-sm">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Información del curso */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Curso a eliminar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">ID:</span>
                  <span className="ml-2 text-sm font-mono">#{course.idCurso}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <span className="ml-2 text-sm font-semibold">{course.nombreCurso}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Código:</span>
                  <span className="ml-2 text-sm">{course.nombreCortoCurso}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Precio:</span>
                  <span className="ml-2 text-sm font-semibold text-orange-600">
                    {courseService.formatPrice(course.valorCurso)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Fechas:</span>
                  <span className="ml-2 text-sm">
                    {courseService.formatDate(course.fechaInicioCurso)} - {courseService.formatDate(course.fechaFinCurso)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertencias */}
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>⚠️ Advertencia:</strong> Al eliminar este curso se perderán permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Toda la información del curso</li>
                <li>Las inscripciones asociadas (si las hay)</li>
                <li>El historial de participantes</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Información adicional para cursos ya pasados */}
          {course.fechaInicioCurso < new Date() && (
            <Alert className="border-amber-200 bg-amber-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Curso finalizado:</strong> Este curso ya ha terminado. 
                Al eliminarlo se perderá todo el historial y las inscripciones asociadas.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmación - siempre mostrar ya que todos los cursos se pueden eliminar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Para confirmar la eliminación, tenga en cuenta que:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Esta acción es <strong>irreversible</strong></li>
              <li>• Se eliminará toda la información relacionada</li>
              <li>• Los reportes históricos pueden verse afectados</li>
              <li>• Las inscripciones asociadas también se eliminarán</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isDeleting}
            className="px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Eliminar Curso</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
