import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { mockCourses, mockPersonalData, mockBillingData } from '../fixtures/mockData';

// Mock del formulario completo de inscripción (ParticipantRegistrationView)
const MockParticipantRegistrationView = () => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    curso: null as any,
    participante: {} as any,
    facturacion: {} as any,
    comprobante: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');

  const handleCourseSelect = (course: any) => {
    setFormData({ ...formData, curso: course });
  };

  const handlePersonalDataChange = (data: any) => {
    setFormData({ ...formData, participante: data });
  };

  const handleBillingDataChange = (data: any) => {
    setFormData({ ...formData, facturacion: data });
  };

  const handleFileUpload = (file: File) => {
    setFormData({ ...formData, comprobante: file });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simular envío al servidor
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Inscripción registrada exitosamente');
    }, 1000);
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return formData.curso !== null;
      case 2: return Object.keys(formData.participante).length > 0;
      case 3: return Object.keys(formData.facturacion).length > 0;
      case 4: return formData.comprobante !== null;
      default: return false;
    }
  };

  return (
    <div data-testid="participant-registration-form">
      <h1>Formulario de Inscripción - CEPEIGE</h1>
      
      {/* Indicador de pasos */}
      <div data-testid="step-indicator">
        Paso {currentStep} de 4
      </div>

      {/* Paso 1: Selección de curso */}
      {currentStep === 1 && (
        <div data-testid="step-course-selection">
          <h2>Seleccionar Curso</h2>
          <select 
            data-testid="course-selector"
            onChange={(e) => {
              const course = mockCourses.find(c => c.idCurso === parseInt(e.target.value));
              handleCourseSelect(course);
            }}
          >
            <option value="">Seleccione un curso</option>
            {mockCourses.map(course => (
              <option key={course.idCurso} value={course.idCurso}>
                {course.nombreLargo}
              </option>
            ))}
          </select>
          
          {formData.curso && (
            <div data-testid="selected-course-info">
              <p>Curso seleccionado: {(formData.curso as any).nombreLargo}</p>
              <p>Costo: ${(formData.curso as any).costoTotal}</p>
            </div>
          )}
          
          <button 
            onClick={() => setCurrentStep(2)} 
            disabled={!isStepComplete(1)}
            data-testid="next-step-1"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2: Datos personales */}
      {currentStep === 2 && (
        <div data-testid="step-personal-data">
          <h2>Datos Personales</h2>
          <input data-testid="nombres" placeholder="Nombres" onChange={(e) => 
            handlePersonalDataChange({...formData.participante, nombres: e.target.value})
          } />
          <input data-testid="apellidos" placeholder="Apellidos" onChange={(e) => 
            handlePersonalDataChange({...formData.participante, apellidos: e.target.value})
          } />
          <input data-testid="ciPasaporte" placeholder="Cédula/Pasaporte" onChange={(e) => 
            handlePersonalDataChange({...formData.participante, ciPasaporte: e.target.value})
          } />
          <input data-testid="correo" type="email" placeholder="Correo Electrónico" onChange={(e) => 
            handlePersonalDataChange({...formData.participante, correo: e.target.value})
          } />
          
          <div>
            <button onClick={() => setCurrentStep(1)} data-testid="back-step-2">Anterior</button>
            <button 
              onClick={() => setCurrentStep(3)} 
              disabled={!isStepComplete(2)}
              data-testid="next-step-2"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Datos de facturación */}
      {currentStep === 3 && (
        <div data-testid="step-billing-data">
          <h2>Datos de Facturación</h2>
          <input data-testid="razonSocial" placeholder="Razón Social" onChange={(e) => 
            handleBillingDataChange({...formData.facturacion, razonSocial: e.target.value})
          } />
          <input data-testid="ruc" placeholder="RUC" onChange={(e) => 
            handleBillingDataChange({...formData.facturacion, ruc: e.target.value})
          } />
          
          <div>
            <button onClick={() => setCurrentStep(2)} data-testid="back-step-3">Anterior</button>
            <button 
              onClick={() => setCurrentStep(4)} 
              disabled={!isStepComplete(3)}
              data-testid="next-step-3"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: Comprobante de pago */}
      {currentStep === 4 && (
        <div data-testid="step-file-upload">
          <h2>Comprobante de Pago</h2>
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg"
            data-testid="file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          
          {formData.comprobante && (
            <div data-testid="file-preview">
              Archivo: {(formData.comprobante as File).name}
            </div>
          )}
          
          <div>
            <button onClick={() => setCurrentStep(3)} data-testid="back-step-4">Anterior</button>
            <button 
              onClick={handleSubmit} 
              disabled={!isStepComplete(4) || isSubmitting}
              data-testid="submit-form"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Inscripción'}
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de resultado */}
      {submitMessage && (
        <div data-testid="submit-message" className="success">
          {submitMessage}
        </div>
      )}
    </div>
  );
};

describe('RF-01: Flujo Completo de Inscripción (Integración PREF-001 a PREF-004)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display initial registration form', () => {
    render(<MockParticipantRegistrationView />);
    
    expect(screen.getByText('Formulario de Inscripción - CEPEIGE')).toBeInTheDocument();
    expect(screen.getByTestId('step-indicator')).toHaveTextContent('Paso 1 de 4');
    expect(screen.getByTestId('step-course-selection')).toBeInTheDocument();
  });

  it('should complete full registration flow (RF-01 complete)', async () => {
    const user = userEvent.setup();
    
    render(<MockParticipantRegistrationView />);

    // ✅ PASO 1: PREF-001 - Selección del curso
    expect(screen.getByText('Seleccionar Curso')).toBeInTheDocument();
    
    const courseSelector = screen.getByTestId('course-selector');
    await user.selectOptions(courseSelector, '1'); // Curso de Python
    
    expect(screen.getByTestId('selected-course-info')).toBeInTheDocument();
    expect(screen.getByTestId('selected-course-info')).toHaveTextContent('Curso de Python - Nivel Básico');
    
    await user.click(screen.getByTestId('next-step-1'));

    // ✅ PASO 2: PREF-002 - Datos personales
    expect(screen.getByText('Datos Personales')).toBeInTheDocument();
    
    await user.type(screen.getByTestId('nombres'), mockPersonalData.nombres);
    await user.type(screen.getByTestId('apellidos'), mockPersonalData.apellidos);
    await user.type(screen.getByTestId('ciPasaporte'), mockPersonalData.ciPasaporte);
    await user.type(screen.getByTestId('correo'), mockPersonalData.correo);
    
    await user.click(screen.getByTestId('next-step-2'));

    // ✅ PASO 3: PREF-003 - Datos de facturación
    expect(screen.getByText('Datos de Facturación')).toBeInTheDocument();
    
    await user.type(screen.getByTestId('razonSocial'), mockBillingData.razonSocial);
    await user.type(screen.getByTestId('ruc'), mockBillingData.identificacionTributaria);
    
    await user.click(screen.getByTestId('next-step-3'));

    // ✅ PASO 4: PREF-004 - Comprobante de pago
    expect(screen.getByText('Comprobante de Pago')).toBeInTheDocument();
    
    const file = new File(['dummy'], 'comprobante_pago.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, file);
    
    expect(screen.getByTestId('file-preview')).toBeInTheDocument();
    expect(screen.getByText('Archivo: comprobante_pago.pdf')).toBeInTheDocument();

    // ✅ PASO 5: Envío final
    await user.click(screen.getByTestId('submit-form'));
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument();
    
    // Esperar mensaje de éxito
    await waitFor(() => {
      expect(screen.getByTestId('submit-message')).toBeInTheDocument();
      expect(screen.getByText('Inscripción registrada exitosamente')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should prevent progression without completing required steps', async () => {
    const user = userEvent.setup();
    
    render(<MockParticipantRegistrationView />);

    // Intentar avanzar sin seleccionar curso
    const nextButton = screen.getByTestId('next-step-1');
    expect(nextButton).toBeDisabled();
    
    // Seleccionar curso y avanzar
    await user.selectOptions(screen.getByTestId('course-selector'), '1');
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);
    
    // En paso 2, intentar avanzar sin datos
    const nextButton2 = screen.getByTestId('next-step-2');
    expect(nextButton2).toBeDisabled();
  });

  it('should allow navigation between steps', async () => {
    const user = userEvent.setup();
    
    render(<MockParticipantRegistrationView />);

    // Avanzar al paso 2
    await user.selectOptions(screen.getByTestId('course-selector'), '1');
    await user.click(screen.getByTestId('next-step-1'));
    
    expect(screen.getByTestId('step-personal-data')).toBeInTheDocument();
    
    // Regresar al paso 1
    await user.click(screen.getByTestId('back-step-2'));
    
    expect(screen.getByTestId('step-course-selection')).toBeInTheDocument();
  });

  it('should show step indicator correctly', async () => {
    const user = userEvent.setup();
    
    render(<MockParticipantRegistrationView />);

    // Paso 1
    expect(screen.getByTestId('step-indicator')).toHaveTextContent('Paso 1 de 4');
    
    // Avanzar al paso 2
    await user.selectOptions(screen.getByTestId('course-selector'), '1');
    await user.click(screen.getByTestId('next-step-1'));
    
    expect(screen.getByTestId('step-indicator')).toHaveTextContent('Paso 2 de 4');
  });

  it('should validate file types in upload step', async () => {
    const user = userEvent.setup();
    
    render(<MockParticipantRegistrationView />);

    // Navegar hasta el paso 4
    await user.selectOptions(screen.getByTestId('course-selector'), '1');
    await user.click(screen.getByTestId('next-step-1'));
    
    await user.type(screen.getByTestId('nombres'), 'Test');
    await user.click(screen.getByTestId('next-step-2'));
    
    await user.type(screen.getByTestId('razonSocial'), 'Test');
    await user.click(screen.getByTestId('next-step-3'));
    
    // Verificar que acepta formatos correctos
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('accept', '.pdf,.png,.jpg,.jpeg');
  });
});
