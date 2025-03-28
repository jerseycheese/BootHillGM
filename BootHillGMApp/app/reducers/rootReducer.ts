import { GameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { GameEngineAction } from '../types/gameActions';
import { adaptEngineAction } from './gameActionsAdapter';
import { migrationAdapter, LegacyState } from '../utils/stateAdapters';
import { LocationType } from '../services/locationService';
import { SuggestedAction } from '../types/campaign';
import { InventoryItem } from '../types/item.types';
import { JournalEntry } from '../types/journal';

// Import all slice reducers
import { characterReducer } from './character/characterReducer';
import { combatReducer } from './combat/combatReducer';
import { inventoryReducer } from './inventory/inventoryReducer';
import { journalReducer } from './journal/journalReducer';
import { narrativeReducer } from './narrative/narrativeReducer';
import { uiReducer } from './ui/uiReducer';

// Import initial states
import {
  initialCharacterState,
  initialCombatState,
  initialInventoryState,
  initialJournalState,
  initialNarrativeState,
  initialUIState
} from '../types/state';

// Import type guards
import {
  isArray,
  hasCharacterSlice,
  hasCombatSlice,
  hasInventorySlice,
  hasJournalSlice,
  hasNarrativeSlice,
  hasUISlice,
  mapToTypedArray,
  safeGet
} from './utils/typeGuards';

/**
 * Custom type guard for checking if an action has a payload
 */
function hasPayload<T>(action: GameAction): action is GameAction & { payload: T } {
  return 'payload' in action && action.payload !== undefined;
}

/**
 * Root reducer that combines all slice reducers
 * 
 * This is the core of our Redux-like state management system.
 */
export function rootReducer(state: GameState, action: GameAction): GameState {
  if (!state) {
    // This should never happen in practice as we always provide an initial state
    throw new Error('State cannot be undefined');
  }

  // Transform any legacy state format to the new structure
  const normalizedState = ensureCompleteState(migrationAdapter.oldToNew(state));

  // Handle global state updates first
  const updatedGlobalState = handleGlobalActions(normalizedState, action);
  
  // Then delegate to slice reducers - being careful with null vs undefined
  const sliceUpdatedState = {
    ...updatedGlobalState,
    // Fix: Pass undefined if character is null, matching the characterReducer signature
    character: characterReducer(updatedGlobalState.character || undefined, action),
    combat: combatReducer(updatedGlobalState.combat, action),
    inventory: inventoryReducer(updatedGlobalState.inventory, action),
    journal: journalReducer(updatedGlobalState.journal, action),
    narrative: narrativeReducer(updatedGlobalState.narrative, action),
    ui: uiReducer(updatedGlobalState.ui, action),
  };
  
  return sliceUpdatedState;
}

/**
 * Ensures the state has all required properties with proper types
 */
function ensureCompleteState(state: Partial<GameState> | LegacyState): GameState {
  const completeState = {
    // Character slice
    character: hasCharacterSlice(state) ? state.character : initialCharacterState,
    
    // Combat slice
    combat: hasCombatSlice(state) ? state.combat : initialCombatState,
    
    // Inventory slice with proper types
    inventory: hasInventorySlice(state)
      ? state.inventory
      : {
          ...initialInventoryState,
          items: isArray(state.inventory)
            ? mapToTypedArray(state.inventory, item => item as unknown) as InventoryItem[]
            : []
        },
    
    // Journal slice with proper types
    journal: hasJournalSlice(state)
      ? state.journal
      : {
          ...initialJournalState,
          entries: isArray(state.journal)
            ? mapToTypedArray(state.journal, entry => entry as unknown) as JournalEntry[]
            : []
        },
    
    // Narrative slice
    narrative: hasNarrativeSlice(state) ? state.narrative : initialNarrativeState,
    
    // UI slice
    ui: hasUISlice(state) ? state.ui : initialUIState,
    
    // Global properties
    currentPlayer: safeGet<string>(state, 'currentPlayer', ''),
    npcs: safeGet<string[]>(state, 'npcs', []),
    location: safeGet<LocationType | null>(state, 'location', null),
    quests: safeGet<string[]>(state, 'quests', []),
    gameProgress: safeGet<number>(state, 'gameProgress', 0),
    savedTimestamp: safeGet<number | undefined>(state, 'savedTimestamp', undefined),
    isClient: safeGet<boolean | undefined>(state, 'isClient', undefined),
    suggestedActions: safeGet<SuggestedAction[]>(state, 'suggestedActions', []),
    
    // Required getters for GameState interface
    get player() {
      return this.character?.player || null;
    },
    get opponent() {
      // Since we can't make this property an accessor getter in the interface,
      // we need to rely on the character.opponent property
      return this.character?.opponent || null;
    },
    get isCombatActive() {
      return this.combat?.isActive || false;
    }
  };
  
  return completeState;
}

/**
 * Handle global actions that don't belong to any specific slice
 */
function handleGlobalActions(state: GameState, action: GameAction): GameState {
  // Use string comparison instead of strict type checking
  const actionType = action.type as string;

  // SET_PLAYER
  if (actionType === 'SET_PLAYER') {
    if (hasPayload<string>(action)) {
      return { ...state, currentPlayer: action.payload };
    }
  }
  
  // ADD_NPC
  else if (actionType === 'ADD_NPC') {
    if (hasPayload<string>(action)) {
      return { ...state, npcs: [...state.npcs, action.payload] };
    }
  }
  
  // SET_LOCATION
  else if (actionType === 'SET_LOCATION') {
    if (hasPayload<LocationType>(action)) {
      return { ...state, location: action.payload };
    }
  }
  
  // ADD_QUEST
  else if (actionType === 'ADD_QUEST') {
    if (hasPayload<string>(action)) {
      return { ...state, quests: [...state.quests, action.payload] };
    }
  }
  
  // SET_GAME_PROGRESS
  else if (actionType === 'SET_GAME_PROGRESS') {
    if (hasPayload<number>(action)) {
      return { ...state, gameProgress: action.payload };
    }
  }
  
  // SET_SAVED_TIMESTAMP
  else if (actionType === 'SET_SAVED_TIMESTAMP') {
    if (hasPayload<number>(action)) {
      return { ...state, savedTimestamp: action.payload };
    }
  }
  
  // SET_SUGGESTED_ACTIONS
  else if (actionType === 'SET_SUGGESTED_ACTIONS') {
    if (hasPayload<SuggestedAction[]>(action)) {
      return { ...state, suggestedActions: action.payload };
    }
  }
  
  // SET_STATE
  else if (actionType === 'SET_STATE') {
    if (hasPayload<Record<string, unknown>>(action)) {
      const payload = action.payload;
      return {
        ...state,
        currentPlayer: safeGet<string>(payload, 'currentPlayer', state.currentPlayer),
        npcs: safeGet<string[]>(payload, 'npcs', state.npcs),
        location: safeGet<LocationType | null>(payload, 'location', state.location),
        quests: safeGet<string[]>(payload, 'quests', state.quests),
        gameProgress: safeGet<number>(payload, 'gameProgress', state.gameProgress),
        savedTimestamp: safeGet<number | undefined>(payload, 'savedTimestamp', state.savedTimestamp),
        isClient: safeGet<boolean | undefined>(payload, 'isClient', state.isClient),
        suggestedActions: safeGet<SuggestedAction[]>(payload, 'suggestedActions', state.suggestedActions),
      };
    }
  }
  
  // Default case: return state as is
  return state;
}

/**
 * Root reducer that works with GameEngineAction
 * This is a compatibility layer for legacy code
 */
export function gameEngineReducer(state: GameState, action: GameEngineAction): GameState {
  // Convert GameEngineAction to GameAction
  const adaptedAction = adaptEngineAction(action);
  
  // Call the regular rootReducer with the adapted action
  return rootReducer(state, adaptedAction);
}

// Default export for compatibility with existing imports
export default rootReducer;
