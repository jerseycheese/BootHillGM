import { ExtendedGameState } from '../types/extendedState';
import { CombatState } from '../types/state/combatState';
import { adaptEnsureCombatState, sliceToLegacyCombatState } from '../utils/combatAdapter';
import { validateCombatEndState } from '../utils/combatStateValidation';
import { CombatUpdatePayload } from './gameTypes';
import { convertCombatLogEntries, transformCurrentTurn, combatTurnToString } from '../utils/gameReducerHelpers';
import { ActionTypes } from '../types/actionTypes';
import { GameEngineAction } from '../types/gameActions';

/**
 * Handles the SET_COMBAT_ACTIVE action (ActionTypes.SET_COMBAT_ACTIVE)
 */
export function handleSetCombatActive(state: ExtendedGameState, payload: boolean): ExtendedGameState {
  if (!payload) { // Only proceed if setting to false
    if (state.combatState) {
      // For validation, adapt to legacy format if needed
      const legacyFormat = sliceToLegacyCombatState(state.combatState);
      const validationResult = validateCombatEndState(legacyFormat);
      if (!validationResult.isValid) {
        // TODO: Handle invalid combat end state (e.g., dispatch an error action)
      }
    }
  }
  
  // Combat state update
  const updatedCombat: CombatState = {
    ...state.combat,
    isActive: payload
  };
  
  // Create new state with updated properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat
  };
  
  // If combat is ending, clear opponent and combatState
  if (!payload) {
    newState.character = {
      ...newState.character,
      opponent: null,
      player: newState.character?.player || null // Ensure player is null, not undefined
    };
    newState.opponent = null; // For backward compatibility
    newState.combatState = undefined; // For backward compatibility
  }
  
  return newState;
}

/**
 * Handlers for UPDATE_COMBAT_STATE action (ActionTypes.UPDATE_COMBAT_STATE)
 */
export function handleUpdateCombatState(state: ExtendedGameState, payload: unknown): ExtendedGameState {
  // Cast to our working type
  const typedPayload = payload as CombatUpdatePayload;
  
  // Extract and transform payload parts that need type conversion
  const extractedPayload = typedPayload || { /* Intentionally empty */ };
  
  // Handle currentTurn conversion - could be string or CombatTurn object
  const currentTurn = transformCurrentTurn(extractedPayload.currentTurn, state);
  
  // Convert currentTurn to string for CombatState
  const currentTurnString = combatTurnToString(currentTurn);
  
  // Convert combatType if needed
  const combatType = extractedPayload.combatType === null 
    ? undefined 
    : extractedPayload.combatType;
  
  // Convert combat log entries if needed - fixed to avoid array indexing of possibly undefined
  const combatLogEntries = extractedPayload.combatLog
    ? extractedPayload.combatLog
    : undefined;
  
  // Safely convert combat log entries with proper type checking
  const combatLog = combatLogEntries
    ? convertCombatLogEntries(combatLogEntries)
    : undefined;
  
  // Create clean payload with proper types
  const combatPayload: Partial<CombatState> = {
    ...extractedPayload,
    combatType,
    combatLog,
    currentTurn: currentTurnString
  };
  
  // Update the structured combat state - making sure we adapt it properly
  const updatedCombat = adaptEnsureCombatState({
    ...state.combat,
    ...combatPayload,
    isActive: true
  });
  
  // Create properly typed legacy state object for the adapter
  const transformedLegacyState: Partial<CombatState> = {
    ...(state.combatState || { /* Intentionally empty */ }),
    ...combatPayload,
    isActive: true
  };
  
  // Create new state with both new and legacy structures
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    combatState: adaptEnsureCombatState(transformedLegacyState)
  };
  
  return newState;
}

/**
 * Handles the SET_COMBAT_TYPE action (ActionTypes.SET_COMBAT_TYPE)
 */
export function handleSetCombatType(state: ExtendedGameState, payload: 'brawling' | 'weapon' | null): ExtendedGameState {
  // Update the structured combat state
  const updatedCombat: CombatState = {
    ...state.combat,
    combatType: payload,
    isActive: true
  };
  
  // Create new state with structured properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat
  };
  
  // For backward compatibility - ensure we have proper CombatTurn object for the adapter
  const currentTurnString = state.combatState?.currentTurn as string | undefined;
  const currentTurnObject = transformCurrentTurn(currentTurnString, state);
  
  // Make sure we convert the CombatTurn object back to a string for the legacy state
  const mappedCurrentTurn = combatTurnToString(currentTurnObject);
  
  // For backward compatibility
  const legacyState: Partial<CombatState> = {
    ...(state.combatState || { /* Intentionally empty */ }),
    combatType: payload,
    isActive: true,
    currentTurn: mappedCurrentTurn
  };
  
  newState.combatState = adaptEnsureCombatState(legacyState);
  
  return newState;
}

/**
 * Handles the END_COMBAT action (ActionTypes.END_COMBAT)
 */
export function handleEndCombat(state: ExtendedGameState): ExtendedGameState {
  // Create an updated combat state
  const updatedCombat: CombatState = {
    ...state.combat,
    isActive: false
  };
  
  // Validate combat end if legacy combatState exists
  if (state.combatState) {
    // For validation, adapt to legacy format if needed
    const legacyFormat = sliceToLegacyCombatState(state.combatState);
    const validationResult = validateCombatEndState(legacyFormat);
    if (!validationResult.isValid) {
      // Invalid combat end state. Log a warning.
      console.warn('Invalid combat end state', validationResult.errors);
    }
  }
  
  // Create new state with updated properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    character: {
      ...state.character,
      opponent: null,
      player: state.character?.player || null // Ensure player is null, not undefined
    }
  };
  
  // For backward compatibility
  newState.opponent = null;
  newState.combatState = undefined;
  
  return newState;
}

/**
 * Handles the RESET_COMBAT action (ActionTypes.RESET_COMBAT)
 */
export function handleResetCombat(state: ExtendedGameState): ExtendedGameState {
  // Reset combat state entirely
  const resetCombat: CombatState = {
    isActive: false,
    combatType: null,
    combatLog: [],
    rounds: 0,
    playerTurn: true,
    currentTurn: null,
    playerCharacterId: '',
    opponentCharacterId: '',
    roundStartTime: 0,
    modifiers: { player: 0, opponent: 0 }
  };
  
  // Create new state with reset combat properties
  const newState: ExtendedGameState = {
    ...state,
    combat: resetCombat,
    character: {
      ...state.character,
      opponent: null,
      player: state.character?.player || null
    }
  };
  
  // For backward compatibility
  newState.opponent = null;
  newState.combatState = undefined;
  
  return newState;
}

// Combat reducer function
export default function combatReducer(state: ExtendedGameState, action: GameEngineAction): ExtendedGameState {
  // Use ActionTypes constants in case statements
  switch (action.type) {
    case 'combat/SET_COMBAT_ACTIVE':
    case ActionTypes.SET_COMBAT_ACTIVE:
      return handleSetCombatActive(state, action.payload);
      
    case 'combat/UPDATE_STATE':
    case ActionTypes.UPDATE_COMBAT_STATE:
      return handleUpdateCombatState(state, action.payload);
      
    case 'combat/SET_COMBAT_TYPE':
    case ActionTypes.SET_COMBAT_TYPE:
      return handleSetCombatType(state, action.payload);
      
    case 'combat/END_COMBAT':  
    case ActionTypes.END_COMBAT:
      return handleEndCombat(state);
      
    case 'combat/RESET_COMBAT':
    case ActionTypes.RESET_COMBAT:
      return handleResetCombat(state);
      
    default:
      return state;
  }
}