// Add React Testing Library setup
import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive component testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
};

// Mock localStorage but only if it hasn't been mocked yet
// This prevents conflicts with more specific mocks in tests
if (!window.localStorage) {
  class LocalStorageMock {
    constructor() {
      this.store = {};
    }

    clear() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = String(value);
    }

    removeItem(key) {
      delete this.store[key];
    }
  }

  // Apply storage mocks
  Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock(),
    writable: true
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: new LocalStorageMock(),
    writable: true
  });
}
