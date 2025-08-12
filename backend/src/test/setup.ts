import 'reflect-metadata';
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Global setup can be added here if needed
});

afterAll(async () => {
  // Global cleanup can be added here if needed
});