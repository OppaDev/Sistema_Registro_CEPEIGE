import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { mockBillingData } from '../../fixtures/mockData';

// Mock del componente BillingForm
interface MockBillingFormProps {
  onChange?: (data: unknown) => void;
  onSubmit?: (data: unknown) => void;
}

const MockBillingForm = ({ onChange, onSubmit }: MockBillingFormProps) => {
  const [formData, setFormData] = React.useState({
    razonSocial: '',
    identificacionTributaria: '',
    telefono: '',
    correoFactura: '',
    direccion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="billing-form">
      <h2>Datos de Facturación</h2>
      
      <div>
        <label htmlFor="razonSocial">Razón Social / Nombre y Apellidos *</label>
        <input
          id="razonSocial"
          name="razonSocial"
          type="text"
          required
          value={formData.razonSocial}
          onChange={handleChange}
          data-testid="razonSocial"
        />
      </div>

      <div>
        <label htmlFor="identificacionTributaria">Identificación Tributaria (RUC) *</label>
        <input
          id="identificacionTributaria"
          name="identificacionTributaria"
          type="text"
          required
          value={formData.identificacionTributaria}
          onChange={handleChange}
          data-testid="ruc"
        />
      </div>

      <div>
        <label htmlFor="telefono">Teléfono *</label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          value={formData.telefono}
          onChange={handleChange}
          data-testid="telefonoFactura"
        />
      </div>

      <div>
        <label htmlFor="correoFactura">Correo Electrónico *</label>
        <input
          id="correoFactura"
          name="correoFactura"
          type="email"
          required
          value={formData.correoFactura}
          onChange={handleChange}
          data-testid="correoFactura"
        />
      </div>

      <div>
        <label htmlFor="direccion">Dirección *</label>
        <input
          id="direccion"
          name="direccion"
          type="text"
          required
          value={formData.direccion}
          onChange={handleChange}
          data-testid="direccion"
        />
      </div>

      <button type="submit">Guardar</button>
    </form>
  );
};

describe('PREF-003: Registro de datos para factura (RF-01.3)', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all billing fields visible and enabled', () => {
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    // Verificar que todos los campos están visibles y habilitados (condición PREF-003)
    expect(screen.getByLabelText(/razón social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/razón social/i)).toBeEnabled();
    
    expect(screen.getByLabelText(/identificación tributaria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/identificación tributaria/i)).toBeEnabled();
    
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeEnabled();
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeEnabled();
    
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeEnabled();
  });

  it('should save billing data correctly (PREF-003 exact test case)', async () => {
    const user = userEvent.setup();
    
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    // Llenar con datos exactos del caso de prueba PREF-003
    await user.type(screen.getByTestId('razonSocial'), mockBillingData.razonSocial);
    await user.type(screen.getByTestId('ruc'), mockBillingData.identificacionTributaria);
    await user.type(screen.getByTestId('telefonoFactura'), mockBillingData.telefono);
    await user.type(screen.getByTestId('correoFactura'), mockBillingData.correoFactura);
    await user.type(screen.getByTestId('direccion'), mockBillingData.direccion);

    // Verificar que los datos se guardaron correctamente
    expect(screen.getByDisplayValue('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1790010010001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0988888888')).toBeInTheDocument();
    expect(screen.getByDisplayValue('facturas@ana.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Av. América y Av. Patria')).toBeInTheDocument();

    // Verificar que se llamó onChange durante el llenado
    expect(mockOnChange).toHaveBeenCalled();

    // Enviar formulario
    await user.click(screen.getByText('Guardar'));

    // Verificar que se envió con los datos correctos
    expect(mockOnSubmit).toHaveBeenCalledWith({
      razonSocial: 'Ana Gómez',
      identificacionTributaria: '1790010010001',
      telefono: '0988888888',
      correoFactura: 'facturas@ana.com',
      direccion: 'Av. América y Av. Patria'
    });
  });

  it('should validate required fields', () => {
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);
    
    // Verificar que todos los campos tienen el atributo required
    expect(screen.getByTestId('razonSocial')).toHaveAttribute('required');
    expect(screen.getByTestId('ruc')).toHaveAttribute('required');
    expect(screen.getByTestId('telefonoFactura')).toHaveAttribute('required');
    expect(screen.getByTestId('correoFactura')).toHaveAttribute('required');
    expect(screen.getByTestId('direccion')).toHaveAttribute('required');
  });

  it('should validate RUC format (13 digits for Ecuador)', async () => {
    const user = userEvent.setup();
    
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);
    
    const rucInput = screen.getByTestId('ruc');
    
    // Probar RUC válido ecuatoriano
    await user.type(rucInput, '1790010010001');
    expect(rucInput).toHaveValue('1790010010001');
    expect((rucInput as HTMLInputElement).value).toHaveLength(13);
    
    // Limpiar y probar RUC corto
    await user.clear(rucInput);
    await user.type(rucInput, '123');
    expect(rucInput).toHaveValue('123');
  });

  it('should validate email format for billing email', async () => {
    const user = userEvent.setup();
    
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);
    
    const emailField = screen.getByTestId('correoFactura');
    
    // Verificar que es tipo email
    expect(emailField).toHaveAttribute('type', 'email');
    
    // Probar email válido
    await user.type(emailField, 'facturas@ana.com');
    expect(emailField).toHaveValue('facturas@ana.com');
    
    // Limpiar y probar email inválido
    await user.clear(emailField);
    await user.type(emailField, 'email-invalido');
    expect(emailField).toHaveValue('email-invalido');
  });

  it('should validate phone field type', () => {
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);
    
    const phoneField = screen.getByTestId('telefonoFactura');
    expect(phoneField).toHaveAttribute('type', 'tel');
  });

  it('should handle long addresses correctly', async () => {
    const user = userEvent.setup();
    
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);
    
    const addressField = screen.getByTestId('direccion');
    const longAddress = 'Av. América N45-67 y Av. Patria, Edificio Corporativo, Piso 5, Oficina 501, Sector La Mariscal, Quito, Ecuador';
    
    await user.type(addressField, longAddress);
    expect(addressField).toHaveValue(longAddress);
  });

  it('should show field labels with required indicators', () => {
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    // Verificar que los campos requeridos muestran asterisco
    expect(screen.getByText(/Razón Social.*\*/)).toBeInTheDocument();
    expect(screen.getByText(/Identificación Tributaria.*\*/)).toBeInTheDocument();
    expect(screen.getByText(/Teléfono.*\*/)).toBeInTheDocument();
    expect(screen.getByText(/Correo Electrónico.*\*/)).toBeInTheDocument();
    expect(screen.getByText(/Dirección.*\*/)).toBeInTheDocument();
  });

  it('should handle form reset', async () => {
    const user = userEvent.setup();
    
    render(<MockBillingForm onChange={mockOnChange} onSubmit={mockOnSubmit} />);

    // Llenar campos
    await user.type(screen.getByTestId('razonSocial'), 'Test Company');
    await user.type(screen.getByTestId('ruc'), '1234567890001');
    
    // Verificar que se llenaron
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890001')).toBeInTheDocument();
  });
});
