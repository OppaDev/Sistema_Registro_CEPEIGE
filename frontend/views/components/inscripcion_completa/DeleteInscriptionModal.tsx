// views/components/DeleteInscriptionModal.tsx - NUEVO ARCHIVO

import React from 'react';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteInscriptionModalProps {
  isOpen: boolean;
  inscription: InscriptionData | null;
  isDeleting: boolean;
  onConfirm: (inscriptionId: number) => Promise<void>;
  onCancel: () => void;
}

export const DeleteInscriptionModal: React.FC<DeleteInscriptionModalProps> = ({
  isOpen,
  inscription,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !inscription) return null;

  const handleConfirm = async () => {
    await onConfirm(inscription.idInscripcion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900">
              Confirmar Eliminación
            </h3>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4 font-medium">
              ¿Estás seguro de que deseas eliminar esta inscripción?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 border">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">ID:</span>
                <span className="text-gray-900 font-mono">#{inscription.idInscripcion}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Participante:</span>
                <span className="text-gray-900 font-semibold">
                  {inscription.participante.nombres} {inscription.participante.apellidos}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">CI/Pasaporte:</span>
                <span className="text-gray-900 font-mono">
                  {inscription.participante.ciPasaporte}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Curso:</span>
                <span className="text-gray-900 font-semibold">
                  {inscription.curso.nombreCurso}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Precio:</span>
                <span className="text-gray-900 font-bold text-orange-600">
                  ${inscription.curso.precio.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  inscription.estado === 'PENDIENTE' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : inscription.estado === 'VALIDADO'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {inscription.estado}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Fecha:</span>
                <span className="text-gray-900">
                  {inscriptionService.formatDate(inscription.fechaInscripcion)}
                </span>
              </div>
            </div>

            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. 
                Todos los datos de la inscripción serán eliminados permanentemente.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isDeleting}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Eliminar Inscripción</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
