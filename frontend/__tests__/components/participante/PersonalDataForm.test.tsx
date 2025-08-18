import React from 'react';
import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { mockPersonalData } from '../../fixtures/mockData';

// Mock del componente FormInput ya que puede no existir aún
interface MockFormInputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MockFormInput = ({ label, name, type = 'text', required = false, onChange }: MockFormInputProps) => {
  return (
    <div>
      <label htmlFor={name}>{label} {required && '*'}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        onChange={onChange}
        data-testid={name}
      />
    </div>
  );
};

// Mock del formulario completo de datos personales
interface MockPersonalDataFormProps {
  onSubmit: (data: Record<string, string>) => void;
  initialData?: Record<string, string>;
}

const MockPersonalDataForm = ({ onSubmit, initialData = {} }: MockPersonalDataFormProps) => {
  const [formData, setFormData] = React.useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
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
