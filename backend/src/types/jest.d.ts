/// <reference types="jest" />

// Este archivo ayuda a TypeScript a reconocer los tipos globales de Jest
declare global {
  const describe: typeof import('jest').describe;
  const test: typeof import('jest').test;
  const it: typeof import('jest').it;
  const expect: typeof import('jest').expect;
  const beforeAll: typeof import('jest').beforeAll;
  const beforeEach: typeof import('jest').beforeEach;
  const afterAll: typeof import('jest').afterAll;
  const afterEach: typeof import('jest').afterEach;
}

export {};
