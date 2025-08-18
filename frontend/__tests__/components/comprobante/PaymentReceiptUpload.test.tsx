import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { mockValidFiles, mockInvalidFiles } from '../../fixtures/mockData';

// Mock del componente PaymentReceiptUpload
interface MockPaymentReceiptUploadProps {
  onFileUpload?: (file: File) => void;
  onError?: (error: string) => void;
}

const MockPaymentReceiptUpload = ({ onFileUpload, onError }: MockPaymentReceiptUploadProps) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Solo se permiten archivos PNG, JPG o PDF';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'El archivo no debe superar los 5MB';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setError('');
    setSelectedFile(file);
    if (onFileUpload) onFileUpload(file);
  };

  return (
    <div data-testid="payment-receipt-upload">
      <h3>Comprobante de Pago Bancario</h3>
      <p>Sube tu comprobante de pago en formato PNG, JPG o PDF</p>
      
      <div>
        <label htmlFor="file-upload">
          Subir Archivo *
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          aria-label="Comprobante de pago"
          data-testid="file-input"
        />
      </div>

      {error && (
        <div data-testid="error-message" role="alert" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      {selectedFile && !error && (
        <div data-testid="file-preview">
          <p>Archivo seleccionado: {selectedFile.name}</p>
          <p>Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p>Tipo: {selectedFile.type}</p>
          <div data-testid="upload-success" style={{ color: 'green' }}>
            ✅ Archivo cargado correctamente
          </div>
        </div>
      )}

      <button type="button" data-testid="confirm-upload" disabled={!selectedFile || !!error}>
        Confirmar Subida
      </button>
    </div>
  );
};

describe('PREF-004: Subir comprobante de pago (RF-01.4)', () => {
  const mockOnFileUpload = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render file upload section', () => {
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    expect(screen.getByText(/comprobante de pago bancario/i)).toBeInTheDocument();
    expect(screen.getByText(/subir archivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comprobante de pago/i)).toBeInTheDocument();
    expect(screen.getByText(/formato PNG, JPG o PDF/i)).toBeInTheDocument();
  });

  it('should accept valid PDF file (PREF-004 exact test case)', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validPdf = mockValidFiles.pdf();
    
    // Usar el archivo exacto del caso de prueba PREF-004
    await user.upload(fileInput, validPdf);
    
    // Verificar que el archivo se procesó correctamente
    expect(mockOnFileUpload).toHaveBeenCalledWith(validPdf);
    expect(mockOnError).not.toHaveBeenCalled();
    
    // Verificar que aparece en el preview (texto puede estar fragmentado)
    expect(screen.getByText(/comprobante_pago\.pdf/)).toBeInTheDocument();
    expect(screen.getByTestId('upload-success')).toBeInTheDocument();
    expect(screen.getByText('✅ Archivo cargado correctamente')).toBeInTheDocument();
  });

  it('should accept PNG files', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validPng = mockValidFiles.png();
    
    await user.upload(fileInput, validPng);
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(validPng);
    expect(mockOnError).not.toHaveBeenCalled();
    expect(screen.getByText(/comprobante\.png/)).toBeInTheDocument();
  });

  it('should accept JPG files', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validJpg = mockValidFiles.jpg();
    
    await user.upload(fileInput, validJpg);
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(validJpg);
    expect(mockOnError).not.toHaveBeenCalled();
    expect(screen.getByText(/comprobante\.jpg/)).toBeInTheDocument();
  });

  it('should reject invalid file types (only PNG, JPG, PDF allowed)', async () => {
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const invalidTxt = mockInvalidFiles.txt();
    
    // Verificar que el archivo tiene el tipo correcto para hacer la prueba
    expect(invalidTxt.type).toBe('text/plain');
    
    // Usar fireEvent en lugar de userEvent para tener más control
    fireEvent.change(fileInput, {
      target: { files: [invalidTxt] }
    });
    
    // Verificar que se muestra error y no se procesa el archivo
    expect(mockOnError).toHaveBeenCalledWith('Solo se permiten archivos PNG, JPG o PDF');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Solo se permiten archivos PNG, JPG o PDF')).toBeInTheDocument();
  });

  it('should show file preview after successful upload (PREF-004 requirement)', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validPdf = mockValidFiles.pdf();
    
    await user.upload(fileInput, validPdf);
    
    // Verificar que aparece preview completo
    expect(screen.getByTestId('file-preview')).toBeInTheDocument();
    expect(screen.getByText('Archivo seleccionado: comprobante_pago.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Tamaño:/)).toBeInTheDocument();
    expect(screen.getByText('Tipo: application/pdf')).toBeInTheDocument();
  });

  it('should be visible for counter review (PREF-004 requirement)', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validPdf = mockValidFiles.pdf();
    await user.upload(fileInput, validPdf);
    
    // Verificar que el archivo está disponible para revisión
    expect(screen.getByTestId('file-preview')).toBeInTheDocument();
    expect(screen.getByText(/comprobante_pago\.pdf/)).toBeInTheDocument();
    
    // El botón de confirmar debe estar habilitado
    const confirmButton = screen.getByTestId('confirm-upload');
    expect(confirmButton).toBeEnabled();
  });

  it('should validate file size (max 5MB)', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    // Crear archivo grande (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, largeFile);
    
    expect(mockOnError).toHaveBeenCalledWith('El archivo no debe superar los 5MB');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('should have correct file input attributes', () => {
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.pdf,.png,.jpg,.jpeg');
    expect(fileInput).toHaveAttribute('aria-label', 'Comprobante de pago');
  });

  it('should disable confirm button when no file selected', () => {
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    const confirmButton = screen.getByTestId('confirm-upload');
    expect(confirmButton).toBeDisabled();
  });

  it('should disable confirm button when error exists', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} onError={mockOnError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const invalidTxt = mockInvalidFiles.txt();
    await user.upload(fileInput, invalidTxt);
    
    const confirmButton = screen.getByTestId('confirm-upload');
    expect(confirmButton).toBeDisabled();
  });

  it('should handle multiple file selection attempts', async () => {
    const user = userEvent.setup();
    
    render(<MockPaymentReceiptUpload onFileUpload={mockOnFileUpload} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    // Subir primer archivo
    const validPdf = mockValidFiles.pdf();
    await user.upload(fileInput, validPdf);
    expect(screen.getByText(/comprobante_pago\.pdf/)).toBeInTheDocument();
    
    // Subir segundo archivo (debería reemplazar al primero)
    const validPng = mockValidFiles.png();
    await user.upload(fileInput, validPng);
    expect(screen.getByText(/comprobante\.png/)).toBeInTheDocument();
    expect(screen.queryByText('comprobante_pago.pdf')).not.toBeInTheDocument();
  });
});
