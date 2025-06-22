module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', 
    },
    // testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'], // Patrón por defecto
    testMatch: ['**/src/**/*.test.ts'], // Para encontrar los .test.ts dentro de src
    collectCoverage: true, // Habilitar recolección de cobertura
    coverageDirectory: 'coverage', // Directorio para los reportes de cobertura
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'], // Formatos de reporte, 'cobertura' es útil para SonarQube
    // setupFilesAfterEnv: ['./jest.setup.js'], // Si necesitas setup global (ej. para mocks de Prisma globales)
    clearMocks: true, // Limpia mocks automáticamente antes de cada test
};