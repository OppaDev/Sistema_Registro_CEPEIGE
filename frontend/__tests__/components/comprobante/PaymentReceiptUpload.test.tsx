import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PaymentReceiptUpload } from '@/views/components/PaymentReceiptUpload';
import { PaymentReceipt, PaymentFieldErrors } from '@/models/payment';
import { mockValidFiles, mockInvalidFiles } from '../../fixtures/mockData';

describe('PREF-004: Subir comprobante de pago (RF-01.4)', () => {
  const mockOnFileChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnBack = jest.fn();

  const mockPaymentData: PaymentReceipt = {
    bankTransferNumber: '',
    paymentDate: '',
    file: null
  };

  const mockPaymentErrors: PaymentFieldErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (paymentData = mockPaymentData, paymentErrors = mockPaymentErrors) => {
    return render(
      <PaymentReceiptUpload 
        paymentData={paymentData}
        paymentErrors={paymentErrors}
        isSubmitting={false}
        onFileChange={mockOnFileChange}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );
  };

  const getFileInput = () => {
    return document.querySelector('input[type="file"]') as HTMLInputElement;
  };

  it('should render file upload section', () => {
    render(
      <PaymentReceiptUpload 
        paymentData={mockPaymentData}
        paymentErrors={mockPaymentErrors}
        isSubmitting={false}
        onFileChange={mockOnFileChange}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );
    
    expect(screen.getAllByText(/comprobante de pago/i)).toHaveLength(2);
    expect(screen.getByText(/subir comprobante/i)).toBeInTheDocument();
    expect(screen.getByText(/arrastra tu comprobante aquí/i)).toBeInTheDocument();
    expect(screen.getByText(/formatos permitidos: PNG, JPG, JPEG, PDF/i)).toBeInTheDocument();
  });

  it('should accept valid PDF file (PREF-004 exact test case)', async () => {
    const user = userEvent.setup();
    
    renderComponent();
    
    const fileInput = getFileInput();
    const validPdf = mockValidFiles.pdf();
    
    // Usar el archivo exacto del caso de prueba PREF-004
    await user.upload(fileInput, validPdf);
    
    // Verificar que el archivo se procesó correctamente
    expect(mockOnFileChange).toHaveBeenCalledWith(validPdf);
  });

  it('should accept PNG files', async () => {
    const user = userEvent.setup();
    
    renderComponent();
    
    const fileInput = getFileInput();
    const validPng = mockValidFiles.png();
    
    await user.upload(fileInput, validPng);
    
    expect(mockOnFileChange).toHaveBeenCalledWith(validPng);
  });

  it('should accept JPG files', async () => {
    const user = userEvent.setup();
    
    renderComponent();
    
    const fileInput = getFileInput();
    const validJpg = mockValidFiles.jpg();
    
    await user.upload(fileInput, validJpg);
    
    expect(mockOnFileChange).toHaveBeenCalledWith(validJpg);
  });

  it('should show file preview after successful upload (PREF-004 requirement)', async () => {
    const user = userEvent.setup();
    
    const paymentDataWithFile = {
      ...mockPaymentData,
      file: mockValidFiles.pdf()
    };
    
    renderComponent(paymentDataWithFile);
    
    // Verificar que aparece preview completo
    expect(screen.getByText('comprobante_pago.pdf')).toBeInTheDocument();
    expect(screen.getByText(/KB|MB/)).toBeInTheDocument(); // Tamaño del archivo
  });

  it('should be visible for counter review (PREF-004 requirement)', async () => {
    const paymentDataWithFile = {
      ...mockPaymentData,
      file: mockValidFiles.pdf()
    };
    
    renderComponent(paymentDataWithFile);
    
    // Verificar que el archivo está disponible para revisión
    expect(screen.getByText(/comprobante_pago\.pdf/)).toBeInTheDocument();
  });

  it('should have correct file input attributes', () => {
    renderComponent();
    
    const fileInput = getFileInput();
    
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.png,.jpg,.jpeg,.pdf');
  });

  it('should display upload area when no file selected', () => {
    renderComponent();
    
    expect(screen.getByText(/arrastra tu comprobante aquí/i)).toBeInTheDocument();
    expect(screen.getByText(/selecciona un archivo/i)).toBeInTheDocument();
    expect(screen.getByText(/formatos permitidos: PNG, JPG, JPEG, PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/tamaño máximo: 5MB/i)).toBeInTheDocument();
  });

  it('should show file preview when file is selected', () => {
    const paymentDataWithFile = {
      ...mockPaymentData,
      file: mockValidFiles.pdf()
    };
    
    renderComponent(paymentDataWithFile);
    
    // Verificar que NO aparece el área de upload
    expect(screen.queryByText(/arrastra tu comprobante aquí/i)).not.toBeInTheDocument();
    
    // Verificar que SÍ aparece el preview
    expect(screen.getByText('comprobante_pago.pdf')).toBeInTheDocument();
  });

  it('should handle multiple file selection attempts', async () => {
    const user = userEvent.setup();
    
    renderComponent();
    
    const fileInput = getFileInput();
    
    // Subir primer archivo
    const validPdf = mockValidFiles.pdf();
    await user.upload(fileInput, validPdf);
    expect(mockOnFileChange).toHaveBeenCalledWith(validPdf);
    
    // Subir segundo archivo (debería reemplazar al primero)
    const validPng = mockValidFiles.png();
    await user.upload(fileInput, validPng);
    expect(mockOnFileChange).toHaveBeenCalledWith(validPng);
    
    // Verificar que se llamó dos veces
    expect(mockOnFileChange).toHaveBeenCalledTimes(2);
  });

  it('should show error when file has error', () => {
    const paymentErrorsWithError: PaymentFieldErrors = {
      file: 'Solo se permiten archivos PNG, JPG o PDF'
    };
    
    renderComponent(mockPaymentData, paymentErrorsWithError);
    
    // Verificar que se muestra el mensaje de error
    expect(screen.getByText('Solo se permiten archivos PNG, JPG o PDF')).toBeInTheDocument();
  });
});
