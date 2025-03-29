/**
 * Type definitions for testing utilities
 */

// Type for mocked properties on the global fetch function
export interface FetchMockProperties {
  _mockImplementationCallCount: number;
  _mockRejectedValueOnce: boolean;
  mock?: {
    calls: Array<unknown[]>;
    instances: unknown[];
    invocationCallOrder: number[];
    results: Array<{ type: string; value: unknown }>;
  };
}

// Type for AbortSignal.timeout mock
export interface AbortSignalTimeoutMock {
  (): AbortSignal;
  mockReturnValue: (value: unknown) => AbortSignalTimeoutMock;
}

// Type for a generic mock function
export interface MockFunction<T, R> {
  (...args: T[]): R;
  mock?: {
    calls: Array<T[]>;
    instances: R[];
    invocationCallOrder: number[];
    results: Array<{ type: string; value: R }>;
  };
}

// Type for service error objects
export interface ServiceError {
  code: string;
  message: string;
  retryable?: boolean;
}
