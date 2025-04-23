// Import required types and initial state
import { GameState, initialGameState } from '../types/gameState';

// Queue management and locks
const operationQueues: Record<string, Array<() => Promise<unknown>>> = {};
const locks: Record<string, boolean> = {};

/**
 * Persists the game state to localStorage
 * 
 * @param state The game state to persist
 */
export function persistState(state: GameState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('bhgm-game-state', serializedState);
  } catch (error) {
    console.error('Failed to persist state:', error);
  }
}

/**
 * Loads the persisted game state from localStorage
 * 
 * @returns The loaded state or initial state if none exists
 */
export function loadPersistedState(): GameState {
  try {
    const serializedState = localStorage.getItem('bhgm-game-state');
    return serializedState ? JSON.parse(serializedState) : initialGameState;
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    return initialGameState;
  }
}

/**
 * Creates a state protection handler for a specific domain
 * 
 * @param domain The domain name for the protection
 * @param initialState The initial state for the domain
 * @returns State protection handler functions
 */
export function createStateProtection<T>(domain: string, initialState: T) {
  const storageKey = `bhgm-${domain}-state`;
  
  return {
    saveState: (state: T): void => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error(`[${domain}] Failed to save state:`, error);
      }
    },
    
    loadState: (): T => {
      try {
        const serializedState = localStorage.getItem(storageKey);
        if (serializedState) {
          return JSON.parse(serializedState);
        }
      } catch (error) {
        console.error(`[${domain}] Failed to load state:`, error);
      }
      return initialState;
    },
    
    clearState: (): void => {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error(`[${domain}] Failed to clear state:`, error);
      }
    }
  };
}

/**
 * Executes an operation with state protection
 * Prevents concurrent operations on the same key and handles timeouts
 * 
 * @param key The protection key
 * @param operation The operation to execute
 * @param options Additional options
 * @returns Promise resolving to the operation result
 */
export async function withProtection<T>(
  key: string, 
  operation: () => Promise<T>,
  options: { timeout?: number } = {}
): Promise<T> {
  // Initialize queue if it doesn't exist
  if (!operationQueues[key]) {
    operationQueues[key] = [];
  }
  
  // Create a promise that will resolve when the operation completes
  return new Promise<T>((resolve, reject) => {
    // Create a function to execute the operation
    const executeOperation = async () => {
      // Set lock to prevent concurrent operations
      locks[key] = true;
      
      try {
        // Create timeout promise if timeout is specified
        let timeoutId: NodeJS.Timeout | undefined;
        let timeoutPromise: Promise<never> | undefined;
        
        if (options.timeout) {
          timeoutPromise = new Promise<never>((_, timeoutReject) => {
            timeoutId = setTimeout(() => {
              timeoutReject(new Error(`Operation on ${key} timed out after ${options.timeout}ms`));
            }, options.timeout);
          });
        }
        
        // Execute operation with timeout if specified
        const result = await (timeoutPromise
          ? Promise.race([operation(), timeoutPromise])
          : operation());
        
        // Clear timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        resolve(result as T);
      } catch (error) {
        reject(error);
      } finally {
        // Release lock
        locks[key] = false;
        
        // Execute next operation in queue if any
        if (operationQueues[key].length > 0) {
          const nextOperation = operationQueues[key].shift();
          if (nextOperation) {
            nextOperation();
          }
        }
      }
    };
    
    // If key is locked, add operation to queue
    if (locks[key]) {
      operationQueues[key].push(executeOperation);
    } else {
      // Otherwise execute immediately
      executeOperation();
    }
  });
}

/**
 * Clears the queue for a specific key
 * 
 * @param key The key to clear the queue for
 */
export function clearQueue(key: string): void {
  if (operationQueues[key]) {
    operationQueues[key] = [];
  }
}

// Create an object containing all functions
const stateProtectionUtils = {
  persistState,
  loadPersistedState,
  createStateProtection,
  withProtection,
  clearQueue
};

// Export the named object as default
export default stateProtectionUtils;