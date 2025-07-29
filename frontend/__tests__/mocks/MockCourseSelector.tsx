import React from 'react';

// Mock component para CourseSelector
const MockCourseSelector = ({ courses, onCourseSelect, selectedCourse }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value);
    const selectedCourse = courses.find((course: any) => course.idCurso === courseId);
    onCourseSelect(selectedCourse);
  };

  return (
    <div>
      <label htmlFor="course-selector">Seleccionar curso</label>
      <select 
        id="course-selector" 
        name="course-selector"
        role="combobox"
        value={selectedCourse?.idCurso || ''}
        onChange={handleChange}
      >
        <option value="">Seleccione un curso</option>
        {courses.map((course: any) => (
          <option key={course.idCurso} value={course.idCurso}>
            {course.nombreLargo}
          </option>
        ))}
      </select>
      {selectedCourse && (
        <div data-testid="selected-course">
          {selectedCourse.nombreLargo}
        </div>
      )}
    </div>
  );
};

export default MockCourseSelector;
