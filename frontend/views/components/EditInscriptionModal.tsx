// views/components/EditInscriptionModal.tsx - NUEVO ARCHIVO
import React, { useState, useEffect } from 'react';
import { InscriptionData, EditInscriptionRequest } from '@/models/inscription';
import { inscriptionService } from '@/services/inscriptionService';
import { courseService } from '@/services/courseService'; // ✅ AÑADIR IMPORT DEL COURSE SERVICE
import { participantSchema } from '@/models/validation';
import { billingSchema } from '@/models/billing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Save, User, FileText, BookOpen } from 'lucide-react';
import { Edit } from 'lucide-react'; // Icono para editar

interface EditInscriptionModalProps {
  inscription: InscriptionData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updateData: EditInscriptionRequest) => Promise<void>;
  userType: 'admin' | 'accountant';
  isUpdating: boolean;
}

export const EditInscriptionModal: React.FC<EditInscriptionModalProps> = ({
  inscription,
  isOpen,
  onClose,
  onUpdate,
  userType,
  isUpdating
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    participante: {
      nombres: '',
      apellidos: '',
      numTelefono: '',
      correo: '',
      pais: '',
      provinciaEstado: '',
      ciudad: '',
      profesion: '',
      institucion: ''
    },
    facturacion: {
      razonSocial: '',
      identificacionTributaria: '',
      telefono: '',
      correoFactura: '',
      direccion: ''
    },
    nuevoCurso: 0
  });

  const [availableCourses, setAvailableCourses] = useState<{id: number; nombre: string; precio: number}[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (inscription && isOpen) {
      setFormData({
        participante: {
          nombres: inscription.participante.nombres,
          apellidos: inscription.participante.apellidos,
          numTelefono: inscription.participante.numTelefono,
          correo: inscription.participante.correo,
          pais: inscription.participante.pais,
          provinciaEstado: inscription.participante.provinciaEstado,
          ciudad: inscription.participante.ciudad,
          profesion: inscription.participante.profesion,
          institucion: inscription.participante.institucion
        },
        facturacion: {
          razonSocial: inscription.facturacion.razonSocial,
          identificacionTributaria: inscription.facturacion.identificacionTributaria,
          telefono: inscription.facturacion.telefono,
          correoFactura: inscription.facturacion.correoFactura,
          direccion: inscription.facturacion.direccion
        },
        nuevoCurso: inscription.curso.idCurso
      });

      // Cargar cursos disponibles si es admin
      if (userType === 'admin') {
        loadAvailableCourses();
      }

      setErrors({});
      setHasChanges(false);
    } else if (!isOpen) {
      // ✅ LIMPIAR ESTADOS CUANDO SE CIERRA EL MODAL
      setAvailableCourses([]);
      setCoursesError(null);
      setCoursesLoading(false);
    }
  }, [inscription, isOpen, userType]);

  const loadAvailableCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    
    try {
      console.log('📚 EditInscriptionModal: Cargando cursos disponibles...');
      
      // ✅ USAR EL COURSE SERVICE CON LA NUEVA FUNCIÓN getAllCourses
      const response = await courseService.getAllCourses();
      
      console.log('📥 Respuesta de cursos:', response);
      
      if (response.success && response.data) {
        // Filtrar solo cursos activos y mapear al formato esperado
        const activeCourses = response.data
          .filter(course => course.activo !== false)
          .map(course => ({
            id: course.idCurso,
            nombre: course.nombreCurso,
            precio: Number(course.valorCurso || course.costoTotal || 0)
          }));
        
        console.log(`✅ ${activeCourses.length} cursos activos cargados para edición`);
        setAvailableCourses(activeCourses);
        
        if (activeCourses.length === 0) {
          setCoursesError('No hay cursos activos disponibles para cambio.');
        }
      } else {
        const errorMessage = response.message || 'Error al cargar cursos';
        console.error('❌ Error en respuesta de cursos:', errorMessage);
        setCoursesError(errorMessage);
        setAvailableCourses([]);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error de conexión al cargar cursos';
      console.error('❌ Error cargando cursos:', error);
      setCoursesError(errorMessage);
      setAvailableCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInputChange = (section: 'participante' | 'facturacion', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Limpiar error del campo
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: ''
    }));

    setHasChanges(true);
  };

  const handleCourseChange = (courseId: number) => {
    setFormData(prev => ({
      ...prev,
      nuevoCurso: courseId
    }));
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validar datos personales
    try {
      participantSchema.pick({
        nombres: true,
        apellidos: true,
        numTelefono: true,
        correo: true,
        pais: true,
        provinciaEstado: true,
        ciudad: true,
        profesion: true,
        institucion: true
      }).parse(formData.participante);
    } catch (error: any) {
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          newErrors[`participante.${err.path[0]}`] = err.message;
        }
      });
    }

    // Validar datos de facturación
    try {
      billingSchema.parse(formData.facturacion);
    } catch (error: any) {
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          newErrors[`facturacion.${err.path[0]}`] = err.message;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inscription || !validateForm()) return;

    console.log('📝 EditInscriptionModal: Enviando actualización...');

    const updateData: EditInscriptionRequest = {
      idInscripcion: inscription.idInscripcion,
      datosPersonales: formData.participante,
      datosFacturacion: formData.facturacion
    };

    // Solo incluir cambio de curso si es admin y ha cambiado
    if (userType === 'admin' && formData.nuevoCurso !== inscription.curso.idCurso) {
      updateData.nuevoCurso = formData.nuevoCurso;
      console.log('🔄 Cambio de curso detectado:', formData.nuevoCurso);
    }

    try {
      await onUpdate(updateData);
      console.log('✅ Actualización completada exitosamente');
      
      // El modal se cerrará automáticamente desde el controlador
      // No necesitamos hacer nada más aquí
    } catch (error) {
      console.error('❌ Error en actualización:', error);
      // Los errores se manejan en el controlador
    }
  };

  if (!isOpen || !inscription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: '#F3762B' }}
        >
          <div className="flex items-center space-x-3">
            <Edit className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Editar Inscripción #{inscription.idInscripcion}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
            disabled={isUpdating}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información no editable */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Información no editable:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">CI/Pasaporte:</span> {inscription.participante.ciPasaporte}
              </div>
              <div>
                <span className="font-medium">Fecha de inscripción:</span> {
                  inscriptionService.formatDate(inscription.fechaInscripcion)
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-lg" style={{ color: '#0367A6' }}>
                  <User className="h-5 w-5 mr-2" />
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input
                      id="nombres"
                      value={formData.participante.nombres}
                      onChange={(e) => handleInputChange('participante', 'nombres', e.target.value)}
                      className={errors['participante.nombres'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.nombres'] && (
                      <p className="text-sm text-red-600">{errors['participante.nombres']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={formData.participante.apellidos}
                      onChange={(e) => handleInputChange('participante', 'apellidos', e.target.value)}
                      className={errors['participante.apellidos'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.apellidos'] && (
                      <p className="text-sm text-red-600">{errors['participante.apellidos']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numTelefono">Teléfono *</Label>
                    <Input
                      id="numTelefono"
                      value={formData.participante.numTelefono}
                      onChange={(e) => handleInputChange('participante', 'numTelefono', e.target.value)}
                      className={errors['participante.numTelefono'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.numTelefono'] && (
                      <p className="text-sm text-red-600">{errors['participante.numTelefono']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.participante.correo}
                      onChange={(e) => handleInputChange('participante', 'correo', e.target.value)}
                      className={errors['participante.correo'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.correo'] && (
                      <p className="text-sm text-red-600">{errors['participante.correo']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pais">País *</Label>
                    <Input
                      id="pais"
                      value={formData.participante.pais}
                      onChange={(e) => handleInputChange('participante', 'pais', e.target.value)}
                      className={errors['participante.pais'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.pais'] && (
                      <p className="text-sm text-red-600">{errors['participante.pais']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="provinciaEstado">Provincia/Estado *</Label>
                    <Input
                      id="provinciaEstado"
                      value={formData.participante.provinciaEstado}
                      onChange={(e) => handleInputChange('participante', 'provinciaEstado', e.target.value)}
                      className={errors['participante.provinciaEstado'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.provinciaEstado'] && (
                      <p className="text-sm text-red-600">{errors['participante.provinciaEstado']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      value={formData.participante.ciudad}
                      onChange={(e) => handleInputChange('participante', 'ciudad', e.target.value)}
                      className={errors['participante.ciudad'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.ciudad'] && (
                      <p className="text-sm text-red-600">{errors['participante.ciudad']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="profesion">Profesión *</Label>
                    <Input
                      id="profesion"
                      value={formData.participante.profesion}
                      onChange={(e) => handleInputChange('participante', 'profesion', e.target.value)}
                      className={errors['participante.profesion'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.profesion'] && (
                      <p className="text-sm text-red-600">{errors['participante.profesion']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="institucion">Institución *</Label>
                    <Input
                      id="institucion"
                      value={formData.participante.institucion}
                      onChange={(e) => handleInputChange('participante', 'institucion', e.target.value)}
                      className={errors['participante.institucion'] ? 'border-red-500' : ''}
                    />
                    {errors['participante.institucion'] && (
                      <p className="text-sm text-red-600">{errors['participante.institucion']}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de Facturación */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center text-lg" style={{ color: '#02549E' }}>
                  <FileText className="h-5 w-5 mr-2" />
                  Datos de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="razonSocial">Razón Social *</Label>
                  <Input
                    id="razonSocial"
                    value={formData.facturacion.razonSocial}
                    onChange={(e) => handleInputChange('facturacion', 'razonSocial', e.target.value)}
                    className={errors['facturacion.razonSocial'] ? 'border-red-500' : ''}
                  />
                  {errors['facturacion.razonSocial'] && (
                    <p className="text-sm text-red-600">{errors['facturacion.razonSocial']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="identificacionTributaria">Identificación Tributaria *</Label>
                  <Input
                    id="identificacionTributaria"
                    value={formData.facturacion.identificacionTributaria}
                    onChange={(e) => handleInputChange('facturacion', 'identificacionTributaria', e.target.value)}
                    className={errors['facturacion.identificacionTributaria'] ? 'border-red-500' : ''}
                  />
                  {errors['facturacion.identificacionTributaria'] && (
                    <p className="text-sm text-red-600">{errors['facturacion.identificacionTributaria']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefonoFacturacion">Teléfono *</Label>
                  <Input
                    id="telefonoFacturacion"
                    value={formData.facturacion.telefono}
                    onChange={(e) => handleInputChange('facturacion', 'telefono', e.target.value)}
                    className={errors['facturacion.telefono'] ? 'border-red-500' : ''}
                  />
                  {errors['facturacion.telefono'] && (
                    <p className="text-sm text-red-600">{errors['facturacion.telefono']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="correoFactura">Correo de Facturación *</Label>
                  <Input
                    id="correoFactura"
                    type="email"
                    value={formData.facturacion.correoFactura}
                    onChange={(e) => handleInputChange('facturacion', 'correoFactura', e.target.value)}
                    className={errors['facturacion.correoFactura'] ? 'border-red-500' : ''}
                  />
                  {errors['facturacion.correoFactura'] && (
                    <p className="text-sm text-red-600">{errors['facturacion.correoFactura']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección *</Label>
                  <textarea
                    id="direccion"
                    value={formData.facturacion.direccion}
                    onChange={(e) => handleInputChange('facturacion', 'direccion', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors['facturacion.direccion'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                  />
                  {errors['facturacion.direccion'] && (
                    <p className="text-sm text-red-600">{errors['facturacion.direccion']}</p>
                  )}
                </div>

                {/* Cambio de curso (solo admin) */}
                {userType === 'admin' && (
                  <div>
                    <Label htmlFor="nuevoCurso">Cambiar Curso</Label>
                    
                    {coursesLoading && (
                      <div className="flex items-center space-x-2 py-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Cargando cursos disponibles...</span>
                      </div>
                    )}
                    
                    {coursesError && (
                      <Alert className="my-2">
                        <AlertDescription className="text-red-600">
                          {coursesError}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={loadAvailableCourses}
                            className="ml-2 h-6 px-2 text-xs"
                          >
                            Reintentar
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!coursesLoading && !coursesError && availableCourses.length === 0 && (
                      <Alert className="my-2">
                        <AlertDescription className="text-orange-600">
                          No hay cursos disponibles para cambio. Verifique que existan cursos activos.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!coursesLoading && availableCourses.length > 0 && (
                      <select
                        id="nuevoCurso"
                        value={formData.nuevoCurso}
                        onChange={(e) => handleCourseChange(Number(e.target.value))}
                        disabled={coursesLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option key={`current-${inscription.curso.idCurso}`} value={inscription.curso.idCurso}>
                          {inscription.curso.nombreCurso} (Actual)
                        </option>
                        {availableCourses
                          .filter(course => course.id !== inscription.curso.idCurso)
                          .map(course => (
                            <option key={`course-${course.id}`} value={course.id}>
                              {course.nombre} - ${course.precio}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !hasChanges}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


