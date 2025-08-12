// views/components/validarPago/PaymentValidationFlow.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { useFacturaController } from '@/controllers/validarPago/useFacturaController';
import { FiscalInformationForm } from './FiscalInformationForm';
import { FacturaStatusCard } from './FacturaStatusCard';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { Factura } from '@/models/validarPago/factura';

interface PaymentValidationFlowProps {
  inscription: InscriptionData;
  userType: 'admin' | 'accountant';
  onValidationSuccess: () => void;
}

type FlowStep = 'CHECKING' | 'NEEDS_VALIDATION' | 'NEEDS_FISCAL_INFO' | 'COMPLETED';

export const PaymentValidationFlow: React.FC<PaymentValidationFlowProps> = ({
  inscription,
  userType,
  onValidationSuccess
}) => {
  // Controller
  const facturaController = useFacturaController();
  
  // Estados
  const [currentStep, setCurrentStep] = useState<FlowStep>('CHECKING');
  const [factura, setFactura] = useState<Factura | null>(null);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verificar estado inicial al montar el componente
  useEffect(() => {
    checkInitialState();
  }, [inscription.idInscripcion]);

  const checkInitialState = async () => {
    try {
      setCurrentStep('CHECKING');
      setValidationMessage(null);

      console.log('🔍 Verificando estado inicial para inscripción:', inscription.idInscripcion);

      // Limpiar estado previo del controlador
      facturaController.clearFactura();
      
      // Buscar factura existente
      const success = await facturaController.getFacturasByInscripcionId(inscription.idInscripcion);
      
      console.log('📊 Resultado búsqueda facturas:', {
        success,
        factura: facturaController.state.factura,
        facturas: facturaController.state.facturas,
        arrayLength: facturaController.state.facturas?.length,
        hasFactura: !!facturaController.state.factura
      });
      
      if (success) {
        // Verificar si hay facturas en el array
        const facturas = facturaController.state.facturas;
        
        if (facturas && Array.isArray(facturas) && facturas.length > 0) {
          // Hay facturas, usar la primera
          const existingFactura = facturas[0];
          setFactura(existingFactura);
          console.log('📄 Factura existente encontrada:', {
            id: existingFactura.idFactura,
            inscripcionId: existingFactura.idInscripcion,
            verificacionPago: existingFactura.verificacionPago,
            numeroFactura: existingFactura.numeroFactura,
            numeroIngreso: existingFactura.numeroIngreso
          });

          if (existingFactura.verificacionPago) {
            // Ya está verificado, revisar si necesita actualización fiscal
            const needsUpdate = facturaController.validateTemporaryNumber(existingFactura.numeroFactura) ||
                                facturaController.validateTemporaryNumber(existingFactura.numeroIngreso);
            
            console.log('✅ Pago ya verificado, necesita actualización fiscal?', needsUpdate);
            
            if (needsUpdate) {
              setCurrentStep('NEEDS_FISCAL_INFO');
            } else {
              setCurrentStep('COMPLETED');
            }
          } else {
            console.log('⏳ Pago pendiente de verificación');
            setCurrentStep('NEEDS_VALIDATION');
          }
          return; // IMPORTANTE: Salir aquí para evitar continuar
        } 
        
        // Si llegamos aquí, verificar si hay una factura individual
        if (facturaController.state.factura) {
          const existingFactura = facturaController.state.factura;
          setFactura(existingFactura);
          console.log('📄 Factura individual encontrada:', existingFactura);

          if (existingFactura.verificacionPago) {
            const needsUpdate = facturaController.validateTemporaryNumber(existingFactura.numeroFactura) ||
                                facturaController.validateTemporaryNumber(existingFactura.numeroIngreso);
            
            if (needsUpdate) {
              setCurrentStep('NEEDS_FISCAL_INFO');
            } else {
              setCurrentStep('COMPLETED');
            }
          } else {
            setCurrentStep('NEEDS_VALIDATION');
          }
          return; // IMPORTANTE: Salir aquí para evitar continuar
        }
      }
      
      // Si llegamos aquí, no hay facturas existentes
      console.log('🆕 No se encontraron facturas existentes, se creará una nueva');
      setCurrentStep('NEEDS_VALIDATION');
      
    } catch (error: any) {
      console.error('❌ Error checking initial state:', error);
      // En caso de error, permitir creación de nueva factura
      console.log('🆕 Error en verificación, permitiendo creación de nueva factura');
      setCurrentStep('NEEDS_VALIDATION');
      setValidationMessage({
        type: 'error',
        text: error.message || 'Error al verificar estado inicial'
      });
    }
  };

  const handleValidatePayment = async () => {
    try {
      setValidationMessage(null);
      console.log('🔄 Iniciando validación de pago...');

      // NUEVA VERIFICACIÓN: Buscar facturas existentes ANTES de intentar crear
      console.log('🔍 Re-verificando facturas existentes antes de crear...');
      const reCheckSuccess = await facturaController.getFacturasByInscripcionId(inscription.idInscripcion);
      
      if (reCheckSuccess && facturaController.state.facturas && facturaController.state.facturas.length > 0) {
        const existingFactura = facturaController.state.facturas[0];
        setFactura(existingFactura);
        console.log('✅ Factura existente encontrada en re-verificación:', existingFactura);
        
        // Si ya está verificada, ir directo a fiscal info
        if (existingFactura.verificacionPago) {
          console.log('✅ Factura ya verificada, mostrando campos fiscales');
          setCurrentStep('NEEDS_FISCAL_INFO');
          return;
        }
        
        // Si no está verificada, continuar con verificación
        const verifySuccess = await facturaController.verificarPago(existingFactura.idFactura);
        if (verifySuccess) {
          const updatedFactura = facturaController.state.factura;
          setFactura(updatedFactura);
          setValidationMessage({
            type: 'success',
            text: 'Pago verificado exitosamente'
          });
          setCurrentStep('NEEDS_FISCAL_INFO');
        } else {
          setValidationMessage({
            type: 'error',
            text: facturaController.state.error || 'Error al verificar pago'
          });
        }
        return;
      }

      // Solo crear factura temporal si realmente no existe ninguna
      let currentFactura = factura;
      
      if (!currentFactura) {
        console.log('🆕 No hay factura después de re-verificación, creando una temporal con verificación...');
        
        // Crear factura temporal inicialmente NO verificada
        const tempNumbers = facturaController.generateTemporaryNumbers(inscription.idInscripcion);
        const createSuccess = await facturaController.createFactura({
          idInscripcion: inscription.idInscripcion,
          idFacturacion: inscription.facturacion.idFacturacion,
          valorPagado: 0, // Valor temporal, el contador lo completará
          numeroIngreso: tempNumbers.numeroIngreso,
          numeroFactura: tempNumbers.numeroFactura
        });

        if (!createSuccess) {
          console.error('❌ Error al crear factura temporal:', facturaController.state.error);
          setValidationMessage({
            type: 'error',
            text: facturaController.state.error || 'Error al crear factura temporal'
          });
          return;
        }

        // Actualizar tanto el estado local como el del componente
        currentFactura = facturaController.state.factura;
        setFactura(currentFactura);
        console.log('✅ Factura temporal creada exitosamente:', currentFactura);
      } else {
        console.log('✅ Usando factura existente:', currentFactura);
      }

      // Verificar el pago
      const facturaId = currentFactura?.idFactura;
      console.log('🔍 ID de factura para verificación:', facturaId);
      
      if (!facturaId) {
        console.error('❌ No se pudo obtener el ID de la factura', {
          currentFactura,
          controllerFactura: facturaController.state.factura
        });
        setValidationMessage({
          type: 'error',
          text: 'No se pudo obtener el ID de la factura'
        });
        return;
      }

      // Si la factura ya está verificada, ir directamente al siguiente paso
      if (currentFactura && currentFactura.verificacionPago) {
        console.log('✅ Factura ya está verificada, pasando a información fiscal');
        setValidationMessage({
          type: 'success',
          text: 'Pago ya verificado - Completar información fiscal'
        });
        setCurrentStep('NEEDS_FISCAL_INFO');
        return;
      }

      console.log('⏳ Verificando pago...');
      const verifySuccess = await facturaController.verificarPago(facturaId);
      
      if (verifySuccess) {
        // Actualizar factura con el estado verificado
        const updatedFactura = facturaController.state.factura;
        setFactura(updatedFactura);
        console.log('✅ Pago verificado exitosamente:', updatedFactura);
        
        setValidationMessage({
          type: 'success',
          text: 'Pago verificado exitosamente'
        });
        setCurrentStep('NEEDS_FISCAL_INFO');
      } else {
        console.error('❌ Error al verificar pago:', facturaController.state.error);
        setValidationMessage({
          type: 'error',
          text: facturaController.state.error || 'Error al verificar pago'
        });
      }
    } catch (error: any) {
      console.error('❌ Error en validación de pago:', error);
      setValidationMessage({
        type: 'error',
        text: error.message || 'Error al validar pago'
      });
    }
  };

  const handleFiscalInfoSaved = () => {
    setValidationMessage({
      type: 'success',
      text: 'Información fiscal guardada exitosamente'
    });
    setCurrentStep('COMPLETED');
    onValidationSuccess();
  };

  // Verificar si puede validar pago - SOLO el contador
  const canValidatePayment = userType === 'accountant' && 
                            inscription.estado === 'PENDIENTE' &&
                            inscription.comprobante;

  // Renderizar contenido según el paso actual
  const renderContent = () => {
    switch (currentStep) {
      case 'CHECKING':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Verificando estado de facturación...</p>
            </div>
          </div>
        );

      case 'NEEDS_VALIDATION':
        if (userType === 'admin') {
          // ADMIN: No puede validar pagos, solo mostrar estado
          return (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Validación Pendiente - Administrador
                </h4>
                <p className="text-sm text-orange-700 mb-4">
                  Este pago está pendiente de validación por parte del contador. Como administrador, no puedes validar pagos.
                </p>
                <Alert className="border-orange-200 bg-orange-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-orange-800">
                    ⏳ Esperando validación del contador. Una vez validado, podrás registrar descuentos si es necesario.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          );
        } else {
          // CONTADOR: Puede validar pagos
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Validación de Pago - Contador
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Como contador, puedes validar este pago después de revisar el comprobante.
                </p>
                
                {canValidatePayment ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleValidatePayment}
                      disabled={facturaController.state.loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{facturaController.state.loading ? 'Validando...' : 'Validar Pago'}</span>
                    </Button>
                  </div>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-orange-800">
                      {!inscription.comprobante 
                        ? 'No se puede validar el pago sin comprobante. Contacta al participante para que suba su comprobante.'
                        : 'No se puede validar este pago. Verifica que la inscripción esté en estado pendiente.'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          );
        }

      case 'NEEDS_FISCAL_INFO':
        return factura ? (
          <div className="space-y-6">
            <FacturaStatusCard factura={factura} />
            <FiscalInformationForm
              inscripcionId={inscription.idInscripcion}
              factura={factura}
              userType={userType}
              onSaveSuccess={handleFiscalInfoSaved}
            />
          </div>
        ) : null;

      case 'COMPLETED':
        return factura ? (
          <div className="space-y-4">
            <FacturaStatusCard factura={factura} />
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800 font-medium">
                ✅ Proceso de validación completado. El pago ha sido verificado y la información fiscal está completa.
              </AlertDescription>
            </Alert>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Mensaje de estado */}
      {validationMessage && (
        <Alert className={`mb-4 ${validationMessage.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <AlertDescription className={`font-medium ${
            validationMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {validationMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
};