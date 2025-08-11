import { CursoMoodleService } from './cursoMoodle.service';

// Mock PrismaClient directamente sin variables externas
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    curso: {
      findUnique: jest.fn(),
    },
    cursoMoodle: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  })),
}));

// Mock del mapper
jest.mock('@/api/services/mappers/integrationMapper/cursoMoodle.mapper', () => ({
  toCursoMoodleResponseDto: jest.fn(),
  toCursoMoodleWithCursoDto: jest.fn(),
}));

// Mock del logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CursoMoodleService', () => {
  let service: CursoMoodleService;

  beforeEach(() => {
    service = new CursoMoodleService();
    jest.clearAllMocks();
  });

  describe('Instanciación', () => {
    // SRV-CM-001: Verificar que el servicio se puede instanciar
    it('SRV-CM-001: debe instanciar el servicio correctamente', () => {
      expect(service).toBeInstanceOf(CursoMoodleService);
      expect(service.createCursoMoodle).toBeDefined();
      expect(service.getAllCursosMoodle).toBeDefined();
      expect(service.getCursoMoodleByIdCurso).toBeDefined();
      expect(service.updateCursoMoodle).toBeDefined();
      expect(service.deleteCursoMoodle).toBeDefined();
    });
  });

  // Test simple que no requiere interacción con DB
  describe('Métodos públicos', () => {
    it('SRV-CM-002: debe tener todos los métodos públicos definidos', () => {
      expect(typeof service.createCursoMoodle).toBe('function');
      expect(typeof service.getAllCursosMoodle).toBe('function');
      expect(typeof service.getCursoMoodleByIdCurso).toBe('function');
      expect(typeof service.updateCursoMoodle).toBe('function');
      expect(typeof service.deleteCursoMoodle).toBe('function');
      expect(typeof service.existeIntegracionMoodle).toBe('function');
      expect(typeof service.obtenerMoodleCursoId).toBe('function');
    });
  });
});