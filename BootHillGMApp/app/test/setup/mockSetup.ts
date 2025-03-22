import { createMockLocalStorage } from '../utils/localStorageMock';

let mockRouterPush: jest.Mock;

export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();

  // Instead of using spyOn which is causing the error, replace the object directly
  const mockLocalStorage = createMockLocalStorage();
  
  // Replace the existing localStorage instead of trying to spy on it
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return { mockPush: mockRouterPush, mockCleanupState, mockLocalStorage };
};