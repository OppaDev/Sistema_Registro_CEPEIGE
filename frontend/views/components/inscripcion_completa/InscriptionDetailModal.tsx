// views/components/InscriptionDetailModal.tsx
import React, { useState } from 'react';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, BookOpen, FileText, CreditCard, Download, Eye, MapPin, Phone, Mail, Building, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface InscriptionDetailModalProps {
  inscription: InscriptionData | null;
  isOpen: boolean;
  onClose: () => void;
  userType: 'admin' | 'accountant';
}

export const InscriptionDetailModal: React.FC<InscriptionDetailModalProps> = ({
  inscription,
  isOpen,
  onClose,
  userType
}) => {
  // ✅ Estado para feedback visual
  const [downloadMessage, setDownloadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !inscription) return null;

  // ✅ Función para ver comprobante (abrir en nueva pestaña)
  const handleViewReceipt = () => {
    if (!inscription.comprobante) {
      setDownloadMessage({ type: 'error', text: 'No hay comprobante disponible' });
      setTimeout(() => setDownloadMessage(null), 3000);
      return;
    }

    try {
      const comprobanteUrl = `/uploads/comprobantes/${inscription.comprobante.nombreArchivo}`;
      window.open(comprobanteUrl, '_blank', 'noopener,noreferrer');
      setDownloadMessage({ type: 'success', text: 'Comprobante abierto en nueva pestaña' });
      setTimeout(() => setDownloadMessage(null), 2000);
    } catch (error) {
      setDownloadMessage({ type: 'error', text: 'Error al abrir el comprobante' });
      setTimeout(() => setDownloadMessage(null), 3000);
    }
  };

  // ✅ Función para descargar comprobante
  const handleDownloadReceipt = () => {
    if (!inscription.comprobante) {
      setDownloadMessage({ type: 'error', text: 'No hay comprobante disponible' });
      setTimeout(() => setDownloadMessage(null), 3000);
      return;
    }

    try {
      const comprobanteUrl = `/uploads/comprobantes/${inscription.comprobante.nombreArchivo}`;
      const link = document.createElement('a');
      link.href = comprobanteUrl;
      link.download = `comprobante_${inscription.idInscripcion}_${inscription.comprobante.nombreArchivo}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadMessage({ type: 'success', text: 'Descarga iniciada correctamente' });
      setTimeout(() => setDownloadMessage(null), 2000);
    } catch (error) {
      setDownloadMessage({ type: 'error', text: 'Error al descargar el comprobante' });
      setTimeout(() => setDownloadMessage(null), 3000);
    }
  };

  const getStatusBadge = (estado: string) => {
    const { color, text, bgColor } = inscriptionService.getStatusBadge(estado);
    return (
      <Badge className={`${bgColor} ${color} border-0 text-sm px-3 py-1`}>
        {text}
      </Badge>
    );
  };

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
          {/* ✅ Mensaje de feedback para descargas */}
          {downloadMessage && (
            <div className={`flex items-center p-3 rounded-lg ${
              downloadMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {downloadMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm ${
                downloadMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {downloadMessage.text}
              </span>
            </div>
          )}

          {/* Estado y fecha */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
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

            {/* Comprobante de pago */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-lg text-green-700">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Comprobante de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {inscription.comprobante ? (
                  <div className="space-y-4">
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
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-2 border-green-500 text-green-700 hover:bg-green-50"
                        onClick={handleViewReceipt}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver comprobante</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-2 border-blue-500 text-blue-700 hover:bg-blue-50"
                        onClick={handleDownloadReceipt}
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
                    <p className="text-gray-500">
                      El participante no ha subido comprobante de pago
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
    </div>
  );
};
