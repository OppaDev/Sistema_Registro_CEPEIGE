// views/components/PaymentReceiptUpload.tsx
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentReceipt, PaymentFieldErrors } from '@/models/inscripcion/payment';
import { paymentService } from '@/services/inscripcion/paymentService';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle } from 'lucide-react';

interface PaymentReceiptUploadProps {
  paymentData: PaymentReceipt;
  paymentErrors: PaymentFieldErrors;
  isSubmitting: boolean;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export const PaymentReceiptUpload: React.FC<PaymentReceiptUploadProps> = ({
  paymentData,
  paymentErrors,
  isSubmitting,
  onFileChange,
  onSubmit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileSelect = (file: File) => {
    onFileChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-green-500 text-white">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Upload className="h-6 w-6" />
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Comprobante de Pago
          </CardTitle>
        </div>
        <p className="text-center text-green-100">
          Sube tu comprobante de transferencia bancaria o depósito
        </p>
      </CardHeader>

      <CardContent className="p-6 bg-green-50">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Información de pago */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
              💳 Información de Pago
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="font-medium text-blue-800 text-sm sm:text-base">Transferencias bancarias:</span>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1 list-disc pl-4 mt-1">
                  <li>Revisa la imagen donde se muestra la cuenta bancaria a la que deberás realizar la transferencia.</li>
                  <li>Asegúrate de confirmar que los datos (número de cuenta, banco, etc.) sean correctos.</li>
                  <li>Una vez realizada la transferencia, adjunta el comprobante de pago.</li>
                </ul>
                <div className="mt-3 flex justify-center">
                  <Image 
                    src="/img_pago.jpg" 
                    alt="Información de cuenta bancaria para transferencias" 
                    width={400}
                    height={300}
                    className="rounded-lg border shadow-md max-w-full h-auto"
                  />
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-800 text-sm sm:text-base">Pago con tarjeta de Crédito:</span>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1 list-disc pl-4 mt-1">
                  <li>Si deseas pagar con tarjeta de crédito, solicita el enlace de pago <a href="https://api.whatsapp.com/send/?phone=593984896665&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline cursor-pointer hover:text-blue-800">AQUÍ</a>.</li>
                  <li>Espera la respuesta del Jefe Académico, ya que se te enviará un enlace de pago seguro.</li>
                  <li>Realiza el Pago.</li>
                  <li>Guarda el comprobante digital o la captura de la pantalla que indique que el pago se ha realizado correctamente.</li>
                  <li>Adjunta el Comprobante en el Formulario de Inscripción.</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Área de carga de archivo */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Subir Comprobante *
            </label>
            
            {!paymentData.file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-green-400 bg-green-50'
                    : paymentErrors.file
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-gray-50 hover:border-green-300 hover:bg-green-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-center">
                    <Upload className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${dragActive ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-700">
                      {dragActive ? 'Suelta el archivo aquí' : 'Arrastra tu comprobante aquí'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      o{' '}
                      <button
                        type="button"
                        onClick={openFileDialog}
                        className="text-green-600 hover:text-green-700 font-medium underline"
                      >
                        selecciona un archivo
                      </button>
                    </p>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <p>Formatos permitidos: PNG, JPG, JPEG, PDF</p>
                    <p>Tamaño máximo: 5MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(paymentData.file.type)}
                    <div>
                      <p className="font-medium text-gray-800">{paymentData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {paymentService.formatFileSize(paymentData.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paymentErrors.file && (
              <Alert className="border-red-500 bg-red-50 text-red-800">
                <AlertDescription className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {paymentErrors.file}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              💡 Instrucciones
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Asegúrate de que el comprobante sea legible</li>
              <li>• Debe mostrar claramente el monto pagado y la fecha</li>
              <li>• Incluye el número de transacción si está disponible</li>
              <li>• El archivo no debe superar 5MB</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
             {/*
  <Button
    type="button"
    onClick={onBack}
    variant="outline"
    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
    disabled={isSubmitting}
  >
    ← Volver a Facturación
  </Button>
  */}
            
            <Button
              type="submit"
              disabled={isSubmitting || !paymentData.file}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Subiendo...</span>
                </div>
              ) : (
                'Finalizar Inscripción →'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
