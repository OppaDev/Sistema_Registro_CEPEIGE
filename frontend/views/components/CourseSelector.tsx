// frontend/views/components/CourseSelector.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService'; // Cambiar importación
import { Course, CourseSelection } from '@/models/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from './LoadingSpinner'; // Importación corregida

interface CourseSelectorProps {
  selectedCourse?: CourseSelection;
  onCourseSelect: (course: CourseSelection) => void;
  error?: string;
}

export function CourseSelector({ 
  selectedCourse, 
  onCourseSelect, 
  error 
}: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setApiError('');
      const availableCourses = await courseService.getAvailableCourses();
      setCourses(availableCourses);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      setApiError(error.message || 'Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    const courseSelection: CourseSelection = {
      courseId: course.idCurso,
      courseName: course.nombreCurso,
      coursePrice: course.valorCurso
    };
    onCourseSelect(courseSelection);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="bg-orange-500 text-white">
          <CardTitle className="text-center text-xl">
            🎓 Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <LoadingSpinner 
            size="lg" 
            text="Cargando cursos disponibles..." 
          />
        </CardContent>
      </Card>
    );
  }

  if (apiError) {
    return (
      <Card>
        <CardHeader className="bg-orange-500 text-white">
          <CardTitle className="text-center text-xl">
            🎓 Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="border-red-500 bg-red-50 text-red-800">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{apiError}</span>
                <Button 
                  onClick={loadCourses}
                  variant="outline"
                  size="sm"
                  className="ml-4"
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
          🎓 Seleccionar Curso
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 bg-orange-50">
        {/* Error de validación */}
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50 text-red-800">
            <AlertDescription className="font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Curso seleccionado */}
        {selectedCourse && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">
                  ✅ Curso Seleccionado
                </h3>
                <p className="text-green-700">{selectedCourse.courseName}</p>
              </div>
              <Badge className="bg-green-600 text-white">
                {formatPrice(selectedCourse.coursePrice)}
              </Badge>
            </div>
          </div>
        )}

        {/* Lista de cursos */}
        {courses.length === 0 ? (
          <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertDescription>
              No hay cursos disponibles en este momento.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cursos Disponibles:
            </h3>
            
            {courses.map((course) => {
              const isSelected = selectedCourse?.courseId === course.idCurso;
              
              return (
                <div
                  key={course.idCurso}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {course.nombreCurso}
                      </h4>
                      
                      {course.descripcionCurso && (
                        <p className="text-gray-600 mb-3 text-sm">
                          {course.descripcionCurso}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          📅 Inicio: {formatDate(course.fechaInicioCurso)}
                        </span>
                        <span className="flex items-center">
                          🏁 Fin: {formatDate(course.fechaFinCurso)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {formatPrice(course.valorCurso)}
                      </div>
                      
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={
                          isSelected
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-orange-500 text-orange-600 hover:bg-orange-50"
                        }
                      >
                        {isSelected ? "✅ Seleccionado" : "📝 Seleccionar"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón de recarga */}
        <div className="mt-6 text-center">
          <Button
            onClick={loadCourses}
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            🔄 Actualizar Cursos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Exportación por defecto también
export default CourseSelector;
