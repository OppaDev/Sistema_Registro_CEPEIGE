// views/components/DeleteInscriptionModal.tsx - NUEVO ARCHIVO

import React from 'react';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md lg:max-w-lg w-full mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full">
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-red-900">
              Confirmar Eliminación
            </h3>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1 sm:p-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-700 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
              ¿Estás seguro de que deseas eliminar esta inscripción?
            </p>
            
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">ID:</span>
                <span className="text-gray-900 font-mono text-sm sm:text-base">#{inscription.idInscripcion}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">Participante:</span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {inscription.participante.nombres} {inscription.participante.apellidos}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">CI/Pasaporte:</span>
                <span className="text-gray-900 font-mono text-sm sm:text-base">
                  {inscription.participante.ciPasaporte}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">Curso:</span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {inscription.curso.nombreCurso}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">Precio:</span>
                <span className="text-gray-900 font-bold text-orange-600 text-sm sm:text-base">
                  ${inscription.curso.precio.toFixed(2)}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                  inscription.estado === 'PENDIENTE' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : inscription.estado === 'VALIDADO'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {inscription.estado}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-gray-600 text-sm sm:text-base">Fecha:</span>
                <span className="text-gray-900 text-sm sm:text-base">
                  {inscriptionService.formatDate(inscription.fechaInscripcion)}
                </span>
              </div>
            </div>

            <Alert className="mt-3 sm:mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <AlertDescription className="text-red-700 text-sm sm:text-base">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. 
                Todos los datos relacionados con la inscripción serán eliminados permanentemente.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Eliminar Inscripción</span>
                <span className="sm:hidden">Eliminar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
