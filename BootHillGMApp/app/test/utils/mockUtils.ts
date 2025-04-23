interface MockFunction {
  (...args: any[]): any;
  calls: any[][];
  returnValue: any;
  mockReturnValue(value: any): MockFunction;
  mockImplementation(implementation: (...args: any[]) => any): MockFunction;
  mockResolvedValue(value: any): MockFunction;
}


/**
 * Mock Utilities
 * 
 * Browser-compatible mock function implementations
 * that can be used in both test and browser environments.
 */

/**
 * Creates a mock function that behaves like jest.fn() but works in browser
 */
export function createMockFn(): MockFunction {
  // Function that can be called like a mock but works in browser too
  const fn = (function(...args: any[]): any {
      if (typeof fn.calls !== 'undefined') {
        fn.calls.push(args);
      }
      return fn.returnValue;
    }) as MockFunction;
  
  // Add mock-like properties
  fn.calls = [] as any[][];
  fn.returnValue = undefined;
  
  // Add mock-like methods that work in browser
  fn.mockReturnValue = function(value: any) {
    fn.returnValue = value;
    return fn;
  };
  
  fn.mockImplementation = function(implementation: (...args: any[]) => any): MockFunction {
    const originalFn = fn;
    const newFn = function(...args: any[]) {
      if (typeof newFn.calls !== 'undefined') {
        newFn.calls.push(args);
      }
      return implementation(...args);
    };
    newFn.calls = originalFn.calls;
    newFn.returnValue = originalFn.returnValue;
    newFn.mockReturnValue = originalFn.mockReturnValue;
    newFn.mockImplementation = originalFn.mockImplementation;
    newFn.mockResolvedValue = originalFn.mockResolvedValue;
    return newFn as MockFunction;
  };
  
  fn.mockResolvedValue = function(value: any) {
    return fn.mockImplementation(() => Promise.resolve(value));
  };
  
  return fn;
}

/**
 * Creates a mock object with the specified methods and return values
 */
export function createMockObject<T extends Record<string, any>>(
  methods: Record<keyof T, any>
): T {
  const mockObj = {} as Record<string, any>;
  
  for (const key in methods) {
    if (typeof methods[key] === 'function') {
      mockObj[key] = createMockFn().mockImplementation(methods[key] as (...args: any[]) => any);
    } else {
      mockObj[key] = createMockFn().mockReturnValue(methods[key]);
    }
  }
  
  return mockObj as T;
}

/**
 * Mock localStorage implementation for testing
 */
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: createMockFn().mockImplementation((key: string) => store[key] || null),
    setItem: createMockFn().mockImplementation((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: createMockFn().mockImplementation((key: string) => {
      delete store[key];
    }),
    clear: createMockFn().mockImplementation(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: createMockFn().mockImplementation((index: number) => 
      Object.keys(store)[index] || null
    ),
  };
};