import { ExtendedGameState } from '../types/extendedState';
import { NarrativeAction } from '../types/narrative.types';
import { narrativeReducer } from './narrative/narrativeReducer';
import { SetNarrativeAction } from './gameTypes';
import { processInventoryState, processJournalState } from '../utils/gameReducerHelpers';
import { handleSetCharacter, handleUpdateCharacter, handleSetOpponent } from './characterReducer';
import { handleSetCombatActive, handleUpdateCombatState, handleSetCombatType, handleEndCombat } from './combatReducer';
import { handleSetNarrative, updateNarrativeState } from './narrativeHandler';
import { handleSetState } from './stateAdapter';
import { GameEngineAction, UpdateCharacterPayload } from '../types/gameActions';
import { LocationType } from '../services/locationService';
import { Character } from '../types/character';
import { CombatType } from '../types/combat';
import { SuggestedAction } from '../types/campaign';
import { CombatState } from '../types/state/combatState';

/**
 * Reducer function to handle game state updates related to the game in general,
 * delegating to sub-reducers as necessary for specific domains.
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The updated game state.
 */
export function gameReducer(state: ExtendedGameState, action: GameEngineAction): ExtendedGameState {
  // Define reusable type assertion for safely casting action types
  const actionType = action.type as string;

  // === Domain-specific handlers ===
  
  // Inventory actions - both regular and namespaced
  if (
    actionType === 'ADD_ITEM' ||
    actionType === 'REMOVE_ITEM' ||
    actionType === 'USE_ITEM' ||
    actionType === 'UPDATE_ITEM_QUANTITY' ||
    actionType === 'CLEAN_INVENTORY' ||
    actionType === 'SET_INVENTORY' ||
    actionType === 'EQUIP_WEAPON' ||
    actionType === 'UNEQUIP_WEAPON' ||
    actionType.startsWith('inventory/')
  ) {
    return processInventoryState(state, action);
  }

  // Journal actions - both regular and namespaced
  if (
    actionType === 'UPDATE_JOURNAL' ||
    actionType.startsWith('journal/')
  ) {
    return processJournalState(state, action);
  }

  // Narrative actions - both regular and namespaced
  if (
    actionType === 'NAVIGATE_TO_POINT' ||
    actionType === 'SELECT_CHOICE' ||
    actionType === 'ADD_NARRATIVE_HISTORY' ||
    actionType === 'SET_DISPLAY_MODE' ||
    actionType === 'START_NARRATIVE_ARC' ||
    actionType === 'COMPLETE_NARRATIVE_ARC' ||
    actionType === 'ACTIVATE_BRANCH' ||
    actionType === 'COMPLETE_BRANCH' ||
    actionType === 'UPDATE_NARRATIVE_CONTEXT' ||
    actionType === 'RESET_NARRATIVE' ||
    actionType.startsWith('narrative/')
  ) {
    const updatedNarrative = narrativeReducer(state.narrative, action as unknown as NarrativeAction);
    return updateNarrativeState(state, updatedNarrative);
  }

  // === Individual action type handlers ===
  // Instead of type guards, use runtime checks and type assertions
  
  // SET_PLAYER
  if (actionType === 'SET_PLAYER' && 'payload' in action) {
    const payload = action.payload as string;
    return { ...state, currentPlayer: payload };
  }
  
  // ADD_NPC
  else if (actionType === 'ADD_NPC' && 'payload' in action) {
    const payload = action.payload as string;
    return { ...state, npcs: [...state.npcs, payload] };
  }
  
  // SET_LOCATION
  else if (actionType === 'SET_LOCATION' && 'payload' in action) {
    const payload = action.payload as LocationType;
    return { ...state, location: payload };
  }
  
  // ADD_QUEST
  else if (actionType === 'ADD_QUEST' && 'payload' in action) {
    const payload = action.payload as string;
    return { ...state, quests: [...state.quests, payload] };
  }
  
  // SET_CHARACTER
  else if ((actionType === 'SET_CHARACTER' || actionType === 'character/SET_CHARACTER') && 'payload' in action) {
    const payload = action.payload as Character | null;
    return handleSetCharacter(state, payload);
  }
  
  // UPDATE_CHARACTER
  else if ((actionType === 'UPDATE_CHARACTER' || actionType === 'character/UPDATE_CHARACTER') && 'payload' in action) {
    const payload = action.payload as UpdateCharacterPayload;
    return handleUpdateCharacter(state, payload);
  }
  
  // SET_NARRATIVE / narrative/SET_NARRATIVE
  else if ((actionType === 'SET_NARRATIVE' || actionType === 'narrative/SET_NARRATIVE') && 'payload' in action) {
    return handleSetNarrative(state, (action as unknown as SetNarrativeAction).payload);
  }
  
  // SET_GAME_PROGRESS
  else if (actionType === 'SET_GAME_PROGRESS' && 'payload' in action) {
    const payload = action.payload as number;
    return { ...state, gameProgress: payload };
  }
  
  // SET_OPPONENT / character/SET_OPPONENT
  else if ((actionType === 'SET_OPPONENT' || actionType === 'character/SET_OPPONENT') && 'payload' in action) {
    const payload = action.payload as Partial<Character>;
    return handleSetOpponent(state, payload);
  }
  
  // SET_COMBAT_ACTIVE / combat/SET_ACTIVE
  else if ((actionType === 'SET_COMBAT_ACTIVE' || actionType === 'combat/SET_ACTIVE') && 'payload' in action) {
    const payload = action.payload as boolean;
    return handleSetCombatActive(state, payload);
  }
  
  // UPDATE_COMBAT_STATE / combat/UPDATE_STATE
  else if ((actionType === 'UPDATE_COMBAT_STATE' || actionType === 'combat/UPDATE_STATE') && 'payload' in action) {
    const payload = action.payload as Partial<CombatState>;
    return handleUpdateCombatState(state, payload);
  }
  
  // SET_COMBAT_TYPE / combat/SET_TYPE
  else if ((actionType === 'SET_COMBAT_TYPE' || actionType === 'combat/SET_TYPE') && 'payload' in action) {
    const payload = action.payload as CombatType;
    return handleSetCombatType(state, payload);
  }
  
  // SET_SAVED_TIMESTAMP
  else if (actionType === 'SET_SAVED_TIMESTAMP' && 'payload' in action) {
    const payload = action.payload as number;
    return { ...state, savedTimestamp: payload };
  }
  
  // SET_STATE
  else if (actionType === 'SET_STATE' && 'payload' in action) {
    const payload = action.payload as Partial<ExtendedGameState>;
    return handleSetState(state, payload);
  }
  
  // SET_SUGGESTED_ACTIONS / ui/SET_SUGGESTED_ACTIONS
  else if ((actionType === 'SET_SUGGESTED_ACTIONS' || actionType === 'ui/SET_SUGGESTED_ACTIONS') && 'payload' in action) {
    const payload = action.payload as SuggestedAction[];
    return { ...state, suggestedActions: payload };
  }
  
  // END_COMBAT / combat/END
  else if (actionType === 'END_COMBAT' || actionType === 'combat/END') {
    return handleEndCombat(state);
  }

  // Default case: return unchanged state
  return state;
}

// Default export to fix import issues in other files
export default gameReducer;