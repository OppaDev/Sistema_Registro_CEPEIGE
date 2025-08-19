// views/components/validarPago/PaymentValidationSection.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { CreateFacturaData } from '@/models/validarPago/factura';
import { useFacturaController } from '@/controllers/validarPago/useFacturaController';
import { FiscalDataForm } from './FiscalDataForm';
import { CheckCircle, Clock, Receipt, AlertCircle, Eye, Download } from 'lucide-react';

interface PaymentValidationSectionProps {
  inscription: InscriptionData;
  userType: 'admin' | 'accountant';
  onPaymentValidated?: () => void;
}

export const PaymentValidationSection: React.FC<PaymentValidationSectionProps> = ({
  inscription,
  userType,
  onPaymentValidated
}) => {
  const {
    factura,
    loading,
    error,
    isCreating,
    isValidatingPayment,
    createFactura,
    getFacturaByInscripcion,
    verificarPago,
    clearError,
    resetFactura
  } = useFacturaController();

  const [showFiscalForm, setShowFiscalForm] = useState(false);
  const [validationStep, setValidationStep] = useState<'pending' | 'creating_invoice' | 'ready_to_validate' | 'validated'>('pending');

  // Cargar factura existente al montar el componente
  useEffect(() => {
    const loadExistingFactura = async () => {
      await getFacturaByInscripcion(inscription.idInscripcion);
    };
    
    loadExistingFactura();
    return () => {
      resetFactura();
    };
  }, [inscription.idInscripcion, getFacturaByInscripcion, resetFactura]);

  // Determinar el paso de validación basado en la factura existente
  useEffect(() => {
    if (factura) {
      if (factura.verificacionPago) {
        setValidationStep('validated');
      } else {
        setValidationStep('ready_to_validate');
      }
      setShowFiscalForm(false);
    } else {
      setValidationStep('pending');
    }
  }, [factura]);

  const handleCreateFactura = async (fiscalData: CreateFacturaData) => {
    const result = await createFactura(fiscalData);
    if (result) {
      setShowFiscalForm(false);
      setValidationStep('ready_to_validate');
    }
  };

  const handleValidatePayment = async () => {
    if (factura) {
      const success = await verificarPago(factura.idFactura);
      if (success) {
        setValidationStep('validated');
        onPaymentValidated?.();
      }
    }
  };

  const getValidationStatusBadge = () => {
    switch (validationStep) {
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente de Validación
          </Badge>
        );
      case 'creating_invoice':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Receipt className="h-3 w-3 mr-1" />
            Creando Factura
          </Badge>
        );
      case 'ready_to_validate':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Listo para Validar
          </Badge>
        );
      case 'validated':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validado
          </Badge>
        );
      default:
        return null;
    }
  };

  const canShowFiscalForm = userType === 'accountant' && !factura && inscription.comprobante;
  const canValidatePayment = userType === 'accountant' && factura && !factura.verificacionPago;

  return (
    <Card className="w-full">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center justify-between text-lg text-green-700">
          <span className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Validación de Pago
          </span>
          {getValidationStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Información del comprobante */}
        {inscription.comprobante ? (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">📄</div>
              <div>
                <p className="font-medium text-gray-900">
                  {inscription.comprobante?.nombreArchivo || 'Archivo sin nombre'}
                </p>
                <p className="text-sm text-gray-600">
                  Subido: {inscription.comprobante?.fechaSubida ? new Date(inscription.comprobante.fechaSubida).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-600"
                onClick={() => {
                  if (!inscription.comprobante?.nombreArchivo) return;
                  const directUrl = `http://localhost:3001/uploads/comprobantes/${inscription.comprobante.nombreArchivo}`;
                  window.open(directUrl, '_blank');
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600"
                onClick={async () => {
                  if (!inscription.comprobante?.nombreArchivo) return;
                  
                  try {
                    const directUrl = `http://localhost:3001/uploads/comprobantes/${inscription.comprobante.nombreArchivo}`;
                    
                    // Fetch del archivo como blob
                    const response = await fetch(directUrl);
                    if (!response.ok) {
                      throw new Error('Error al descargar el archivo');
                    }
                    
                    const blob = await response.blob();
                    
                    // Crear URL object y enlace de descarga
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = inscription.comprobante.nombreArchivo;
                    
                    // Trigger automático de descarga
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Limpiar URL object
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error al descargar:', error);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            </div>
          </div>
        ) : (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>No hay comprobante de pago.</strong> El participante debe subir su comprobante antes de poder validar el pago.
            </AlertDescription>
          </Alert>
        )}

        {/* Información de la factura existente */}
        {factura && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">Información de la Factura</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Número de Factura:</span>
                <p className="text-gray-900 font-mono">{factura.numeroFactura}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Número de Ingreso:</span>
                <p className="text-gray-900 font-mono">{factura.numeroIngreso}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Valor Pagado:</span>
                <p className="text-gray-900 font-semibold">${Number(factura.valorPagado || 0).toFixed(2)} USD</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estado de Verificación:</span>
                <p className={`font-semibold ${factura.verificacionPago ? 'text-green-600' : 'text-orange-600'}`}>
                  {factura.verificacionPago ? '✅ Verificado' : '⏳ Pendiente'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de datos fiscales */}
        {showFiscalForm && canShowFiscalForm && (
          <FiscalDataForm
            inscripcionId={inscription.idInscripcion}
            facturacionId={inscription.facturacion.idFacturacion}
            coursePrecio={inscription.curso.precio}
            onSubmit={handleCreateFactura}
            isSubmitting={isCreating}
            error={error}
          />
        )}

        {/* Acciones del contador */}
        {userType === 'accountant' && (
          <div className="flex flex-col space-y-3">
            {/* Paso 1: Crear factura */}
            {canShowFiscalForm && !showFiscalForm && (
              <Button
                onClick={() => {
                  clearError();
                  setShowFiscalForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Agregar Datos Fiscales y Generar Factura
              </Button>
            )}

            {/* Paso 2: Validar pago */}
            {canValidatePayment && (
              <div className="space-y-3">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Paso final:</strong> Revise los datos fiscales y el comprobante de pago. Una vez que valide el pago, 
                    el participante pasará a estado &quot;Validado&quot; y el administrador podrá proceder con descuentos y matrícula.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={handleValidatePayment}
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  disabled={isValidatingPayment}
                >
                  {isValidatingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validando Pago...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validar Pago
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Estado validado */}
            {validationStep === 'validated' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Pago validado exitosamente.</strong> El participante ahora está en estado &quot;Validado&quot; 
                  y el administrador puede proceder con la gestión de descuentos y matrícula.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Información para administrador */}
        {userType === 'admin' && (
          <div className="space-y-3">
            {validationStep !== 'validated' && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Información para Admin:</strong> Antes de gestionar descuentos y matrícula, 
                  el contador debe validar el pago de este participante.
                </AlertDescription>
              </Alert>
            )}
            
            {validationStep === 'validated' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Pago validado por el contador.</strong> Ahora puede proceder con la gestión 
                  de descuentos y activar la matrícula del participante.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};