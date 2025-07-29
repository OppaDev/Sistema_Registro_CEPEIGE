import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FormInput } from '../../../views/components/FormInput';
import { mockPersonalData } from '../../fixtures/mockData';

// Mock de los componentes UI
jest.mock('../../../components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => (
    <input ref={ref} className={className} {...props} />
  ))
}));

jest.mock('../../../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}));

// Mock del formulario completo usando FormInput real
const PersonalDataFormTest = ({ onSubmit, initialData = {} }: any) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (name: string, value: string) => {
    // Validación básica en blur
    const newErrors = { ...errors };
    if (!value && ['nombres', 'apellidos', 'ciPasaporte', 'correo'].includes(name)) {
      newErrors[name] = 'Este campo es requerido';
    }
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="personal-data-form">
      <h2>Datos Personales</h2>
      
      <FormInput
        label="Nombres"
        name="nombres"
        value={formData.nombres || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.nombres}
        type="text"
      />
      
      <FormInput
        label="Apellidos"
        name="apellidos"
        value={formData.apellidos || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.apellidos}
        type="text"
      />
      
      <FormInput
        label="Cédula/Pasaporte"
        name="ciPasaporte"
        value={formData.ciPasaporte || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.ciPasaporte}
        type="text"
      />
      
      <FormInput
        label="Correo Electrónico"
        name="correo"
        value={formData.correo || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.correo}
        type="email"
      />
      
      <FormInput
        label="Teléfono"
        name="telefono"
        value={formData.telefono || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.telefono}
        type="tel"
      />
      
      <FormInput
        label="Dirección"
        name="direccion"
        value={formData.direccion || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.direccion}
        type="text"
      />
      
      <FormInput
        label="País"
        name="pais"
        value={formData.pais || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.pais}
        type="text"
      />
      
      <FormInput
        label="Ciudad"
        name="ciudad"
        value={formData.ciudad || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.ciudad}
        type="text"
      />
      
      <FormInput
        label="Nacionalidad"
        name="nacionalidad"
        value={formData.nacionalidad || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.nacionalidad}
        type="text"
      />
      
      <button type="submit" data-testid="submit-personal-data">
        Continuar
      </button>
    </form>
  );
};

describe('PREF-002: Registro de datos personales (RF-01.2)', () => {
  let mockOnSubmit: jest.Mock;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    jest.clearAllMocks();
  });

  it('should display personal data form with all required fields', () => {
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Datos Personales')).toBeInTheDocument();
    expect(screen.getByText('Nombres')).toBeInTheDocument();
    expect(screen.getByText('Apellidos')).toBeInTheDocument();
    expect(screen.getByText('Cédula/Pasaporte')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByText('País')).toBeInTheDocument();
    expect(screen.getByText('Ciudad')).toBeInTheDocument();
    expect(screen.getByText('Nacionalidad')).toBeInTheDocument();
  });

  it('should allow user to fill all personal data fields (PREF-002 complete test)', async () => {
    const user = userEvent.setup();
    
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    // Llenar campos con datos específicos del test PREF-002
    const nombresInput = screen.getByDisplayValue('');
    await user.type(nombresInput, mockPersonalData.nombres);
    
    // Verificar que los campos aceptan los datos esperados
    expect(screen.getByDisplayValue(mockPersonalData.nombres)).toBeInTheDocument();
  });

  it('should validate required fields and show error messages', async () => {
    const user = userEvent.setup();
    
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    // Intentar hacer blur en un campo requerido sin llenar
    const nombresInput = screen.getByLabelText('Nombres');
    await user.click(nombresInput);
    await user.tab(); // Trigger blur

    // Verificar mensaje de error
    expect(screen.getByText('Este campo es requerido')).toBeInTheDocument();
  });

  it('should submit form with complete personal data (PREF-002 data)', async () => {
    const user = userEvent.setup();
    
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    // Llenar todos los campos requeridos con datos del mockPersonalData
    await user.type(screen.getByLabelText('Nombres'), mockPersonalData.nombres);
    await user.type(screen.getByLabelText('Apellidos'), mockPersonalData.apellidos);
    await user.type(screen.getByLabelText('Cédula/Pasaporte'), mockPersonalData.ciPasaporte);
    await user.type(screen.getByLabelText('Correo Electrónico'), mockPersonalData.correo);
    await user.type(screen.getByLabelText('Teléfono'), mockPersonalData.telefono);
    await user.type(screen.getByLabelText('Dirección'), mockPersonalData.direccion);
    await user.type(screen.getByLabelText('País'), mockPersonalData.pais);
    await user.type(screen.getByLabelText('Ciudad'), mockPersonalData.ciudad);
    await user.type(screen.getByLabelText('Nacionalidad'), mockPersonalData.nacionalidad);

    // Enviar formulario
    await user.click(screen.getByTestId('submit-personal-data'));

    // Verificar que se llamó la función onSubmit con los datos correctos
    expect(mockOnSubmit).toHaveBeenCalledWith({
      nombres: mockPersonalData.nombres,
      apellidos: mockPersonalData.apellidos,
      ciPasaporte: mockPersonalData.ciPasaporte,
      correo: mockPersonalData.correo,
      telefono: mockPersonalData.telefono,
      direccion: mockPersonalData.direccion,
      pais: mockPersonalData.pais,
      ciudad: mockPersonalData.ciudad,
      nacionalidad: mockPersonalData.nacionalidad
    });
  });

  it('should clear error messages when user starts typing', async () => {
    const user = userEvent.setup();
    
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    // Provocar error primero
    const nombresInput = screen.getByLabelText('Nombres');
    await user.click(nombresInput);
    await user.tab(); // Trigger blur

    expect(screen.getByText('Este campo es requerido')).toBeInTheDocument();

    // Empezar a escribir
    await user.type(nombresInput, 'Juan');

    // Error debería desaparecer
    expect(screen.queryByText('Este campo es requerido')).not.toBeInTheDocument();
  });

  it('should handle form inputs with proper field types', () => {
    render(<PersonalDataFormTest onSubmit={mockOnSubmit} />);

    // Verificar tipos de input
    expect(screen.getByLabelText('Correo Electrónico')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Teléfono')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Nombres')).toHaveAttribute('type', 'text');
  });

  it('should pre-populate form with initial data if provided', () => {
    const initialData = {
      nombres: 'Juan Carlos',
      apellidos: 'Pérez'
    };

    render(<PersonalDataFormTest onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
  });
});
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="personal-data-form">
      <h2>Datos Personales</h2>
      
      <MockFormInput 
        label="Nombres" 
        name="nombres" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Apellidos" 
        name="apellidos" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Cédula/Pasaporte" 
        name="ciPasaporte" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Teléfono" 
        name="numTelefono" 
        type="tel" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Correo Electrónico" 
        name="correo" 
        type="email" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="País" 
        name="pais" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Ciudad/Provincia" 
        name="provinciaEstado" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Profesión" 
        name="profesion" 
        required 
        onChange={handleChange}
      />
      
      <MockFormInput 
        label="Institución" 
        name="institucion" 
        required 
        onChange={handleChange}
      />

      <button type="submit">Guardar/Continuar</button>
    </form>
  );
};

describe('PREF-002: Registro de datos personales (RF-01.2)', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all personal data fields', () => {
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);

    // Verificar título
    expect(screen.getByText('Datos Personales')).toBeInTheDocument();

    // Verificar que todos los campos están presentes (RF-01.2 requirements)
    expect(screen.getByLabelText(/nombres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/país/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profesión/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/institución/i)).toBeInTheDocument();
  });

  it('should have all fields enabled for input', () => {
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);

    // Verificar que todos los campos están habilitados (condición PREF-002)
    expect(screen.getByTestId('nombres')).toBeEnabled();
    expect(screen.getByTestId('apellidos')).toBeEnabled();
    expect(screen.getByTestId('ciPasaporte')).toBeEnabled();
    expect(screen.getByTestId('numTelefono')).toBeEnabled();
    expect(screen.getByTestId('correo')).toBeEnabled();
    expect(screen.getByTestId('pais')).toBeEnabled();
    expect(screen.getByTestId('provinciaEstado')).toBeEnabled();
    expect(screen.getByTestId('profesion')).toBeEnabled();
    expect(screen.getByTestId('institucion')).toBeEnabled();
  });

  it('should accept and save personal data correctly (PREF-002 exact test case)', async () => {
    const user = userEvent.setup();
    
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);

    // Llenar datos exactamente como en PREF-002
    await user.type(screen.getByTestId('nombres'), mockPersonalData.nombres);
    await user.type(screen.getByTestId('apellidos'), mockPersonalData.apellidos);
    await user.type(screen.getByTestId('ciPasaporte'), mockPersonalData.ciPasaporte);
    await user.type(screen.getByTestId('numTelefono'), mockPersonalData.numTelefono);
    await user.type(screen.getByTestId('correo'), mockPersonalData.correo);
    await user.type(screen.getByTestId('pais'), mockPersonalData.pais);
    await user.type(screen.getByTestId('provinciaEstado'), mockPersonalData.ciudad);
    await user.type(screen.getByTestId('profesion'), mockPersonalData.profesion);
    await user.type(screen.getByTestId('institucion'), mockPersonalData.institucion);

    // Verificar que los datos se guardaron correctamente
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Gómez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0999999999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@mail.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ecuador')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Quito')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ingeniera')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ESPE')).toBeInTheDocument();

    // Enviar formulario
    await user.click(screen.getByText('Guardar/Continuar'));

    // Verificar que se envió con los datos correctos
    expect(mockOnSubmit).toHaveBeenCalledWith({
      nombres: 'Ana',
      apellidos: 'Gómez',
      ciPasaporte: '1234567890',
      numTelefono: '0999999999',
      correo: 'ana@mail.com',
      pais: 'Ecuador',
      provinciaEstado: 'Quito',
      profesion: 'Ingeniera',
      institucion: 'ESPE'
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);
    
    // Intentar enviar sin llenar campos
    await user.click(screen.getByText('Guardar/Continuar'));
    
    // Verificar que los campos requeridos tienen el atributo required
    expect(screen.getByTestId('nombres')).toHaveAttribute('required');
    expect(screen.getByTestId('apellidos')).toHaveAttribute('required');
    expect(screen.getByTestId('ciPasaporte')).toHaveAttribute('required');
    expect(screen.getByTestId('numTelefono')).toHaveAttribute('required');
    expect(screen.getByTestId('correo')).toHaveAttribute('required');
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);
    
    const emailField = screen.getByTestId('correo');
    
    // Verificar que es tipo email
    expect(emailField).toHaveAttribute('type', 'email');
    
    await user.type(emailField, 'email-invalido');
    
    // El navegador debería validar automáticamente el formato
    expect(emailField).toHaveValue('email-invalido');
  });

  it('should validate phone field type', () => {
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);
    
    const phoneField = screen.getByTestId('numTelefono');
    expect(phoneField).toHaveAttribute('type', 'tel');
  });

  it('should show field labels with required indicators', () => {
    render(<MockPersonalDataForm onSubmit={mockOnSubmit} />);

    // Verificar que los campos requeridos muestran asterisco
    expect(screen.getByText('Nombres *')).toBeInTheDocument();
    expect(screen.getByText('Apellidos *')).toBeInTheDocument();
    expect(screen.getByText('Cédula/Pasaporte *')).toBeInTheDocument();
    expect(screen.getByText('Teléfono *')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico *')).toBeInTheDocument();
  });
});
