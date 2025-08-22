// views/components/BillingForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from './FormInput';
import { BillingData, BillingFieldErrors } from '@/models/inscripcion/billing';
import { Receipt, Building2 } from 'lucide-react';

interface BillingFormProps {
  billingData: BillingData;
  billingErrors: BillingFieldErrors;
  isSubmitting: boolean;
  onBillingChange: (name: string, value: string) => void;
  onBillingBlur: (name: string, value: string) => void;
  onSubmit: () => void;
  onAutocomplete?: () => void; // 🆕 NUEVA PROP PARA AUTOCOMPLETADO
}

export const BillingForm: React.FC<BillingFormProps> = ({
  billingData,
  billingErrors,
  isSubmitting,
  onBillingChange,
  onBillingBlur,
  onSubmit,
  onAutocomplete
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-purple-500 text-white">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Receipt className="h-6 w-6" />
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Datos de Facturación
          </CardTitle>
        </div>
        <p className="text-center text-purple-100">
          Proporciona los datos necesarios para la emisión de tu factura
        </p>
      </CardHeader>

      <CardContent className="p-6 bg-purple-50">
        {/* 🆕 BOTÓN DE AUTOCOMPLETADO */}
        {onAutocomplete && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🔄 Autocompletar con datos personales
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Puedes autocompletar los siguientes campos usando los datos personales que ya ingresaste:
                </p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc pl-4">
                  <li><strong>Razón Social:</strong> Se llenará con tu nombre completo</li>
                  <li><strong>Teléfono:</strong> Se copiará de tus datos personales</li>
                  <li><strong>Correo:</strong> Se copiará de tus datos personales</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                onClick={onAutocomplete}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                disabled={isSubmitting}
              >
                🔄 Autocompletar Datos
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Razón Social / Nombres y apellidos*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="razonSocial"
                    value={billingData.razonSocial}
                    onChange={(e) => onBillingChange(e.target.name, e.target.value)}
                    onBlur={(e) => onBillingBlur(e.target.name, e.target.value)}
                    placeholder="Nombre de la empresa o persona"
                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      billingErrors.razonSocial 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                {billingErrors.razonSocial && (
                  <p className="text-sm text-red-600">{billingErrors.razonSocial}</p>
                )}
              </div>
            </div>

            <FormInput
              label="Identificación Tributaria *"
              name="identificacionTributaria"
              value={billingData.identificacionTributaria}
              onChange={onBillingChange}
              onBlur={onBillingBlur}
              error={billingErrors.identificacionTributaria}
            />

            <FormInput
              label="Teléfono *"
              name="telefono"
              value={billingData.telefono}
              onChange={onBillingChange}
              onBlur={onBillingBlur}
              error={billingErrors.telefono}
            />

            <div className="sm:col-span-2">
              <FormInput
                label="Correo de Facturación *"
                name="correoFactura"
                type="email"
                value={billingData.correoFactura}
                onChange={onBillingChange}
                onBlur={onBillingBlur}
                error={billingErrors.correoFactura}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección *
                </label>
                <textarea
                  name="direccion"
                  value={billingData.direccion}
                  onChange={(e) => onBillingChange(e.target.name, e.target.value)}
                  onBlur={(e) => onBillingBlur(e.target.name, e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    billingErrors.direccion 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Dirección completa para facturación"
                />
                {billingErrors.direccion && (
                  <p className="text-sm text-red-600">{billingErrors.direccion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
           {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
           {/* <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              ← Volver a Datos Personales
            </Button>*/}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Continuar a Comprobante →'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
