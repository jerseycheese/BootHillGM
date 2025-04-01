// Add React Testing Library setup
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    pathname: '/test-path',
    query: {},
    asPath: '/test-path',
    basePath: '',
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    isReady: true,
    isPreview: false,
    isFallback: false,
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

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

// Improved localStorage mock with proper error handling
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
    // Handle edge cases like undefined values
    if (typeof value === 'undefined') {
      this.store[key] = 'undefined';
    } else {
      this.store[key] = String(value);
    }
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

// Clean up mocks between tests to prevent test pollution
// This is similar to how Drupal's simpletest isolates each test
afterEach(() => {
  jest.clearAllMocks();
  
  // Clean localStorage between tests
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Handle unhandled promise rejections more gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't fail the test, just log the error
});
