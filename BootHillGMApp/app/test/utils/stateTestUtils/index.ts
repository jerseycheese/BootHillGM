/**
 * State Testing Utilities
 * 
 * Helper functions for testing with the new state architecture and adapters.
 */
// Removed unused imports: GameState, GameEngineAction, InventoryItem, AppJournalEntry, StateReducer
// Removed unused imports: convertToAppJournalEntries, adaptInventoryForTesting, adaptJournalForTesting

/**
 * Prepares an initial state for testing with adapters applied
 * 
 * This utility is particularly useful in test setups where you want to
 * start with a specific state shape, but need backward compatibility.
 * 
 * @param state The initial state to prepare
 * @returns The adapted state ready for testing
 */
// Removed obsolete function: prepareStateForTesting
/**
 * Applies a reducer and adapts the resulting state for testing
 * 
 * This is useful when testing reducers directly, ensuring that
 * the state they receive and return is correctly adapted.
 * 
 * @param reducer The reducer to test
 * @param state The current state
 * @param action The action to dispatch
 * @returns The adapted resulting state
 */
// Removed obsolete function: applyReducerForTesting
/**
 * Creates a wrapped reducer function that handles state adapters automatically
 * 
 * @param reducer The original reducer function
 * @returns A wrapped reducer that applies adapters
 */
// Removed obsolete function: createTestReducer
// Export mockStates from here to avoid circular dependency issue
export { mockStates } from './mockStates';

// Export types and adapters
export * from './types';
export * from './adapters';
export * from './jestMatchers';