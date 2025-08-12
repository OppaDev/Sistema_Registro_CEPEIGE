// views/components/validarPago/FacturaStatusCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Receipt, AlertCircle } from 'lucide-react';
import { Factura, getEstadoVerificacion } from '@/models/validarPago/factura';
import { facturaService } from '@/services/validarPago/facturaService';

interface FacturaStatusCardProps {
  factura: Factura;
  showDetails?: boolean;
  className?: string;
}

export const FacturaStatusCard: React.FC<FacturaStatusCardProps> = ({
  factura,
  showDetails = true,
  className = ''
}) => {
  const estado = getEstadoVerificacion(factura.verificacionPago);
  const isTemporary = facturaService.isTemporaryNumber(factura.numeroFactura);

  // Configuración de estilos según el estado
  const getStatusConfig = () => {
    if (estado === 'VERIFICADO') {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        badge: (
          <Badge className="bg-green-100 text-green-800 border-0">
            ✅ Pago Verificado
          </Badge>
        ),
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <Clock className="h-5 w-5 text-yellow-600" />,
        badge: (
          <Badge className="bg-yellow-100 text-yellow-800 border-0">
            ⏳ Pendiente de Verificación
          </Badge>
        ),
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={`${statusConfig.borderColor} ${className}`}>
      <CardHeader className={`${statusConfig.bgColor} pb-3`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              Estado de Facturación
            </span>
          </div>
          {statusConfig.badge}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Estado principal */}
          <div className="flex items-center space-x-3">
            {statusConfig.icon}
            <div>
              <p className="font-medium text-gray-800">
                {estado === 'VERIFICADO' ? 'Pago Verificado' : 'Esperando Verificación'}
              </p>
              <p className="text-sm text-gray-600">
                {estado === 'VERIFICADO' 
                  ? 'El pago ha sido verificado y aprobado'
                  : 'El comprobante está pendiente de verificación'
                }
              </p>
            </div>
          </div>

          {/* Alerta para números temporales */}
          {isTemporary && (
            <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Información Temporal</p>
                <p className="text-sm text-amber-700">
                  Los números de factura e ingreso son temporales. Actualízalos con la información fiscal definitiva.
                </p>
              </div>
            </div>
          )}

          {/* Detalles de la factura */}
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <p className="text-sm font-medium text-gray-700">Valor Pagado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {facturaService.formatCurrency(factura.valorPagado)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Número de Factura</p>
                <p className="text-sm text-gray-900 font-mono">
                  {factura.numeroFactura}
                  {isTemporary && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      TEMPORAL
                    </Badge>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Número de Ingreso</p>
                <p className="text-sm text-gray-900 font-mono">
                  {factura.numeroIngreso}
                  {facturaService.isTemporaryNumber(factura.numeroIngreso) && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      TEMPORAL
                    </Badge>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Fecha de Creación</p>
                <p className="text-sm text-gray-900">
                  {facturaService.formatDate(factura.fechaCreacion)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};