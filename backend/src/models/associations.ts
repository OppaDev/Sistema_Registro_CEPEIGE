export interface ModelosRelacionados {
  cursoConEstadisticas: {
    curso: Curso;
    totalInscripciones: number;
    totalMatriculados: number;
    ingresosTotales: number;
  };
  
  resumenPersona: {
    persona: DatosPersonales;
    cursosInscritos: number;
    cursosCompletados: number;
    totalPagado: number;
  };
  
  reporteFinanciero: {
    periodo: string;
    totalIngresos: number;
    totalFacturas: number;
    facturasPendientes: number;
    facturasVerificadas: number;
  };
}