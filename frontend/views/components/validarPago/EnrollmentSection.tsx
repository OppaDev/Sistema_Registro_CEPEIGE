// views/components/validarPago/EnrollmentSection.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { useInscriptionController } from '@/controllers/inscripcion_completa/useInscriptionController';
import { GraduationCap, CheckCircle, AlertCircle, Users, Calendar, BookOpen } from 'lucide-react';

interface EnrollmentSectionProps {
  inscription: InscriptionData;
  isPaymentValidated: boolean;
  onEnrollmentCompleted?: () => void;
}

export const EnrollmentSection: React.FC<EnrollmentSectionProps> = ({
  inscription,
  isPaymentValidated,
  onEnrollmentCompleted
}) => {
  const { updateInscription, isUpdating } = useInscriptionController();
  const [error, setError] = useState<string | null>(null);

  const handleStartEnrollment = async () => {
    setError(null);
    
    try {
      // Actualizar la inscripción para activar la matrícula
      await updateInscription({
        idInscripcion: inscription.idInscripcion,
        matricula: true
      });
      
      console.log('✅ Matrícula iniciada exitosamente');
      onEnrollmentCompleted?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al iniciar la matrícula';
      setError(errorMessage);
      console.error('❌ Error starting enrollment:', error);
    }
  };

  const getEnrollmentBadge = () => {
    if (inscription.matricula) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Matriculado
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <GraduationCap className="h-3 w-3 mr-1" />
        No Matriculado
      </Badge>
    );
  };

  // Si el pago no está validado, mostrar mensaje
  if (!isPaymentValidated) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-indigo-50">
          <CardTitle className="flex items-center justify-between text-lg text-indigo-700">
            <span className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Matrícula del Participante
            </span>
            {getEnrollmentBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>Validación de pago requerida:</strong> El contador debe validar el pago antes de que puedas iniciar la matrícula de este participante.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-indigo-50">
        <CardTitle className="flex items-center justify-between text-lg text-indigo-700">
          <span className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Matrícula del Participante
          </span>
          {getEnrollmentBadge()}
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

        {/* Información del curso */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Información del Curso
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Curso:</span>
              <p className="text-gray-900 font-semibold">{inscription.curso.nombreCurso}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modalidad:</span>
              <p className="text-gray-900">{inscription.curso.modalidad}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de inicio:</span>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(inscription.curso.fechaInicio).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de fin:</span>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(inscription.curso.fechaFin).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Información del participante */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Participante
          </h4>
          <div className="text-sm">
            <p className="text-gray-900 font-semibold">
              {inscription.participante.nombres} {inscription.participante.apellidos}
            </p>
            <p className="text-gray-600">{inscription.participante.correo}</p>
            <p className="text-gray-600">CI/Pasaporte: {inscription.participante.ciPasaporte}</p>
          </div>
        </div>

        {/* Estado de matrícula */}
        {inscription.matricula ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>✅ Participante matriculado exitosamente.</strong> El participante ya está inscrito en el curso y puede acceder a todas las actividades académicas.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <strong>Listo para matricular:</strong> El pago ha sido validado. Puedes proceder a iniciar la matrícula del participante en el curso.
              </AlertDescription>
            </Alert>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">¿Qué sucede al iniciar la matrícula?</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• El participante será oficialmente matriculado en el curso</li>
                <li>• Se activará el acceso a las plataformas educativas (Moodle, Telegram)</li>
                <li>• El participante recibirá notificaciones de confirmación</li>
                <li>• Se generarán los registros académicos correspondientes</li>
              </ul>
            </div>

            <Button
              onClick={handleStartEnrollment}
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando Matrícula...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Iniciar Matrícula
                </>
              )}
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>Nota:</strong> Una vez iniciada la matrícula, el participante estará oficialmente inscrito en el curso. 
          Esta acción activará automáticamente las integraciones con las plataformas educativas configuradas.</p>
        </div>
      </CardContent>
    </Card>
  );
};