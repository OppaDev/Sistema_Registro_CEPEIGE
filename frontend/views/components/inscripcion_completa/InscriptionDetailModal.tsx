// views/components/InscriptionDetailModal.tsx
import React, { useState } from 'react';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, User, BookOpen, FileText, CreditCard, Download, Eye, MapPin, Phone, Mail, Building, CheckCircle, AlertCircle, Receipt } from 'lucide-react';
import { PaymentValidationSection } from '../validarPago/PaymentValidationSection';
import { DiscountManagementSection } from '../validarPago/DiscountManagementSection';
import { EnrollmentSection } from '../validarPago/EnrollmentSection';


interface InscriptionDetailModalProps {
  inscription: InscriptionData | null;
  isOpen: boolean;
  onClose: () => void;
  userType: 'admin' | 'accountant';
  onPaymentValidated?: () => void; // Callback para refrescar la lista
}

export const InscriptionDetailModal: React.FC<InscriptionDetailModalProps> = ({
  inscription,
  isOpen,
  onClose,
  userType,
  onPaymentValidated
}) => {
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !inscription) return null;

  const getStatusBadge = (estado: string) => {
    const { color, text, bgColor } = inscriptionService.getStatusBadge(estado);
    return (
      <Badge className={`${bgColor} ${color} border-0 text-sm px-3 py-1`}>
        {text}
      </Badge>
    );
  };

  const handlePaymentValidationSuccess = async () => {
    setValidationMessage({
      type: 'success',
      text: 'Proceso de validación completado exitosamente'
    });
    
    // Recargar la lista general de inscripciones
    if (onPaymentValidated) {
      await onPaymentValidated();
    }
    
    // Forzar cierre y reapertura del modal para refrescar datos
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // 🆕 MANEJAR DESCARGA DE COMPROBANTE - DIRECTO
  const handleDownloadReceipt = async () => {
    if (!inscription.comprobante) {
      setValidationMessage({
        type: 'error',
        text: 'No hay comprobante disponible'
      });
      return;
    }
    
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
      
      setValidationMessage({
        type: 'success',
        text: 'Comprobante descargado exitosamente'
      });
    } catch (error) {
      setValidationMessage({
        type: 'error',
        text: 'Error al descargar el comprobante'
      });
    }
  };

  // 🆕 MANEJAR VISUALIZACIÓN DE COMPROBANTE - DIRECTO
  const handleViewReceipt = () => {
    if (!inscription.comprobante) {
      setValidationMessage({
        type: 'error',
        text: 'No hay comprobante disponible'
      });
      return;
    }
    
    // Construir URL directa y abrir inmediatamente
    const directUrl = `http://localhost:3001/uploads/comprobantes/${inscription.comprobante.nombreArchivo}`;
    window.open(directUrl, '_blank');
  };

  const canValidatePayment = inscriptionService.canValidatePayment(inscription, userType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: '#0367A6' }}
        >
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Detalle de Inscripción #{inscription.idInscripcion}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y fecha */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Estado de la inscripción:</span>
                {getStatusBadge(inscription.estado)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fecha de inscripción:</span>{' '}
                <span className="font-semibold">
                  {inscriptionService.formatDate(inscription.fechaInscripcion)}
                </span>
              </div>
            </div>
            
            {/* 🆕 INDICADOR VISUAL PARA CONTADOR */}
            {userType === 'accountant' && canValidatePayment && (
              <div className="flex items-center space-x-2 text-sm">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700 font-medium">
                  ⚡ Esta inscripción requiere validación de pago
                </span>
              </div>
            )}
            
            {userType === 'accountant' && inscription.estado === 'VALIDADO' && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 font-medium">
                  ✅ Pago validado correctamente
                </span>
              </div>
            )}
            
            {inscription.valorPagado && (
              <div className="flex items-center space-x-2 text-sm">
                <Receipt className="h-4 w-4 text-green-500" />
                <span className="text-green-700 font-medium">
                  ✅ Información fiscal registrada - Valor: ${inscription.valorPagado}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos del participante */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-lg" style={{ color: '#0367A6' }}>
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3">
                    <User className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Nombre completo:</span>
                      <p className="text-gray-900 font-semibold">
                        {inscription.participante.nombres} {inscription.participante.apellidos}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">CI/Pasaporte:</span>
                      <p className="text-gray-900 font-mono">
                        {inscription.participante.ciPasaporte}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Correo electrónico:</span>
                      <p className="text-gray-900">
                        {inscription.participante.correo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Teléfono:</span>
                      <p className="text-gray-900">
                        {inscription.participante.numTelefono}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Ubicación:</span>
                      <p className="text-gray-900">
                        {inscription.participante.ciudad}, {inscription.participante.provinciaEstado}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {inscription.participante.pais}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Profesión:</span>
                      <p className="text-gray-900">
                        {inscription.participante.profesion}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Institución:</span>
                      <p className="text-gray-900">
                        {inscription.participante.institucion}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del curso */}
            <Card>
              <CardHeader style={{ backgroundColor: '#F3762B' }} className="text-white">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Información del Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Nombre del curso:</span>
                  <p className="text-gray-900 font-semibold text-lg">
                    {inscription.curso.nombreCurso}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Modalidad:</span>
                  <p className="text-gray-900">
                    {inscription.curso.modalidad}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Precio del curso:</span>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#F3762B' }}>
                    ${inscription.curso.precio.toFixed(2)} USD
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Fecha de inicio:</span>
                    <p className="text-gray-900 font-semibold">
                      {inscription.curso.fechaInicio.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Fecha de fin:</span>
                    <p className="text-gray-900 font-semibold">
                      {inscription.curso.fechaFin.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos de facturación */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center text-lg" style={{ color: '#02549E' }}>
                  <FileText className="h-5 w-5 mr-2" />
                  Datos de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Razón social:</span>
                  <p className="text-gray-900 font-semibold">
                    {inscription.facturacion.razonSocial}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Identificación tributaria:</span>
                  <p className="text-gray-900 font-mono">
                    {inscription.facturacion.identificacionTributaria}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Teléfono:</span>
                  <p className="text-gray-900">
                    {inscription.facturacion.telefono}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Correo para facturación:</span>
                  <p className="text-gray-900">
                    {inscription.facturacion.correoFactura}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Dirección:</span>
                  <p className="text-gray-900">
                    {inscription.facturacion.direccion}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comprobante de pago y validación */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-lg text-green-700">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Comprobante y Validación de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {inscription.comprobante ? (
                  <div className="space-y-4">
                    {/* Información del comprobante */}
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-4xl">
                        {inscription.comprobante.tipoArchivo.startsWith('image/') ? '🖼️' : '📄'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {inscription.comprobante.nombreArchivo}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subido: {inscriptionService.formatDate(inscription.comprobante.fechaSubida)}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          ✅ Comprobante disponible
                        </p>
                      </div>
                    </div>
                    
                    {/* Botones de acción del comprobante */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleViewReceipt}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver comprobante</span>
                      </Button>
                      <Button
                        onClick={handleDownloadReceipt}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </Button>
                    </div>
                    
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <CreditCard className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin comprobante
                    </h3>
                    <p className="text-gray-500 mb-4">
                      El participante no ha subido comprobante de pago
                    </p>
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-orange-800">
                        No se puede procesar el pago sin comprobante. Contacta al participante para que suba su comprobante.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🆕 SECCIÓN DE VALIDACIÓN DE PAGO PARA CONTADOR */}
          {userType === 'accountant' && (
            <PaymentValidationSection
              inscription={inscription}
              userType={userType}
              onPaymentValidated={handlePaymentValidationSuccess}
            />
          )}

          {/* 🆕 SECCIÓN DE GESTIÓN DE DESCUENTOS PARA ADMIN */}
          {userType === 'admin' && (
            <DiscountManagementSection
              inscription={inscription}
              isPaymentValidated={inscription.estado === 'VALIDADO'}
              onDiscountApplied={handlePaymentValidationSuccess}
            />
          )}

          {/* 🆕 SECCIÓN DE MATRÍCULA PARA ADMIN */}
          {userType === 'admin' && (
            <EnrollmentSection
              inscription={inscription}
              isPaymentValidated={inscription.estado === 'VALIDADO'}
              onEnrollmentCompleted={handlePaymentValidationSuccess}
            />
          )}

          {/* 🆕 MENSAJE DE VALIDACIÓN */}
          {validationMessage && (
            <Alert className={`${validationMessage.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <AlertDescription className={`font-medium ${
                validationMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationMessage.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Botón de cerrar centrado */}
          <div className="flex justify-center pt-6 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex items-center space-x-2 px-8 py-2"
              style={{ borderColor: '#0367A6', color: '#0367A6' }}
            >
              <X className="h-4 w-4" />
              <span>Cerrar</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Modal eliminado - funcionalidad directa */}
    </div>
  );
};
