import { createMockLocalStorage } from '../utils/localStorageMock';

let mockRouterPush: jest.Mock;

export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();

  const mockLocalStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return { mockPush: mockRouterPush, mockCleanupState, mockLocalStorage };
};