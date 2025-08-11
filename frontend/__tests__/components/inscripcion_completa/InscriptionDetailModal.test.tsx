// __tests__/components/inscripcion_completa/InscriptionDetailModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InscriptionDetailModal } from '@/views/components/inscripcion_completa/InscriptionDetailModal';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
import { mockInscription } from '@/__tests__/fixtures/mockData';

// Mock del servicio
jest.mock('@/services/inscripcion_completa/inscriptionService', () => ({
  inscriptionService: {
    getReceiptFile: jest.fn(),
    getStatusBadge: jest.fn(() => ({
      color: 'text-yellow-700',
      text: 'PENDIENTE',
      bgColor: 'bg-yellow-100'
    })),
    formatDate: jest.fn((date) => date.toLocaleDateString())
  }
}));

// Mock para window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen
});

// Mock para document.createElement y appendChild/removeChild
const mockLinkClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockLinkClick
  }))
});

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: mockAppendChild
});

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: mockRemoveChild
});

describe('InscriptionDetailModal - Receipt Functionality', () => {
  const mockProps = {
    inscription: mockInscription,
    isOpen: true,
    onClose: jest.fn(),
    userType: 'accountant' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    mockLinkClick.mockClear();
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
  });

  describe('COMP-VER-001: Ver comprobante de pago', () => {
    it('should show receipt viewing button when receipt exists', () => {
      render(<InscriptionDetailModal {...mockProps} />);
      
      expect(screen.getByText('Ver comprobante')).toBeInTheDocument();
      expect(screen.getByText('Descargar')).toBeInTheDocument();
    });

    it('should open PDF receipts in new window', async () => {
      const pdfReceipt = {
        ...mockInscription,
        comprobante: {
          ...mockInscription.comprobante!,
          tipoArchivo: 'application/pdf'
        }
      };

      (inscriptionService.getReceiptFile as jest.Mock).mockResolvedValue('http://example.com/receipt.pdf');

      render(<InscriptionDetailModal {...mockProps} inscription={pdfReceipt} />);
      
      const viewButton = screen.getByText('Ver comprobante');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(inscriptionService.getReceiptFile).toHaveBeenCalledWith('uploads/comprobantes/comprobante_123.jpg');
        expect(mockWindowOpen).toHaveBeenCalledWith('http://example.com/receipt.pdf', '_blank');
      });
    });

    it('should open image receipts in new window', async () => {
      const imageReceipt = {
        ...mockInscription,
        comprobante: {
          ...mockInscription.comprobante!,
          tipoArchivo: 'image/jpeg'
        }
      };

      (inscriptionService.getReceiptFile as jest.Mock).mockResolvedValue('http://example.com/receipt.jpg');

      render(<InscriptionDetailModal {...mockProps} inscription={imageReceipt} />);
      
      const viewButton = screen.getByText('Ver comprobante');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(inscriptionService.getReceiptFile).toHaveBeenCalledWith('uploads/comprobantes/comprobante_123.jpg');
        expect(mockWindowOpen).toHaveBeenCalledWith('http://example.com/receipt.jpg', '_blank');
      });
    });

    it('should show loading state while viewing receipt', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('http://example.com/receipt.pdf'), 100))
      );

      render(<InscriptionDetailModal {...mockProps} />);
      
      const viewButton = screen.getByText('Ver comprobante');
      fireEvent.click(viewButton);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      expect(viewButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Ver comprobante')).toBeInTheDocument();
      });
    });

    it('should show error message when viewing fails', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<InscriptionDetailModal {...mockProps} />);
      
      const viewButton = screen.getByText('Ver comprobante');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar el comprobante. Por favor, inténtelo de nuevo.')).toBeInTheDocument();
      });
    });
  });

  describe('COMP-DESC-001: Descargar comprobante de pago', () => {
    it('should download receipt when download button is clicked', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockResolvedValue('http://example.com/receipt.pdf');

      render(<InscriptionDetailModal {...mockProps} />);
      
      const downloadButton = screen.getByText('Descargar');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(inscriptionService.getReceiptFile).toHaveBeenCalledWith('uploads/comprobantes/comprobante_123.jpg');
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(mockLinkClick).toHaveBeenCalled();
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalled();
      });
    });

    it('should show loading state while downloading', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('http://example.com/receipt.pdf'), 100))
      );

      render(<InscriptionDetailModal {...mockProps} />);
      
      const downloadButton = screen.getByText('Descargar');
      fireEvent.click(downloadButton);

      expect(screen.getByText('Descargando...')).toBeInTheDocument();
      expect(downloadButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Descargar')).toBeInTheDocument();
      });
    });

    it('should show error message when download fails', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockRejectedValue(new Error('Download failed'));

      render(<InscriptionDetailModal {...mockProps} />);
      
      const downloadButton = screen.getByText('Descargar');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Error al descargar el comprobante. Por favor, inténtelo de nuevo.')).toBeInTheDocument();
      });
    });

    it('should disable both buttons during operation', async () => {
      (inscriptionService.getReceiptFile as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('http://example.com/receipt.pdf'), 100))
      );

      render(<InscriptionDetailModal {...mockProps} />);
      
      const viewButton = screen.getByText('Ver comprobante');
      const downloadButton = screen.getByText('Descargar');
      
      fireEvent.click(viewButton);

      expect(viewButton).toBeDisabled();
      expect(downloadButton).toBeDisabled();

      await waitFor(() => {
        expect(viewButton).toBeEnabled();
        expect(downloadButton).toBeEnabled();
      });
    });
  });

  describe('COMP-SIN-001: Caso sin comprobante', () => {
    it('should show "no receipt" message when no receipt exists', () => {
      const noReceiptInscription = {
        ...mockInscription,
        comprobante: undefined
      };

      render(<InscriptionDetailModal {...mockProps} inscription={noReceiptInscription} />);
      
      expect(screen.getByText('Sin comprobante')).toBeInTheDocument();
      expect(screen.getByText('El participante no ha subido comprobante de pago')).toBeInTheDocument();
      expect(screen.queryByText('Ver comprobante')).not.toBeInTheDocument();
      expect(screen.queryByText('Descargar')).not.toBeInTheDocument();
    });
  });

  describe('COMP-MOD-001: Modal behavior', () => {
    it('should not render when modal is closed', () => {
      render(<InscriptionDetailModal {...mockProps} isOpen={false} />);
      
      expect(screen.queryByText('Detalle de Inscripción')).not.toBeInTheDocument();
    });

    it('should not render when no inscription provided', () => {
      render(<InscriptionDetailModal {...mockProps} inscription={null} />);
      
      expect(screen.queryByText('Detalle de Inscripción')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(<InscriptionDetailModal {...mockProps} />);
      
      const closeButtons = screen.getAllByRole('button');
      const headerCloseButton = closeButtons.find(button => 
        button.querySelector('svg') && button.closest('.border-b')
      );
      
      if (headerCloseButton) {
        fireEvent.click(headerCloseButton);
        expect(mockProps.onClose).toHaveBeenCalled();
      }
    });
  });
});
