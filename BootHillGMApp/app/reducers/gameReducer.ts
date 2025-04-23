/**
 * Game Reducer
 * 
 * Root reducer that combines all domain-specific reducers
 * to create a unified game state system.
 * 
 * This is the main entry point for state changes in the application,
 * orchestrating how various domain-specific reducers handle their
 * respective parts of the state tree.
 */

import { GameState, initialGameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { ActionTypes } from '../types/actionTypes';
import { mapLegacyActionType } from './utils/reducerUtils';
import { persistState, loadPersistedState } from '../utils/stateProtection';

// Import domain-specific reducers
import { characterReducer } from './domain/characterReducer';
import { combatReducer } from './domain/combatReducer';
import { inventoryReducer } from './domain/inventoryReducer';
import { journalReducer } from './domain/journalReducer';
import { narrativeReducer } from './domain/narrativeReducer';
import { gameStateReducer } from './domain/gameReducer';
import { 
  loreReducer, 
  uiReducer, 
  errorReducer, 
  decisionReducer, 
  storyReducer 
} from './domain/placeholderReducers';

// Import CharacterAction from the direct source
import { CharacterAction } from '../types/actions/characterActions';

/**
 * Process action through domain-specific reducers
 * 
 * @param state Current game state
 * @param action Action to process
 * @returns Updated game state
 */
function processDomainReducers(state: GameState, action: GameAction): GameState {
  // Create new state object to avoid mutation
  let newState = { ...state };
  
  // Character state updates
  if (action.type.startsWith('character/')) {
    // Use type assertion to convert to the correct CharacterAction type
    newState = characterReducer(newState, action as unknown as CharacterAction);
  }
  
  // Combat state updates
  if (action.type.startsWith('combat/')) {
    newState = combatReducer(newState, action);
  }
  
  // Inventory state updates
  if (action.type.startsWith('inventory/')) {
    newState = inventoryReducer(newState, action);
  }
  
  // Journal state updates
  if (action.type.startsWith('journal/')) {
    newState = journalReducer(newState, action);
  }
  
  // Narrative state updates
  if (action.type.startsWith('narrative/')) {
    newState = narrativeReducer(newState, action);
  }
  
  // Game-specific state updates
  if (action.type.startsWith('game/')) {
    newState = gameStateReducer(newState, action);
  }
  
  // Lore state updates
  if (action.type.startsWith('lore/')) {
    newState = loreReducer(newState);
  }
  
  // UI state updates
  if (action.type.startsWith('ui/')) {
    newState = uiReducer(newState);
  }
  
  // Error state updates
  if (action.type.startsWith('error/')) {
    newState = errorReducer(newState);
  }
  
  // Decision state updates
  if (action.type.startsWith('decision/')) {
    newState = decisionReducer(newState);
  }
  
  // Story progression updates
  if (action.type.startsWith('story/')) {
    newState = storyReducer(newState);
  }
  
  return newState;
}

/**
 * Root reducer that handles all game state changes
 * 
 * @param state Current game state
 * @param action Action to process
 * @returns Updated game state
 */
export function gameReducer(state: GameState = initialGameState, action: GameAction): GameState {
  // Handle legacy string action types by mapping them to ActionTypes constants
  const actionType = mapLegacyActionType(action.type);
  const updatedAction = { ...action, type: actionType } as GameAction;
  
  // Special global actions that operate on the entire state tree
  switch (updatedAction.type) {
    case ActionTypes.SET_STATE:
      return updatedAction.payload as GameState;
      
    case ActionTypes.RESET_STATE:
      return initialGameState;
      
    case ActionTypes.SAVE_GAME:
      // Persist the current state (handled as a side effect)
      persistState(state);
      return {
        ...state,
        meta: {
          ...(state.meta || {}),
          savedAt: Date.now()
        }
      };
      
    case ActionTypes.LOAD_GAME: {
      // Load persisted state (handled as a side effect)
      const loadedState = loadPersistedState();
      return loadedState;
    }
      
    default:
      // For all other actions, process through domain-specific reducers
      return processDomainReducers(state, updatedAction);
  }
}
