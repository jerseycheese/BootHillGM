/**
 * State Testing Utilities
 * 
 * Helper functions for testing with the new state architecture and adapters.
 */
import { GameState } from '../../../types/gameState';
import { GameEngineAction } from '../../../types/gameActions';
import { adaptStateForTests, migrationAdapter, LegacyState } from '../../../utils/stateAdapters';
import { InventoryItem } from '../../../types/item.types';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';
import { StateReducer } from './types';
import { convertToAppJournalEntries, adaptInventoryForTesting, adaptJournalForTesting } from './adapters';

/**
 * Prepares an initial state for testing with adapters applied
 * 
 * This utility is particularly useful in test setups where you want to
 * start with a specific state shape, but need backward compatibility.
 * 
 * @param state The initial state to prepare
 * @returns The adapted state ready for testing
 */
export const prepareStateForTesting = (state: Partial<GameState>): GameState => {
  // Ensure it's in the new format first
  const normalizedState = migrationAdapter.oldToNew(state as GameState);
  
  // Then apply adapters for test compatibility
  const adaptedState = adaptStateForTests(normalizedState as GameState);
  
  // Apply specific adapters for inventory and journal
  const adaptedWithInventory = adaptInventoryForTesting(adaptedState);
  const fullyAdapted = adaptJournalForTesting(adaptedWithInventory);
  
  return fullyAdapted;
};

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
export const applyReducerForTesting = (
  reducer: StateReducer,
  state: Partial<GameState>,
  action: GameEngineAction
): Partial<GameState> => {
  // Special handling for specific reducer tests
  let inputState = state;
  
  // If we're testing inventory reducer specifically
  if (action.type.includes('inventory/') || action.type.includes('INVENTORY')) {
    // If the state already has an inventory object with items, use that
    if (state.inventory && !Array.isArray(state.inventory) && state.inventory.items) {
      inputState = {
        ...state,
        inventory: {
          ...state.inventory
        }
      };
    }
    // If legacy array format, convert it
    else if (Array.isArray(state.inventory)) {
      inputState = {
        ...state,
        inventory: {
          items: [...state.inventory] as InventoryItem[]
        }
      };
    }
  }
  
  // If we're testing journal reducer specifically
  if (action.type.includes('journal/') || action.type.includes('JOURNAL')) {
    // If journal is an array (very old format)
    if (Array.isArray(state.journal)) {
      inputState = {
        ...state,
        journal: {
          entries: convertToAppJournalEntries([...state.journal])
        }
      };
      
      // Also store in legacy format
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = 
        convertToAppJournalEntries([...state.journal]);
    }
    // If the state has journal object with entries array, use that
    else if (state.journal && state.journal.entries) {
      inputState = {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries]
        }
      };
      
      // Ensure entries at root level for backward compatibility
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = 
        [...state.journal.entries];
    }
    // If legacy format with entries at root
    else if ((state as unknown as { entries?: AppJournalEntry[] }).entries && 
             Array.isArray((state as unknown as { entries?: AppJournalEntry[] }).entries)) {
      const legacyEntries = (state as unknown as { entries: AppJournalEntry[] }).entries;
      
      inputState = {
        ...state,
        journal: {
          entries: [...legacyEntries]
        }
      };
      
      // Maintain entries at root for backward compatibility
      (inputState as unknown as { entries: AppJournalEntry[] }).entries = [...legacyEntries];
    }
  }

  // Apply the reducer
  const reducerResult = reducer(inputState, action);
  
  // Special post-processing for journal actions
  if (action.type.includes('journal/') || action.type.includes('JOURNAL')) {
    // Ensure journal entries are properly reflected at both levels
    if (reducerResult.journal && reducerResult.journal.entries) {
      (reducerResult as unknown as { entries: AppJournalEntry[] }).entries = 
        [...reducerResult.journal.entries];
    } 
    else if ((reducerResult as unknown as { entries?: AppJournalEntry[] }).entries && 
             Array.isArray((reducerResult as unknown as { entries: AppJournalEntry[] }).entries)) {
      const legacyEntries = (reducerResult as unknown as { entries: AppJournalEntry[] }).entries;
      
      if (!reducerResult.journal) {
        reducerResult.journal = { entries: [] as AppJournalEntry[] };
      }
      
      reducerResult.journal = {
        ...reducerResult.journal,
        entries: [...legacyEntries]
      };
    }
  }
  
  // Apply adapters for tests
  const adaptedState = adaptStateForTests(reducerResult as GameState);
  
  // Final adjustment for array access patterns
  const adaptedWithInventory = adaptInventoryForTesting(adaptedState);
  const fullyAdapted = adaptJournalForTesting(adaptedWithInventory);
  
  return fullyAdapted;
};

/**
 * Creates a wrapped reducer function that handles state adapters automatically
 * 
 * @param reducer The original reducer function
 * @returns A wrapped reducer that applies adapters
 */
export const createTestReducer = <T extends Partial<GameState>>(
  reducer: (state: T, action: GameEngineAction) => T
) => {
  return (state: T, action: GameEngineAction): T => {
    // Ensure state is in the new format
    const normalizedState = migrationAdapter.oldToNew(state as unknown as GameState | LegacyState);
    
    // Apply the original reducer
    const newState = reducer(normalizedState as unknown as T, action);
    
    // Apply adapters for backward compatibility
    const adaptedState = adaptStateForTests(newState as unknown as GameState);
    
    // Return as the expected type
    return adaptedState as unknown as T;
  };
};

// Export mockStates from here to avoid circular dependency issue
export { mockStates } from './mockStates';

// Export types and adapters
export * from './types';
export * from './adapters';
export * from './jestMatchers';