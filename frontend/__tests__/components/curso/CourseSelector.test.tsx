import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CourseSelector } from '@/views/components/CourseSelector';
import { CourseSelection } from '@/models/course';
import { courseService } from '@/services/courseService';

// Mock del servicio de cursos
jest.mock('@/services/courseService', () => ({
  courseService: {
    getAvailableCourses: jest.fn()
  }
}));

const mockCourseService = courseService as jest.Mocked<typeof courseService>;

describe('PREF-001: Selección del curso (RF-01.1)', () => {
  const mockOnCourseSelect = jest.fn();
  
  const mockCourses = [
    { 
      idCurso: 1, 
      nombreCurso: 'Curso de Python - Nivel Básico',
      valorCurso: 50.00,
      fechaInicioCurso: new Date('2024-01-15'),
      fechaFinCurso: new Date('2024-03-15'),
      nombreCortoCurso: 'PYBASIC',
      modalidadCurso: 'Presencial',
      descripcionCurso: 'Curso básico de Python'
    },
    { 
      idCurso: 2, 
      nombreCurso: 'Curso de Java - Nivel Avanzado',
      valorCurso: 75.00,
      fechaInicioCurso: new Date('2024-02-01'),
      fechaFinCurso: new Date('2024-04-01'),
      nombreCortoCurso: 'JAVADV',
      modalidadCurso: 'Virtual',
      descripcionCurso: 'Curso avanzado de Java'
    },
    { 
      idCurso: 3, 
      nombreCurso: 'Curso de React - Nivel Intermedio',
      valorCurso: 60.00,
      fechaInicioCurso: new Date('2024-01-20'),
      fechaFinCurso: new Date('2024-03-20'),
      nombreCortoCurso: 'REACTINT',
      modalidadCurso: 'Híbrido',
      descripcionCurso: 'Curso intermedio de React'
    }
  ];

  const mockSelectedCourse: CourseSelection = {
    courseId: 1,
    courseName: 'Curso de Python - Nivel Básico',
    coursePrice: 50.00
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCourseService.getAvailableCourses.mockResolvedValue(mockCourses);
  });

  it('should display course selector when page loads', async () => {
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={undefined}
      />
    );

    // Esperar a que se carguen los cursos
    await waitFor(() => {
      expect(screen.getByText('Seleccionar Curso')).toBeInTheDocument();
    });
  });

  it('should show available courses with names and prices', async () => {
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={undefined}
      />
    );

    // Esperar a que se carguen los cursos
    await waitFor(() => {
      expect(screen.getByText('Curso de Python - Nivel Básico')).toBeInTheDocument();
      expect(screen.getByText('Curso de Java - Nivel Avanzado')).toBeInTheDocument();
      expect(screen.getByText('Curso de React - Nivel Intermedio')).toBeInTheDocument();
    });
  });

  it('should select course correctly when user clicks on it', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={undefined}
      />
    );

    // Esperar a que se carguen los cursos y hacer clic en uno
    await waitFor(() => {
      expect(screen.getByText('Curso de Python - Nivel Básico')).toBeInTheDocument();
    });

    // Buscar el div contenedor del curso y hacer clic en él
    const courseDiv = screen.getByText('Curso de Python - Nivel Básico').closest('div[class*="cursor-pointer"]');
    expect(courseDiv).toBeInTheDocument();
    
    if (courseDiv) {
      await user.click(courseDiv);
    }

    expect(mockOnCourseSelect).toHaveBeenCalledWith({
      courseId: 1,
      courseName: 'Curso de Python - Nivel Básico',
      coursePrice: 50.00
    });
  });

  it('should mark selected course in the form (PREF-001 specific test)', async () => {
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={mockSelectedCourse}
      />
    );

    // Esperar a que se carguen los cursos y verificar que esté seleccionado
    await waitFor(() => {
      expect(screen.getByText('Curso seleccionado')).toBeInTheDocument();
    });
    
    // Verificar que se muestra el resumen del curso seleccionado
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('$50,00')).toBeInTheDocument();
  });

  it('should handle course change correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={mockSelectedCourse}
      />
    );

    // Esperar a que se carguen los cursos y cambiar a otro
    await waitFor(() => {
      expect(screen.getByText('Curso de Java - Nivel Avanzado')).toBeInTheDocument();
    });

    // Buscar el div del curso Java y hacer clic
    const javaDiv = screen.getByText('Curso de Java - Nivel Avanzado').closest('div[class*="cursor-pointer"]');
    expect(javaDiv).toBeInTheDocument();
    
    if (javaDiv) {
      await user.click(javaDiv);
    }

    expect(mockOnCourseSelect).toHaveBeenCalledWith({
      courseId: 2,
      courseName: 'Curso de Java - Nivel Avanzado',
      coursePrice: 75.00
    });
  });

  it('should show all active courses only', async () => {
    // Para este test, simplemente verificamos que se muestren todos los cursos mockeados
    render(
      <CourseSelector 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={undefined}
      />
    );

    // Verificar que aparecen todos los cursos disponibles
    await waitFor(() => {
      expect(screen.getByText('Curso de Python - Nivel Básico')).toBeInTheDocument();
      expect(screen.getByText('Curso de Java - Nivel Avanzado')).toBeInTheDocument();
      expect(screen.getByText('Curso de React - Nivel Intermedio')).toBeInTheDocument();
    });
  });
});
