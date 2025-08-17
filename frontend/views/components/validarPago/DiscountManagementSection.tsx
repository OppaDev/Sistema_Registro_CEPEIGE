// views/components/validarPago/DiscountManagementSection.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { DescuentoFormData, TipoDescuento } from '@/models/validarPago/descuento';
import { useDescuentoController } from '@/controllers/validarPago/useDescuentoController';
import { Percent, Users, Tag, AlertCircle, Plus, Save } from 'lucide-react';

interface DiscountManagementSectionProps {
  inscription: InscriptionData;
  isPaymentValidated: boolean;
  onDiscountApplied?: () => void;
}

export const DiscountManagementSection: React.FC<DiscountManagementSectionProps> = ({
  inscription,
  isPaymentValidated,
  onDiscountApplied
}) => {
  const {
    error,
    isCreating,
    createDescuento,
    clearError
  } = useDescuentoController();

  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [formData, setFormData] = useState<DescuentoFormData>({
    tipoDescuento: 'estudiante',
    numeroEstudiantes: undefined,
    cantidadDescuento: undefined,
    descripcion: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const tipoDescuentoOptions: { value: TipoDescuento; label: string; description: string }[] = [
    { 
      value: 'estudiante', 
      label: 'Descuento Estudiantil', 
      description: 'Para estudiantes con carnet vigente' 
    },
    { 
      value: 'institucion', 
      label: 'Descuento Institucional', 
      description: 'Para grupos de instituciones educativas' 
    },
    { 
      value: 'promocional', 
      label: 'Descuento Promocional', 
      description: 'Ofertas especiales y promociones' 
    },
    { 
      value: 'otro', 
      label: 'Otro Descuento', 
      description: 'Otros tipos de descuentos acordados' 
    }
  ];

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validar cantidad de descuento
    if (formData.cantidadDescuento !== undefined) {
      if (formData.cantidadDescuento <= 0) {
        errors.cantidadDescuento = 'La cantidad de descuento debe ser mayor a 0';
      }
      if (formData.cantidadDescuento >= Number(inscription.curso.precio || 0)) {
        errors.cantidadDescuento = 'El descuento no puede ser mayor o igual al precio del curso';
      }
    }

    // Validar número de estudiantes para descuento institucional
    if (formData.tipoDescuento === 'institucion' && formData.numeroEstudiantes !== undefined) {
      if (formData.numeroEstudiantes <= 0) {
        errors.numeroEstudiantes = 'El número de estudiantes debe ser mayor a 0';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await createDescuento(formData);
    if (result) {
      setShowDiscountForm(false);
      setFormData({
        tipoDescuento: 'estudiante',
        numeroEstudiantes: undefined,
        cantidadDescuento: undefined,
        descripcion: ''
      });
      onDiscountApplied?.();
    }
  };

  const handleInputChange = (field: keyof DescuentoFormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getDiscountBadge = () => {
    if (inscription.descuento) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <Percent className="h-3 w-3 mr-1" />
          Descuento Aplicado
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <Tag className="h-3 w-3 mr-1" />
        Sin Descuento
      </Badge>
    );
  };

  // Si el pago no está validado, mostrar mensaje
  if (!isPaymentValidated) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center justify-between text-lg text-purple-700">
            <span className="flex items-center">
              <Percent className="h-5 w-5 mr-2" />
              Gestión de Descuentos
            </span>
            {getDiscountBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>Validación de pago requerida:</strong> El contador debe validar el pago antes de que puedas gestionar descuentos para este participante.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center justify-between text-lg text-purple-700">
          <span className="flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            Gestión de Descuentos
          </span>
          {getDiscountBadge()}
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

        {/* Información del precio del curso */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Precio del curso:</span>
              <p className="text-2xl font-bold text-gray-900">${Number(inscription.curso.precio || 0).toFixed(2)} USD</p>
            </div>
            {inscription.descuento && (
              <div>
                <span className="text-sm font-medium text-gray-700">Descuento aplicado:</span>
                <p className="text-xl font-bold text-purple-600">
                  ${Number(inscription.descuento.valorDescuento || 0).toFixed(2)} USD
                </p>
                <p className="text-sm text-gray-600">{inscription.descuento.descripcionDescuento}</p>
              </div>
            )}
          </div>
        </div>

        {/* Descuento existente */}
        {inscription.descuento && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3">Descuento Actual</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Tipo:</span>
                <p className="text-gray-900">{inscription.descuento.tipoDescuento}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Valor:</span>
                <p className="text-gray-900 font-semibold">${Number(inscription.descuento.valorDescuento || 0).toFixed(2)} USD</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Descripción:</span>
                <p className="text-gray-900">{inscription.descuento.descripcionDescuento}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de descuento */}
        {showDiscountForm && (
          <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
            <h4 className="font-medium text-gray-900">Agregar Nuevo Descuento</h4>
            
            {/* Tipo de descuento */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Tag className="h-4 w-4 mr-2" />
                Tipo de Descuento
              </Label>
              <Select
                value={formData.tipoDescuento}
                onValueChange={(value: TipoDescuento) => handleInputChange('tipoDescuento', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el tipo de descuento" />
                </SelectTrigger>
                <SelectContent>
                  {tipoDescuentoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número de estudiantes (solo para descuento institucional) */}
            {formData.tipoDescuento === 'institucion' && (
              <div className="space-y-2">
                <Label htmlFor="numeroEstudiantes" className="flex items-center text-sm font-medium">
                  <Users className="h-4 w-4 mr-2" />
                  Número de Estudiantes (Opcional)
                </Label>
                <Input
                  id="numeroEstudiantes"
                  type="number"
                  min="1"
                  value={formData.numeroEstudiantes || ''}
                  onChange={(e) => handleInputChange('numeroEstudiantes', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ingrese el número de estudiantes"
                  className={`${formErrors.numeroEstudiantes ? 'border-red-500' : ''}`}
                />
                {formErrors.numeroEstudiantes && (
                  <p className="text-sm text-red-600">{formErrors.numeroEstudiantes}</p>
                )}
              </div>
            )}

            {/* Cantidad del descuento */}
            <div className="space-y-2">
              <Label htmlFor="cantidadDescuento" className="flex items-center text-sm font-medium">
                <Percent className="h-4 w-4 mr-2" />
                Cantidad de Descuento (USD) (Opcional)
              </Label>
              <Input
                id="cantidadDescuento"
                type="number"
                step="0.01"
                min="0.01"
                max={Number(inscription.curso.precio || 0) - 0.01}
                value={formData.cantidadDescuento || ''}
                onChange={(e) => handleInputChange('cantidadDescuento', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder={`Máximo: $${(Number(inscription.curso.precio || 0) - 0.01).toFixed(2)}`}
                className={`${formErrors.cantidadDescuento ? 'border-red-500' : ''}`}
              />
              {formErrors.cantidadDescuento && (
                <p className="text-sm text-red-600">{formErrors.cantidadDescuento}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Describe los detalles del descuento..."
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Aplicar Descuento
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDiscountForm(false);
                  clearError();
                }}
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Botón para mostrar formulario */}
        {!showDiscountForm && !inscription.descuento && (
          <Button
            onClick={() => {
              clearError();
              setShowDiscountForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Descuento
          </Button>
        )}

        {/* Información adicional */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>Nota:</strong> Los descuentos son opcionales y se aplican según acuerdos previos con el participante o la institución. 
          Una vez aplicado un descuento, se actualizará en el sistema de facturación.</p>
        </div>
      </CardContent>
    </Card>
  );
};