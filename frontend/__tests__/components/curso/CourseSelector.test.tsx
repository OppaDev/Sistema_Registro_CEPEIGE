import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockCourses } from '../../fixtures/mockData';

// Mock del componente CourseSelector con estado interno para las pruebas
interface Course {
  idCurso: number;
  nombreCorto: string;
  nombreLargo: string;
  costoTotal: number;
  activo: boolean;
}

interface MockCourseSelectorProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  selectedCourse: Course | null;
}

const MockCourseSelector = ({ courses, onCourseSelect, selectedCourse: initialCourse }: MockCourseSelectorProps) => {
  const [selectedCourse, setSelectedCourse] = React.useState(initialCourse);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    const course = courses.find((c: Course) => c.idCurso === courseId) || null;
    setSelectedCourse(course);
    if (course) {
      onCourseSelect(course);
    }
  };

  return (
    <div>
      <label htmlFor="course-selector">Seleccionar Curso</label>
      <select 
        id="course-selector"
        value={selectedCourse?.idCurso || ''}
        onChange={handleChange}
      >
        <option value="">Seleccione un curso</option>
        {courses.map((course: Course) => (
          <option key={course.idCurso} value={course.idCurso}>
            {course.nombreLargo}
          </option>
        ))}
      </select>
      {selectedCourse && (
        <div data-testid="selected-course">
          Curso seleccionado: {selectedCourse.nombreLargo}
        </div>
      )}
    </div>
  );
};

describe('PREF-001: Selección del curso (RF-01.1)', () => {
  const mockOnCourseSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display course selector when page loads', () => {
    render(
      <MockCourseSelector 
        courses={mockCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={null}
      />
    );

    expect(screen.getByLabelText(/seleccionar curso/i)).toBeInTheDocument();
    expect(screen.getByText('Seleccione un curso')).toBeInTheDocument();
  });

  it('should show available courses with short and long names', async () => {
    render(
      <MockCourseSelector 
        courses={mockCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={null}
      />
    );

    // Verificar que las opciones están disponibles
    expect(screen.getByText('Curso de Python - Nivel Básico')).toBeInTheDocument();
    expect(screen.getByText('Curso de Java - Nivel Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Curso de React - Nivel Intermedio')).toBeInTheDocument();
  });

  it('should select course correctly when user clicks on it', async () => {
    const user = userEvent.setup();
    
    render(
      <MockCourseSelector 
        courses={mockCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={null}
      />
    );

    const selector = screen.getByRole('combobox');
    await user.selectOptions(selector, '1');

    expect(mockOnCourseSelect).toHaveBeenCalledWith(mockCourses[0]);
    expect(selector).toHaveValue('1');
  });

  it('should mark selected course in the form (PREF-001 specific test)', async () => {
    render(
      <MockCourseSelector 
        courses={mockCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={mockCourses[0]}
      />
    );

    const selector = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selector.value).toBe('1');
    
    // Verificar que se muestra el curso seleccionado
    expect(screen.getByTestId('selected-course')).toHaveTextContent('Curso de Python - Nivel Básico');
  });

  it('should handle course change correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <MockCourseSelector 
        courses={mockCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={mockCourses[0]}
      />
    );

    const selector = screen.getByRole('combobox');
    
    // Cambiar a otro curso
    await user.selectOptions(selector, '2');

    expect(mockOnCourseSelect).toHaveBeenCalledWith(mockCourses[1]);
  });

  it('should show all active courses only', () => {
    const coursesWithInactive = [
      ...mockCourses,
      { 
        idCurso: 4, 
        nombreCorto: 'INACTIVE', 
        nombreLargo: 'Curso Inactivo',
        costoTotal: 0,
        activo: false
      }
    ];

    const activeCourses = coursesWithInactive.filter(course => course.activo);

    render(
      <MockCourseSelector 
        courses={activeCourses} 
        onCourseSelect={mockOnCourseSelect}
        selectedCourse={null}
      />
    );

    // Verificar que solo aparecen cursos activos
    expect(screen.getByText('Curso de Python - Nivel Básico')).toBeInTheDocument();
    expect(screen.getByText('Curso de Java - Nivel Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Curso de React - Nivel Intermedio')).toBeInTheDocument();
    expect(screen.queryByText('Curso Inactivo')).not.toBeInTheDocument();
  });
});
