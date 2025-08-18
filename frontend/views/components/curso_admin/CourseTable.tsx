// views/components/CourseTable.tsx - NUEVO ARCHIVO

import React from 'react';
import { Course } from '@/models/inscripcion/course';
import { courseService } from '@/services/inscripcion/courseService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, BookOpen, Plus } from 'lucide-react';

interface CourseTableProps {
  courses: Course[];
  loading: boolean;
  onViewDetails: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onCreateCourse: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  loading,
  onViewDetails,
  onEditCourse,
  onDeleteCourse,
  onCreateCourse,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  const getModalidadBadge = (modalidad: string) => {
    const { color, text, bgColor } = courseService.getModalidadBadge(modalidad);
    return (
      <Badge className={`${bgColor} ${color} border-0`}>
        {text}
      </Badge>
    );
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Cargando cursos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader style={{ backgroundColor: '#F3762B' }} className="text-white p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-lg lg:text-xl font-bold flex items-center">
              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
              Gestión de Cursos
            </CardTitle>
            <p className="text-orange-100 text-sm lg:text-base">
              Mostrando {startItem} - {endItem} de {totalItems} cursos
            </p>
          </div>
          <Button
            onClick={onCreateCourse}
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold w-full lg:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
             <span className="lg:inline">Nuevo Curso</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cursos registrados
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer curso.
            </p>
            <Button onClick={onCreateCourse} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Curso
            </Button>
          </div>
        ) : (
          <>
            {/* Vista móvil - Cards */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {courses.map((course) => (
                  <Card key={course.idCurso} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header del curso */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{course.nombreCurso}</h3>
                            <p className="text-xs text-gray-500">#{course.idCurso} • {course.nombreCortoCurso}</p>
                          </div>
                          {getModalidadBadge(course.modalidadCurso)}
                        </div>
                        
                        {/* Precio y fechas */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Precio</p>
                            <p className="font-semibold" style={{ color: '#F3762B' }}>
                              {courseService.formatPrice(course.valorCurso)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duración</p>
                            <p className="text-gray-700">
                              {courseService.calculateDuration(course.fechaInicioCurso, course.fechaFinCurso)} días
                            </p>
                          </div>
                        </div>
                        
                        {/* Fechas */}
                        <div className="text-xs text-gray-500">
                          <p>Del {courseService.formatDate(course.fechaInicioCurso)} al {courseService.formatDate(course.fechaFinCurso)}</p>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(course)}
                            className="flex-1 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditCourse(course)}
                            className="flex-1 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteCourse(course)}
                            className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#02549E' }}>
                    <TableHead className="text-white font-semibold text-sm">ID</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Nombre Corto</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Nombre Completo</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Modalidad</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Precio</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Fecha Inicio</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Fecha Fin</TableHead>
                    <TableHead className="text-white font-semibold text-sm">Duración</TableHead>
                    <TableHead className="text-white font-semibold text-sm text-center">Acciones</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course, index) => (
                    <TableRow 
                      key={course.idCurso}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <TableCell className="font-medium">
                        #{course.idCurso}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {course.nombreCortoCurso}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {course.nombreCurso}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {course.descripcionCurso}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getModalidadBadge(course.modalidadCurso)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg" style={{ color: '#F3762B' }}>
                          {courseService.formatPrice(course.valorCurso)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {courseService.formatDate(course.fechaInicioCurso)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {courseService.formatDate(course.fechaFinCurso)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {courseService.calculateDuration(course.fechaInicioCurso, course.fechaFinCurso)} días
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          {/* Botón Ver Detalles */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewDetails(course)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            style={{ color: '#0367A6' }}
                            title="Ver detalles completos"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Botón Editar */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditCourse(course)}
                            className="h-8 w-8 p-0 hover:bg-orange-50 text-orange-600"
                            title="Editar curso"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Botón Eliminar */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteCourse(course)}
                            disabled={!courseService.canDeleteCourse()}
                            className={`h-8 w-8 p-0 ${
                              courseService.canDeleteCourse()
                                ? 'hover:bg-red-50 text-red-600'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              courseService.canDeleteCourse()
                                ? 'Eliminar curso'
                                : 'No se puede eliminar un curso que ya ha iniciado'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                  Mostrando {startItem} - {endItem} de {totalItems} cursos
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                  <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                          <Button
                            onClick={() => onPageChange(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : ""}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                  
                  <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

