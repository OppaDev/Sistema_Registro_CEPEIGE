// views/components/validarPago/FiscalInformationForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign, Save, AlertCircle } from 'lucide-react';
import { useFacturaController } from '@/controllers/validarPago/useFacturaController';
import { useDescuentoController } from '@/controllers/validarPago/useDescuentoController';
import { Factura, UpdateFacturaRequest } from '@/models/validarPago/factura';
import { DescuentoInscripcion } from '@/models/validarPago/descuento';

interface FiscalInformationFormProps {
  inscripcionId: number;
  factura: Factura;
  userType: 'admin' | 'accountant';
  onSaveSuccess: () => void;
  onCancel?: () => void;
}

export const FiscalInformationForm: React.FC<FiscalInformationFormProps> = ({
  inscripcionId,
  factura,
  userType,
  onSaveSuccess,
  onCancel
}) => {
  // Controllers
  const facturaController = useFacturaController();
  const descuentoController = useDescuentoController();

  // Estados del formulario
  const [fiscalData, setFiscalData] = useState({
    valorPagado: factura.valorPagado || 0,
    numeroIngreso: factura.numeroIngreso || '',
    numeroFactura: factura.numeroFactura || '',
    numeroEstudiantes: 0,
    cantidadDescuento: 0
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Estado de loading combinado
  const isLoading = facturaController.state.loading || descuentoController.state.loading;

  // Limpiar errores cuando cambian los datos
  useEffect(() => {
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  }, [fiscalData]);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validaciones para contador (información fiscal)
    if (userType === 'accountant') {
      if (!fiscalData.valorPagado || fiscalData.valorPagado <= 0) {
        errors.push('El valor pagado debe ser mayor a 0');
      }

      if (!fiscalData.numeroIngreso.trim()) {
        errors.push('El número de ingreso es requerido');
      }

      if (!fiscalData.numeroFactura.trim()) {
        errors.push('El número de factura es requerido');
      }
    }

    // Validaciones para admin con descuentos
    if (userType === 'admin' && fiscalData.cantidadDescuento > 0) {
      if (fiscalData.numeroEstudiantes <= 0) {
        errors.push('Debe especificar el número de estudiantes para el descuento');
      }

      if (fiscalData.cantidadDescuento > factura.valorPagado) {
        errors.push('El descuento no puede ser mayor al valor pagado');
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Manejar guardado
  const handleSave = async () => {
    try {
      // Validar formulario
      if (!validateForm()) {
        return;
      }

      // Solo el contador puede crear/completar información fiscal
      if (userType === 'accountant') {
        // Verificar si tiene números temporales (significa que es una factura temporal)
        const hasTemporaryNumbers = (
          facturaController.validateTemporaryNumber(factura.numeroIngreso) ||
          facturaController.validateTemporaryNumber(factura.numeroFactura)
        );

        console.log('🔍 Verificando estado de la factura:', {
          facturaId: factura.idFactura,
          currentValues: {
            valorPagado: factura.valorPagado,
            numeroIngreso: factura.numeroIngreso,
            numeroFactura: factura.numeroFactura,
            verificacionPago: factura.verificacionPago
          },
          newValues: {
            valorPagado: fiscalData.valorPagado,
            numeroIngreso: fiscalData.numeroIngreso,
            numeroFactura: fiscalData.numeroFactura
          },
          hasTemporaryNumbers
        });

        if (hasTemporaryNumbers) {
          // Si tiene números temporales, crear una nueva factura completa
          console.log('🆕 Creando factura completa con información fiscal');
          
          const createData = {
            idInscripcion: inscripcionId,
            idFacturacion: factura.idFacturacion,
            valorPagado: fiscalData.valorPagado,
            numeroIngreso: fiscalData.numeroIngreso,
            numeroFactura: fiscalData.numeroFactura
          };

          const facturaCreated = await facturaController.createFactura(createData);

          if (!facturaCreated) {
            console.error('Error al crear factura completa');
            return;
          }
          
          console.log('✅ Factura completa creada exitosamente');
        } else {
          // Si ya es una factura real, solo actualizar si hay cambios
          const needsUpdate = (
            factura.valorPagado !== fiscalData.valorPagado ||
            factura.numeroIngreso !== fiscalData.numeroIngreso ||
            factura.numeroFactura !== fiscalData.numeroFactura
          );

          if (needsUpdate) {
            console.log('📝 Actualizando factura existente');
            
            const updateData: UpdateFacturaRequest = {
              valorPagado: fiscalData.valorPagado,
              numeroIngreso: fiscalData.numeroIngreso,
              numeroFactura: fiscalData.numeroFactura
            };

            const facturaUpdated = await facturaController.updateFactura(factura.idFactura, updateData);

            if (!facturaUpdated) {
              console.error('Error al actualizar factura');
              return;
            }
            
            console.log('✅ Factura actualizada exitosamente');
          } else {
            console.log('ℹ️ No se requiere actualización - datos ya correctos');
          }
        }
      } else {
        console.log('ℹ️ Admin - No procesa información fiscal, solo descuentos');
      }

      // 2. Si hay descuentos (solo admin), crear y aplicar descuento
      if (userType === 'admin' && fiscalData.cantidadDescuento > 0 && fiscalData.numeroEstudiantes > 0) {
        const descuentoInfo: DescuentoInscripcion = {
          numeroEstudiantes: fiscalData.numeroEstudiantes,
          cantidadDescuento: fiscalData.cantidadDescuento,
          tipoDescuento: 'GRUPAL'
        };

        const descuentoCreated = await descuentoController.createDescuentoGrupal(descuentoInfo);

        if (descuentoCreated && descuentoController.state.descuento) {
          // Aplicar descuento a la inscripción
          await descuentoController.aplicarDescuentoAInscripcion(
            inscripcionId, 
            descuentoController.state.descuento.idDescuento
          );
        }
      }

      // Notificar éxito
      onSaveSuccess();

    } catch (error: any) {
      console.error('Error saving fiscal information:', error);
      setFormErrors([error.message || 'Error al guardar información fiscal']);
    }
  };

  // Calcular monto final con descuento
  const montoFinal = fiscalData.valorPagado - (fiscalData.cantidadDescuento || 0);

  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center text-lg text-blue-900">
          <Receipt className="h-5 w-5 mr-2" />
          Información Fiscal para Facturación
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Errores de validación */}
        {formErrors.length > 0 && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Errores de los controladores */}
        {(facturaController.state.error || descuentoController.state.error) && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {facturaController.state.error || descuentoController.state.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Información fiscal requerida - SOLO para contador */}
          {userType === 'accountant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valorPagado" className="text-sm font-medium text-gray-700">
                Valor Pagado (USD) *
              </Label>
              <Input
                id="valorPagado"
                type="number"
                step="0.01"
                value={fiscalData.valorPagado}
                onChange={(e) => setFiscalData(prev => ({
                  ...prev, 
                  valorPagado: parseFloat(e.target.value) || 0
                }))}
                placeholder="0.00"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="numeroIngreso" className="text-sm font-medium text-gray-700">
                Número de Ingreso *
              </Label>
              <Input
                id="numeroIngreso"
                type="text"
                value={fiscalData.numeroIngreso}
                onChange={(e) => setFiscalData(prev => ({
                  ...prev, 
                  numeroIngreso: e.target.value
                }))}
                placeholder="Ej: ING-001"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="numeroFactura" className="text-sm font-medium text-gray-700">
                Número de Factura *
              </Label>
              <Input
                id="numeroFactura"
                type="text"
                value={fiscalData.numeroFactura}
                onChange={(e) => setFiscalData(prev => ({
                  ...prev, 
                  numeroFactura: e.target.value
                }))}
                placeholder="Ej: FAC-001"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>
          )}
          
          {/* Admin: Mostrar información fiscal existente (solo lectura) */}
          {userType === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">Valor Pagado</Label>
                <p className="mt-1 text-lg font-semibold text-gray-900">${factura.valorPagado}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Número de Ingreso</Label>
                <p className="mt-1 text-gray-900 font-mono">{factura.numeroIngreso}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Número de Factura</Label>
                <p className="mt-1 text-gray-900 font-mono">{factura.numeroFactura}</p>
              </div>
            </div>
          )}
          
          {/* Descuentos (solo para admin) */}
          {userType === 'admin' && (
            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Descuentos (Opcional)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroEstudiantes" className="text-sm font-medium text-gray-700">
                    Número de Estudiantes
                  </Label>
                  <Input
                    id="numeroEstudiantes"
                    type="number"
                    min="0"
                    value={fiscalData.numeroEstudiantes}
                    onChange={(e) => setFiscalData(prev => ({
                      ...prev, 
                      numeroEstudiantes: parseInt(e.target.value) || 0
                    }))}
                    placeholder="0"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cantidadDescuento" className="text-sm font-medium text-gray-700">
                    Cantidad de Descuento (USD)
                  </Label>
                  <Input
                    id="cantidadDescuento"
                    type="number"
                    step="0.01"
                    min="0"
                    max={fiscalData.valorPagado}
                    value={fiscalData.cantidadDescuento}
                    onChange={(e) => setFiscalData(prev => ({
                      ...prev, 
                      cantidadDescuento: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0.00"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Resumen de monto */}
              {fiscalData.cantidadDescuento > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">
                    <div>Valor original: ${fiscalData.valorPagado.toFixed(2)}</div>
                    <div>Descuento: -${fiscalData.cantidadDescuento.toFixed(2)}</div>
                    <div className="font-semibold">Monto final: ${montoFinal.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={
                isLoading || 
                (userType === 'accountant' && (!fiscalData.valorPagado || !fiscalData.numeroIngreso || !fiscalData.numeroFactura))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {isLoading 
                  ? 'Guardando...' 
                  : userType === 'admin' 
                    ? 'Guardar Descuentos' 
                    : 'Guardar Información Fiscal'
                }
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};