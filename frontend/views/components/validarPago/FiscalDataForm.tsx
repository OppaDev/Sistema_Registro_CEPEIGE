// views/components/validarPago/FiscalDataForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateFacturaData } from '@/models/validarPago/factura';
import { FileText, DollarSign, Hash, Receipt, AlertCircle } from 'lucide-react';

interface FiscalDataFormProps {
  inscripcionId: number;
  facturacionId: number;
  coursePrecio: number;
  onSubmit: (data: CreateFacturaData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const FiscalDataForm: React.FC<FiscalDataFormProps> = ({
  inscripcionId,
  facturacionId,
  coursePrecio,
  onSubmit,
  isSubmitting,
  error
}) => {
  const [formData, setFormData] = useState({
    valorPagado: coursePrecio.toString(),
    numeroIngreso: '',
    numeroFactura: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validar valor pagado
    const valorPagado = parseFloat(formData.valorPagado);
    if (!formData.valorPagado || isNaN(valorPagado) || valorPagado <= 0) {
      errors.valorPagado = 'El valor pagado debe ser un número mayor a 0';
    }

    // Validar número de ingreso
    if (!formData.numeroIngreso.trim()) {
      errors.numeroIngreso = 'El número de ingreso es requerido';
    } else if (formData.numeroIngreso.length < 3) {
      errors.numeroIngreso = 'El número de ingreso debe tener al menos 3 caracteres';
    }

    // Validar número de factura
    if (!formData.numeroFactura.trim()) {
      errors.numeroFactura = 'El número de factura es requerido';
    } else if (!/^[A-Z0-9\-]+$/.test(formData.numeroFactura)) {
      errors.numeroFactura = 'El número de factura solo puede contener letras mayúsculas, números y guiones';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: CreateFacturaData = {
      idInscripcion: inscripcionId,
      idFacturacion: facturacionId,
      valorPagado: parseFloat(formData.valorPagado),
      numeroIngreso: formData.numeroIngreso.trim(),
      numeroFactura: formData.numeroFactura.trim().toUpperCase()
    };

    await onSubmit(data);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center text-lg" style={{ color: '#0367A6' }}>
          <Receipt className="h-5 w-5 mr-2" />
          Datos Fiscales para Generar Factura
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Valor Pagado */}
          <div className="space-y-2">
            <Label htmlFor="valorPagado" className="flex items-center text-sm font-medium">
              <DollarSign className="h-4 w-4 mr-2" />
              Valor Pagado (USD)
            </Label>
            <Input
              id="valorPagado"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorPagado}
              onChange={(e) => handleInputChange('valorPagado', e.target.value)}
              placeholder="Ingrese el valor pagado"
              className={`${formErrors.valorPagado ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.valorPagado && (
              <p className="text-sm text-red-600">{formErrors.valorPagado}</p>
            )}
          </div>

          {/* Número de Ingreso */}
          <div className="space-y-2">
            <Label htmlFor="numeroIngreso" className="flex items-center text-sm font-medium">
              <Hash className="h-4 w-4 mr-2" />
              Número de Ingreso
            </Label>
            <Input
              id="numeroIngreso"
              type="text"
              value={formData.numeroIngreso}
              onChange={(e) => handleInputChange('numeroIngreso', e.target.value)}
              placeholder="Ej: ING-2024-001"
              className={`${formErrors.numeroIngreso ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.numeroIngreso && (
              <p className="text-sm text-red-600">{formErrors.numeroIngreso}</p>
            )}
            <p className="text-sm text-gray-500">
              Número único de ingreso del pago en el sistema contable
            </p>
          </div>

          {/* Número de Factura */}
          <div className="space-y-2">
            <Label htmlFor="numeroFactura" className="flex items-center text-sm font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Número de Factura
            </Label>
            <Input
              id="numeroFactura"
              type="text"
              value={formData.numeroFactura}
              onChange={(e) => handleInputChange('numeroFactura', e.target.value.toUpperCase())}
              placeholder="Ej: FAC-2024-001"
              className={`${formErrors.numeroFactura ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.numeroFactura && (
              <p className="text-sm text-red-600">{formErrors.numeroFactura}</p>
            )}
            <p className="text-sm text-gray-500">
              Solo letras mayúsculas, números y guiones. Se convertirá automáticamente a mayúsculas.
            </p>
          </div>

          {/* Información del precio del curso */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Precio del curso:</strong> ${Number(coursePrecio || 0).toFixed(2)} USD
            </p>
            <p className="text-xs text-gray-500">
              El valor pagado puede ser diferente al precio del curso si hay descuentos aplicados.
            </p>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando Factura...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Generar Factura
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};