import { mockLocalStorage } from '../utils/mockLocalStorage';

let mockRouterPush: jest.Mock;

export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();
  
  // Set up localStorage mock properly
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return { mockPush: mockRouterPush, mockCleanupState, mockLocalStorage };
};