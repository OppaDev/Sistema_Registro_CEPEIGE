/**
 * Integration Tests Index File
 * 
 * This file serves as an entry point for all integration tests
 * and provides utilities for running the complete test suite.
 */

export * from './auth.integration';
export * from './usuarios.integration';
export * from './cursos.integration';
export * from './inscription-flow.integration';
export * from './informes.integration';

/**
 * Test Categories covered:
 * 
 * 1. Authentication (INT-AUTH-001 to INT-AUTH-007)
 *    - Login with valid/invalid credentials
 *    - Token refresh functionality  
 *    - Profile retrieval
 *    - Authorization checks
 * 
 * 2. User Management (INT-USR-001 to INT-USR-007)
 *    - CRUD operations for users
 *    - Role-based access control
 *    - Validation and error handling
 * 
 * 3. Course Management (INT-CUR-001 to INT-CUR-007)
 *    - Course creation with validation
 *    - Available courses endpoint
 *    - Course updates and deletion
 *    - Integration with Moodle/Telegram triggers
 * 
 * 4. Complete Inscription Flow (INT-FLOW-001 to INT-FLOW-007)
 *    - End-to-end enrollment process
 *    - Personal data → Billing → Voucher → Inscription → Invoice → Verification → Enrollment
 *    - Error handling and authorization
 * 
 * 5. Reports (INT-INF-001 to INT-INF-006)
 *    - Data retrieval with filters
 *    - Excel and PDF report generation
 *    - Summary statistics calculation
 */