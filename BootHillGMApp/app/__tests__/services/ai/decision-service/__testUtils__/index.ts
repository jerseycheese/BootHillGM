// Re-export all test utilities from this directory
import * as mockDataExports from './mockData';
import * as mockDependenciesExports from './mockDependencies';
import * as testSetupExports from './testSetup';

// Export with namespaces to avoid naming conflicts
export const mockData = mockDataExports;
export const mockDependencies = mockDependenciesExports;
export const testSetup = testSetupExports;
