/**
 * Type definitions for test utilities
 * 
 * This file contains type definitions specifically used for testing
 * to ensure proper type checking in test files.
 */

import { NarrativeContextOptions } from './narrative/context.types';

/**
 * Interface for mocked useOptimizedNarrativeContext hook
 */
export interface MockOptimizedNarrativeContext {
  buildOptimizedContext: (options?: NarrativeContextOptions) => string;
  getDefaultContext: () => string;
  getFocusedContext: (focusTags: string[]) => string;
  getCompactContext: () => string;
}

/**
 * Interface for mocked useNarrativeContextSynchronization hook
 */
export interface MockNarrativeContextSynchronization {
  ensureFreshContext: () => Promise<unknown>;
}
