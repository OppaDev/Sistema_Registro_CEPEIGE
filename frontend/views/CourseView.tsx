// views/CourseView.tsx
import React from 'react';
import { Course } from '@/models/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useCourseController } from '@/controllers/CourseController';

interface CourseViewProps {
  onCourseSelect?: (course: Course) => void;
  selectedCourseId?: number;
  showSelectionOnly?: boolean;
  error?: string;
}

export function CourseView({ 
  onCourseSelect, 
  selectedCourseId, 
  showSelectionOnly = false,
  error 
}: CourseViewProps) {
  const {
    courses,
    selectedCourse,
    loading,
    error: controllerError,
    loadCourses,
    selectCourse,
    formatPrice,
    formatDate,
    getDuration,
    isCourseAvailable
  } = useCourseController();

  const handleCourseSelect = (course: Course) => {
    selectCourse(course);
    onCourseSelect?.(course);
  };

  const displayError = error || controllerError;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl text-orange-600">
            📚 Cursos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <LoadingSpinner text="Cargando cursos..." />
        </CardContent>
      </Card>
    );
  }

  if (displayError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl text-orange-600">
            📚 Cursos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500 bg-red-50 text-red-800">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{displayError}</span>
                <Button 
                  onClick={loadCourses} 
                  variant="outline" 
                  size="sm"
                  className="ml-2"
                >
                  🔄 Reintentar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-orange-500 text-white">
        <CardTitle className="text-center text-xl">
          📚 Seleccionar Curso
        </CardTitle>
        <p className="text-center text-orange-100 mt-2">
          Elige el curso que más te interese
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {courses.length === 0 ? (
          <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertDescription className="flex items-center">
              <span className="mr-2">⚠️</span>
              No hay cursos disponibles en este momento.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 mb-4">
              {courses.map((course) => {
                const isSelected = selectedCourseId === course.idCurso || 
                                 selectedCourse?.idCurso === course.idCurso;
                const isAvailable = isCourseAvailable(course);
                const duration = getDuration(course);

                return (
                  <div
                    key={course.idCurso}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-orange-500 bg-orange-50 shadow-lg transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }
                      ${!isAvailable ? 'opacity-60' : ''}
                    `}
                    onClick={() => isAvailable && handleCourseSelect(course)}
                  >
                    {/* Header del curso */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {course.nombreCurso}
                        </h3>
                        {!isAvailable && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                            No disponible
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">
                          {formatPrice(course.valorCurso)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Descripción */}
                    {course.descripcionCurso && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.descripcionCurso}
                      </p>
                    )}
                    
                    {/* Información del curso */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        <span>Inicio: {formatDate(course.fechaInicioCurso)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🏁</span>
                        <span>Fin: {formatDate(course.fechaFinCurso)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        <span>Duración: {duration} días</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🎯</span>
                        <span>Modalidad: Presencial</span>
                      </div>
                    </div>
                    
                    {/* Indicador de selección */}
                    {isSelected && (
                      <div className="flex items-center text-orange-600 font-medium">
                        <span className="text-lg mr-2">✅</span>
                        <span>Curso seleccionado</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumen de selección */}
            {(selectedCourse || selectedCourseId) && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center text-green-800">
                    <span className="text-2xl mr-3">🎉</span>
                    <div>
                      <p className="font-semibold text-lg">
                        {selectedCourse?.nombreCurso || 'Curso seleccionado'}
                      </p>
                      <p className="text-sm text-green-600">
                        Precio: {selectedCourse && formatPrice(selectedCourse.valorCurso)}
                      </p>
                      {selectedCourse && (
                        <p className="text-sm text-green-600">
                          Inicia: {formatDate(selectedCourse.fechaInicioCurso)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CourseView;
