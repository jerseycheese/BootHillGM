/**
 * Root Reducer
 * 
 * Combines all slice reducers into a single unified reducer
 */

import { GameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { handleSetCharacter, handleUpdateCharacter, handleSetOpponent, CharacterPayload, UpdateCharacterPayload, OpponentPayload } from './characterReducer';
import { handleSetCombatActive, handleUpdateCombatState, handleSetCombatType, handleEndCombat } from './combatReducer';
import inventoryReducer from './inventoryReducer';
import journalReducer from './journalReducer';
import { narrativeReducer } from './narrativeReducer';
import uiReducer from './uiReducer';
import { initialUIState } from '../types/state/uiState';
import { initialCombatState } from '../types/state/combatState';
import { ExtendedGameState } from '../types/extendedState';
import { LocationType } from '../services/locationService';
import { SuggestedAction } from '../types/campaign';
import { NarrativeAction } from '../types/narrative.types';
import { CharacterState } from '../types/state';

/**
 * Safe helper to check if an action is of a specific type
 */
function isActionType(action: GameAction, type: string | string[]): boolean {
  if (Array.isArray(type)) {
    return type.includes(action.type);
  }
  return action.type === type;
}

/**
 * Custom action type for NO_OP that can work with narrative reducer
 */
const NO_OP_ACTION: NarrativeAction = {
  type: 'ADD_NARRATIVE_HISTORY',
  payload: ''
};

// Create a null character state to use as a default
const NULL_CHARACTER_STATE: CharacterState = {
  player: null,
  opponent: null
};

/**
 * Character reducer - adapter for existing handler functions
 * Uses a wrapper pattern to safely convert state types
 */
const characterReducer = (state: CharacterState | null = null, action: GameAction): CharacterState | null => {
  if (!action) return state;
  
  // Use null or the actual state, preventing the type error
  const safeState = state || NULL_CHARACTER_STATE;
  
  if (isActionType(action, ['character/SET_CHARACTER', 'SET_CHARACTER']) && 'payload' in action) {
    // Create a mock ExtendedGameState just for the handler
    const mockState = { character: safeState } as ExtendedGameState;
    return handleSetCharacter(mockState, action.payload as CharacterPayload).character;
  }
  
  if (isActionType(action, ['character/UPDATE_CHARACTER', 'UPDATE_CHARACTER']) && 'payload' in action) {
    // Create a mock ExtendedGameState just for the handler
    const mockState = { character: safeState } as ExtendedGameState;
    return handleUpdateCharacter(mockState, action.payload as UpdateCharacterPayload).character;
  }
  
  if (isActionType(action, ['character/SET_OPPONENT', 'SET_OPPONENT']) && 'payload' in action) {
    // Create a mock ExtendedGameState just for the handler
    const mockState = { character: safeState } as ExtendedGameState;
    return handleSetOpponent(mockState, action.payload as OpponentPayload).character;
  }
  
  return state;
};

/**
 * Combat reducer - adapter for existing handler functions
 */
const combatReducer = (state = initialCombatState, action: GameAction) => {
  if (!action) return state;
  
  // Create a safe wrapper state that matches what the handler expects
  const wrapState = { combat: state };
  
  if (isActionType(action, ['combat/SET_COMBAT_ACTIVE', 'SET_COMBAT_ACTIVE']) && 'payload' in action) {
    return handleSetCombatActive(
      wrapState as ExtendedGameState, 
      action.payload as boolean
    ).combat;
  }
  
  if (isActionType(action, ['combat/UPDATE_COMBAT_STATE', 'UPDATE_COMBAT_STATE']) && 'payload' in action) {
    return handleUpdateCombatState(
      wrapState as ExtendedGameState, 
      action.payload
    ).combat;
  }
  
  if (isActionType(action, ['combat/SET_COMBAT_TYPE', 'SET_COMBAT_TYPE']) && 'payload' in action) {
    return handleSetCombatType(
      wrapState as ExtendedGameState, 
      action.payload as 'brawling' | 'weapon' | null
    ).combat;
  }
  
  if (isActionType(action, ['combat/END_COMBAT', 'END_COMBAT'])) {
    return handleEndCombat(wrapState as ExtendedGameState).combat;
  }
  
  return state;
};

// Individual handlers for top-level state properties
const handleCurrentPlayer = (state = '', action: GameAction): string => {
  if (isActionType(action, 'SET_PLAYER') && 'payload' in action) {
    return action.payload as string;
  }
  return state;
};

const handleNpcs = (state: string[] = [], action: GameAction): string[] => {
  if (isActionType(action, 'ADD_NPC') && 'payload' in action) {
    return [...state, action.payload as string];
  }
  return state;
};

const handleLocation = (state: LocationType | null = null, action: GameAction): LocationType | null => {
  if (isActionType(action, 'SET_LOCATION') && 'payload' in action) {
    return action.payload as LocationType;
  }
  return state;
};

const handleQuests = (state: string[] = [], action: GameAction): string[] => {
  if (isActionType(action, 'ADD_QUEST') && 'payload' in action) {
    return [...state, action.payload as string];
  }
  return state;
};

const handleGameProgress = (state = 0, action: GameAction): number => {
  if (isActionType(action, 'SET_GAME_PROGRESS') && 'payload' in action) {
    return action.payload as number;
  }
  return state;
};

const handleSavedTimestamp = (state = 0, action: GameAction): number => {
  if (isActionType(action, 'SET_SAVED_TIMESTAMP') && 'payload' in action) {
    return action.payload as number;
  }
  return state;
};

const handleIsClient = (state = false, _action: GameAction): boolean => {
  // This is typically not modified after initialization
  return state;
};

const handleSuggestedActions = (state: SuggestedAction[] = [], action: GameAction): SuggestedAction[] => {
  if (isActionType(action, 'SET_SUGGESTED_ACTIONS') && 'payload' in action) {
    return action.payload as SuggestedAction[];
  }
  return state;
};

/**
 * Initial state for the application
 */
const initialState: GameState = {
  character: null,
  combat: initialCombatState,
  inventory: { items: [] },
  journal: { entries: [] },
  narrative: narrativeReducer(undefined, NO_OP_ACTION),
  ui: { ...initialUIState },
  currentPlayer: '',
  npcs: [],
  location: null,
  quests: [],
  gameProgress: 0,
  savedTimestamp: 0,
  isClient: false,
  suggestedActions: []
};

/**
 * Root reducer function that combines all slice reducers
 */
const rootReducer = (state: GameState = initialState, action: GameAction): GameState => {
  // Type-check for null or undefined action
  if (!action) return state;
  
  return {
    // Domain-specific slices
    character: characterReducer(state.character, action),
    combat: combatReducer(state.combat, action),
    inventory: inventoryReducer(state.inventory, action),
    journal: journalReducer(state.journal, action),
    // Use type assertion for narrative reducer since its action typing is more restrictive
    narrative: narrativeReducer(state.narrative, action as NarrativeAction),
    ui: uiReducer(state.ui, action),
    
    // Top-level state properties
    currentPlayer: handleCurrentPlayer(state.currentPlayer, action),
    npcs: handleNpcs(state.npcs, action),
    location: handleLocation(state.location, action),
    quests: handleQuests(state.quests, action),
    gameProgress: handleGameProgress(state.gameProgress, action),
    savedTimestamp: handleSavedTimestamp(state.savedTimestamp, action),
    isClient: handleIsClient(state.isClient, action),
    suggestedActions: handleSuggestedActions(state.suggestedActions, action)
  };
};

export default rootReducer;