// views/components/InscriptionTable.tsx
import React from 'react';
import { InscriptionData } from '@/models/inscripcion_completa/inscription';
import { inscriptionService } from '@/services/inscripcion_completa/inscriptionService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Download, Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';



interface InscriptionTableProps {
  inscriptions: InscriptionData[];
  loading: boolean;
  onViewDetails: (inscription: InscriptionData) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  // 🆕 NUEVAS PROPS PARA EDICIÓN
  onEditInscription: (inscription: InscriptionData) => void;
  userType: 'admin' | 'accountant';
  onDeleteInscription: (inscription: InscriptionData) => void;
  
}

export const InscriptionTable: React.FC<InscriptionTableProps> = ({
  inscriptions,
  loading,
  onViewDetails,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEditInscription,
  userType,
  onDeleteInscription // 🆕 NUEVA PROP
}) => {
  const tableKey = React.useMemo(() => {
    const dataHash = inscriptions.map(i => 
      `${i.idInscripcion}-${i.participante.nombres}-${i.participante.apellidos}-${i.facturacion.razonSocial}-${i.facturacion.identificacionTributaria}`
    ).join('|');
    return `table-${inscriptions.length}-${dataHash}`;
  }, [inscriptions]);

  const getStatusBadge = (estado: string) => {
    const { color, text, bgColor } = inscriptionService.getStatusBadge(estado);
    return (
      <Badge className={`${bgColor} ${color} border-0`}>
        {text}
      </Badge>
    );
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const isEditable = (inscription: InscriptionData) => {
    return inscriptionService.isInscriptionEditable(inscription);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Cargando inscripciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
     <Card key={tableKey}>
      <CardHeader style={{ backgroundColor: '#F3762B' }} className="text-white p-4 lg:p-6">
       <CardTitle className="text-lg lg:text-xl font-bold flex items-center">
          <FileText className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
          Inscripciones Registradas
        </CardTitle>
        <p className="text-orange-100 text-sm lg:text-base">
          Mostrando {startItem} - {endItem} de {totalItems} inscripciones
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {inscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay inscripciones
            </h3>
            <p className="text-gray-500">
              No se encontraron inscripciones registradas.
            </p>
          </div>
        ) : (
          <>

            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
             <Table className="min-w-full">
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#02549E' }}>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">ID</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Participante</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">CI/Pasaporte</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">País</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Profesión</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Curso</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Precio</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Fecha</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Estado</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap">Comprobante</TableHead>
                    <TableHead className="text-white font-semibold text-sm whitespace-nowrap text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscriptions.map((inscription, index) => (
                    <TableRow 
                      key={`inscription-${inscription.idInscripcion}-${inscription.participante.nombres}-${inscription.participante.apellidos}-${inscription.facturacion.razonSocial}`}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <TableCell className="font-medium">
                        #{inscription.idInscripcion}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {inscription.participante.nombres} {inscription.participante.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inscription.participante.correo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inscription.participante.numTelefono}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {inscription.participante.ciPasaporte}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {inscription.participante.pais}
                          </p>
                          <p className="text-sm text-gray-500">
                            {inscription.participante.ciudad}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {inscription.participante.profesion}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inscription.participante.institucion}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {inscription.curso.nombreCurso}
                          </p>
                          <p className="text-sm text-gray-500">
                            {inscription.curso.modalidad}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold" style={{ color: '#F3762B' }}>
                          ${inscription.curso.precio.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {inscriptionService.formatDate(inscription.fechaInscripcion)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inscription.estado)}
                      </TableCell>
                      <TableCell>
                        {inscription.comprobante ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 text-sm">✓ Subido</span>
                            {/* <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              title="Descargar comprobante"
                            >
                              <Download className="h-3 w-3" />
                            </Button> */}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin comprobante</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          {/* Botón Ver Detalles */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewDetails(inscription)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            style={{ color: '#0367A6' }}
                            title="Ver detalles completos"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* 🆕 BOTÓN EDITAR */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditInscription(inscription)}
                            disabled={!isEditable(inscription)}
                            className={`h-8 w-8 p-0 ${
                              isEditable(inscription)
                                ? 'hover:bg-orange-50 text-orange-600'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              isEditable(inscription)
                                ? 'Editar inscripción'
                                : 'Solo se pueden editar inscripciones pendientes'
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                           {/* 🆕 BOTÓN ELIMINAR */}
                              {userType === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onDeleteInscription(inscription)}
                                  disabled={!inscriptionService.isInscriptionDeletable(inscription)}
                                  className={`h-8 w-8 p-0 ${
                                    inscriptionService.isInscriptionDeletable(inscription)
                                      ? 'hover:bg-red-50 text-red-600'
                                      : 'text-gray-400 cursor-not-allowed'
                                  }`}
                                  title={
                                    inscriptionService.isInscriptionDeletable(inscription)
                                      ? 'Eliminar inscripción'
                                      : 'Solo se pueden eliminar inscripciones pendientes'
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista móvil - Cards */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {inscriptions.map((inscription) => (
                  <Card key={`mobile-${inscription.idInscripcion}`} className="border border-gray-200">
                    <CardContent className="p-4">
                  {/* Header con ID y Estado */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">#{inscription.idInscripcion}</span>
                    {getStatusBadge(inscription.estado)}
                  </div>
                  
                  {/* Información principal */}
                  <div className="space-y-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {inscription.participante.nombres} {inscription.participante.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600">{inscription.participante.correo}</p>
                    <p className="text-sm text-gray-600">CI: {inscription.participante.ciPasaporte}</p>
                  </div>
                  
                  {/* Curso y precio */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{inscription.curso.nombreCurso}</p>
                        <p className="text-xs text-gray-500">{inscription.curso.modalidad}</p>
                      </div>
                      <span className="font-semibold text-lg ml-2" style={{ color: '#F3762B' }}>
                        ${inscription.curso.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">País:</span> {inscription.participante.pais}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {inscriptionService.formatDate(inscription.fechaInscripcion)}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span> {inscription.participante.numTelefono}
                    </div>
                    <div>
                      <span className="font-medium">Profesión:</span> {inscription.participante.profesion}
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(inscription)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    
                    {isEditable(inscription) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditInscription(inscription)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                    
                    {userType === 'admin' && inscriptionService.isInscriptionDeletable(inscription) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteInscription(inscription)}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    )}
                    
                    {inscription.comprobante && inscription.comprobante.nombreArchivo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (inscription.comprobante?.nombreArchivo) {
                            const link = document.createElement('a');
                            link.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/comprobantes/download/${inscription.comprobante.nombreArchivo}`;
                            link.download = inscription.comprobante.nombreArchivo;
                            link.click();
                          }
                        }}
                        title="Descargar comprobante"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t gap-3">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Página {currentPage} de {totalPages} • Total: {totalItems} inscripciones
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  {/* Números de página */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => onPageChange(pageNum)}
                          className={currentPage === pageNum ? "bg-blue-600 text-white" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
