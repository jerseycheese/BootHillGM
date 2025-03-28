import { ExtendedGameState } from '../../types/extendedState';
import { validateCombatEndState } from '../../utils/combatStateValidation';
import { adaptEnsureCombatState, sliceToLegacyCombatState } from '../../utils/combatAdapter';
import { CombatType } from '../../types/combat';
import { CombatLogEntry, initialCombatState } from '../../types/state/combatState';

/**
 * Combat update payload type definition
 */
export interface CombatUpdatePayload {
  isActive?: boolean;
  combatType?: CombatType;
  participants?: unknown[];
  rounds?: number;
  combatLog?: CombatLogEntry[];
  brawling?: unknown;
  weapon?: unknown;
  winner?: string | null;
  [key: string]: unknown;
}

/**
 * Processes SET_COMBAT_ACTIVE action
 */
export function processSetCombatActive(state: ExtendedGameState, payload: boolean): ExtendedGameState {
  if (!payload) { // Only proceed if setting to false
    if (state.combatState) {
      // For validation, adapt to legacy format if needed
      const legacyFormat = sliceToLegacyCombatState(state.combatState);
      const validationResult = validateCombatEndState(legacyFormat);
      if (!validationResult.isValid) {
        // TODO: Handle invalid combat end state (e.g., dispatch an error action)
        console.warn('Invalid combat end state', validationResult.errors);
      }
    }
  }
  
  // Get the existing combat state or use the initial state
  const existingCombat = state.combat || initialCombatState;
  
  // Create new state with updated properties
  const newState: ExtendedGameState = {
    ...state,
    combat: {
      ...existingCombat,
      isActive: payload
    },
    // Need to update the legacy isCombatActive property to fix the test
    isCombatActive: payload
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
 * Processes UPDATE_COMBAT_STATE action
 */
export function processUpdateCombatState(state: ExtendedGameState, payload: CombatUpdatePayload): ExtendedGameState {
  // Get the existing combat state or use the initial state
  const existingCombat = state.combat || initialCombatState;
  
  // Convert any log entries in the payload to the proper format
  const formattedCombatLog = payload?.combatLog?.map((entry) => {
    // Ensure each entry has the required CombatLogEntry structure
    return {
      text: entry.text || "",
      timestamp: entry.timestamp || Date.now(),
      type: (entry.type || 'system') as 'action' | 'result' | 'system',
      data: entry.data || {}
    } as CombatLogEntry;
  }) || existingCombat.combatLog;
  
  // Update the structured combat state
  const updatedCombat = {
    ...existingCombat,
    ...(payload || {}),
    isActive: true, // Force isActive to true
    combatLog: formattedCombatLog // Use properly formatted log
  };
  
  // Create new state with both structured and legacy properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    // Update the legacy isCombatActive property
    isCombatActive: true
  };
  
  // For backward compatibility
  if (payload) {
    // Use type assertion to bridge the gap between different interfaces
    newState.combatState = adaptEnsureCombatState({
      ...(state.combatState || {}),
      ...(payload as CombatUpdatePayload),
      isActive: true
    });
  }
  
  return newState;
}

/**
 * Processes SET_COMBAT_TYPE action
 */
export function processSetCombatType(state: ExtendedGameState, payload: CombatType): ExtendedGameState {
  // Get the existing combat state or use the initial state
  const existingCombat = state.combat || initialCombatState;
  
  // Update the structured combat state
  const updatedCombat = {
    ...existingCombat,
    combatType: payload,
    isActive: true
  };
  
  // Create new state with both structured and legacy properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    // Update the legacy isCombatActive property
    isCombatActive: true
  };
  
  // For backward compatibility
  newState.combatState = adaptEnsureCombatState({
    ...(state.combatState || {}),
    combatType: payload,
    isActive: true
  });
  
  return newState;
}

/**
 * Processes END_COMBAT action
 */
export function processEndCombat(state: ExtendedGameState): ExtendedGameState {
  // Get the existing combat state or use the initial state
  const existingCombat = state.combat || initialCombatState;
  
  // Create an updated combat state
  const updatedCombat = {
    ...existingCombat,
    isActive: false
  };
  
  // Validate combat end if legacy combatState exists
  if (state.combatState) {
    // For validation, adapt to legacy format if needed
    const legacyFormat = sliceToLegacyCombatState(state.combatState);
    const validationResult = validateCombatEndState(legacyFormat);
    if (!validationResult.isValid) {
      // Invalid combat end state. Dispatch an error action.
      console.warn('Invalid combat end state', validationResult.errors);
    }
  }
  
  // Create new state with updated properties
  const newState: ExtendedGameState = {
    ...state,
    combat: updatedCombat,
    // CRITICAL FIX: Set isCombatActive to false (this is what the test expects)
    isCombatActive: false,
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
