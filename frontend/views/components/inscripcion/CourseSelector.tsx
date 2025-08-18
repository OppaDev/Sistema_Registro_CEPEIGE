// views/components/CourseSelector.tsx
import React, { useState, useEffect } from 'react';
import { Course, CourseSelection } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from './LoadingSpinner';

interface CourseSelectorProps {
  selectedCourse?: CourseSelection;
  onCourseSelect: (course: CourseSelection) => void;
  error?: string;
}

export function CourseSelector({ selectedCourse, onCourseSelect, error }: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const availableCourses = await courseService.getAvailableCourses();
      setCourses(availableCourses);
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      setFetchError(errorObj.message || 'Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    const selection: CourseSelection = {
      courseId: course.idCurso,
      courseName: course.nombreCurso,
      coursePrice: course.valorCurso
    };
    onCourseSelect(selection);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl text-orange-600">
            Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl text-orange-600">
            Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500 bg-red-50 text-red-800">
            <AlertDescription>
              {fetchError}
              <Button 
                onClick={loadCourses} 
                variant="outline" 
                size="sm" 
                className="ml-2"
              >
                Reintentar
              </Button>
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
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {courses.length === 0 ? (
          <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertDescription>
              No hay cursos disponibles en este momento.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course.idCurso}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedCourse?.courseId === course.idCurso
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {course.nombreCurso}
                  </h3>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(course.valorCurso)}
                  </span>
                </div>
                
                {course.descripcionCurso && (
                  <p className="text-gray-600 text-sm mb-3">
                    {course.descripcionCurso}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    📅 Inicio: {formatDate(course.fechaInicioCurso)}
                  </span>
                  <span>
                    🏁 Fin: {formatDate(course.fechaFinCurso)}
                  </span>
                </div>
                
                {selectedCourse?.courseId === course.idCurso && (
                  <div className="mt-3 flex items-center text-orange-600">
                    <span className="text-lg mr-2">✓</span>
                    <span className="font-medium">Curso seleccionado</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <span className="text-lg mr-2">✅</span>
              <div>
                <p className="font-medium">{selectedCourse.courseName}</p>
                <p className="text-sm">
                  Precio: {formatPrice(selectedCourse.coursePrice)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
