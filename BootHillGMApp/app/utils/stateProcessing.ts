import { ExtendedGameState } from '../types/extendedState';
import { GameEngineAction } from '../types/gameActions';
import { GameAction } from '../types/actions';
import { inventoryReducer } from '../reducers/inventory/inventoryReducer';
import { journalReducer } from '../reducers/journal/journalReducer';
import { JournalState } from '../types/state/journalState';

/**
 * Processes inventory state updates while maintaining backward compatibility
 * This ensures that both the domain-slice structure (inventory.items) and 
 * legacy flat structure (inventory as array) are properly updated
 */
export const processInventoryState = (state: ExtendedGameState, action: GameEngineAction): ExtendedGameState => {
  // Get the updated inventory slice - use type assertion to cast action to GameAction
  const inventorySlice = inventoryReducer(state.inventory, action as unknown as GameAction);
  
  // Create a new state with the updated inventory slice
  const newState: ExtendedGameState = {
    ...state,
    inventory: inventorySlice
  };
  
  return newState;
};

/**
 * Processes journal state updates while maintaining backward compatibility
 * This ensures that both the domain-slice structure (journal.entries) and
 * legacy flat structures (journal as array, entries as array) are properly updated
 */
export const processJournalState = (state: ExtendedGameState, action: GameEngineAction): ExtendedGameState => {
  // Get the updated journal slice - use type assertion to cast action to GameAction
  const journalSlice = journalReducer(state.journal, action as unknown as GameAction);
  
  // Create a new state with the updated journal slice
  const newState: ExtendedGameState = {
    ...state,
    journal: journalSlice
  };
  
  // For backward compatibility - expose journal entries at root level
  if ((journalSlice as JournalState).entries) {
    newState.entries = (journalSlice as JournalState).entries;
  }
  
  return newState;
};
