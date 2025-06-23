module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', 
    },
   
    testMatch: ['**/src/**/*.test.ts'], 
    collectCoverage: true, 
    coverageDirectory: 'coverage', 
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'], 
    clearMocks: true, 
};