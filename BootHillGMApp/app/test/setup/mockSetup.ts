import { createMockLocalStorage } from '../utils/localStorageMock';

let mockRouterPush: jest.Mock;

export const setupMocks = () => {
  mockRouterPush = jest.fn();
  const mockCleanupState = jest.fn();

  const mockLocalStorage = createMockLocalStorage();
  jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => mockLocalStorage);

  return { mockPush: mockRouterPush, mockCleanupState, mockLocalStorage };
};