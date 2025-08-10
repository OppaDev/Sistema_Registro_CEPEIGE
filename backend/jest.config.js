// jest.config.js
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
