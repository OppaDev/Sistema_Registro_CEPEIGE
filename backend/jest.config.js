// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Match both unit tests (.test.ts) and integration tests (.integration.ts)
    testMatch: ['**/src/**/*.test.ts', '**/src/**/*.integration.ts'],
    
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
    clearMocks: true,
    
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    
    // Test timeout for integration tests (30 seconds)
    testTimeout: 30000,

    // Run integration tests in band to avoid database conflicts
    runner: process.env.NODE_ENV === 'test' ? 'jest-runner' : undefined,

    // 📌 Reporteros adicionales
    reporters: [
        "default",
        ["jest-html-reporter", {
            pageTitle: "Informe de Pruebas Jest",
            outputPath: "reportes/test-report.html",
            includeFailureMsg: true,
            includeConsoleLog: true,
            theme: "defaultTheme"
        }],
        ["jest-junit", {
            outputDirectory: "reportes",
            outputName: "junit.xml"
        }]
    ]
};
