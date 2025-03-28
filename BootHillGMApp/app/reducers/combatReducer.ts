import { ExtendedGameState } from '../types/extendedState';
import { CombatState } from '../types/state/combatState';
import { adaptEnsureCombatState, sliceToLegacyCombatState } from '../utils/combatAdapter';
import { validateCombatEndState } from '../utils/combatStateValidation';
import { CombatUpdatePayload } from './gameTypes';
import { convertCombatLogEntries, transformCurrentTurn, combatTurnToString } from '../utils/gameReducerHelpers';
import { LogEntry } from '../types/combat';

/**
 * Handles the SET_COMBAT_ACTIVE action
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
 * Handles the UPDATE_COMBAT_STATE action
 */
export function handleUpdateCombatState(state: ExtendedGameState, payload: unknown): ExtendedGameState {
  // Cast to our working type
  const typedPayload = payload as CombatUpdatePayload;
  
  // Extract and transform payload parts that need type conversion
  const extractedPayload = typedPayload || {};
  
  // Handle currentTurn conversion - could be string or CombatTurn object
  const currentTurn = transformCurrentTurn(extractedPayload.currentTurn, state);
  
  // Convert combatType if needed
  const combatType = extractedPayload.combatType === null 
    ? undefined 
    : extractedPayload.combatType;
  
  // Convert combat log entries if needed
  const combatLog = extractedPayload.combatLog 
    ? convertCombatLogEntries(extractedPayload.combatLog as (LogEntry | CombatState['combatLog'][0])[])
    : undefined;
  
  // Create clean payload with proper types
  const combatPayload: Partial<CombatState> = {
    ...extractedPayload,
    combatType,
    combatLog,
    currentTurn
  };
  
  // Update the structured combat state - making sure we adapt it properly
  const updatedCombat = adaptEnsureCombatState({
    ...state.combat,
    ...combatPayload,
    isActive: true
  });
  
  // Convert currentTurn to string for legacy code
  const legacyCombatStateString = combatTurnToString(currentTurn);
  
  // Create a properly typed legacy state object for the adapter
  const transformedLegacyState: Partial<CombatState> = {
    ...(state.combatState || {}),
    ...combatPayload,
    isActive: true
  };
  
  // Create new state with both new and legacy structures
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    combatState: adaptEnsureCombatState(transformedLegacyState)
  };
  
  // For strict legacy compatibility, also preserve the string format
  if (newState.combatState) {
    // @ts-expect-error - Intentionally using string for legacy code
    newState.combatState.currentTurn = legacyCombatStateString;
  }
  
  return newState;
}

/**
 * Handles the SET_COMBAT_TYPE action
 */
export function handleSetCombatType(state: ExtendedGameState, payload: 'brawling' | 'weapon' | null): ExtendedGameState {
  // Update the structured combat state
  const updatedCombat: CombatState = {
    ...state.combat,
    combatType: payload,
    isActive: true
  };
  
  // Create new state with both structured and legacy properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat
  };
  
  // For backward compatibility - ensure we have proper CombatTurn object for the adapter
  const currentTurnString = state.combatState?.currentTurn as string | undefined;
  const currentTurnObject = transformCurrentTurn(currentTurnString, state);
  
  // For backward compatibility
  const legacyState: Partial<CombatState> = {
    ...(state.combatState || {}),
    combatType: payload,
    isActive: true,
    // Replace string currentTurn with object for the adapter function
    currentTurn: currentTurnObject
  };
  
  newState.combatState = adaptEnsureCombatState(legacyState);
  
  // For strict legacy compatibility, restore the string value after adaptation
  if (newState.combatState) {
    // @ts-expect-error - Intentionally using string for legacy code
    newState.combatState.currentTurn = currentTurnString;
  }
  
  return newState;
}

/**
 * Handles the END_COMBAT action
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