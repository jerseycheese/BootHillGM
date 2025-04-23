import { CombatType } from '../combat'; // Keep CombatType if needed elsewhere
import { CombatState, CombatLogEntry } from '../state/combatState'; // Import CombatState from state
import { ActionTypes } from '../actionTypes'; // Import ActionTypes

/**
 * Combat action interfaces using ActionTypes
 */
export interface SetCombatActiveAction {
  type: typeof ActionTypes.SET_COMBAT_ACTIVE; // Use ActionTypes (handles legacy 'combat/SET_ACTIVE' in reducers)
  payload: boolean;
}

export interface SetCombatTypeAction {
  type: typeof ActionTypes.SET_COMBAT_TYPE; // Use ActionTypes
  payload: CombatType;
}

export interface SetCombatantsAction {
  type: typeof ActionTypes.SET_COMBATANTS; // Use ActionTypes
  payload: {
    playerCharacterId: string;
    opponentCharacterId: string;
  };
}

export interface AddCombatLogEntryAction {
  type: typeof ActionTypes.ADD_LOG_ENTRY; // Use ActionTypes
  payload: CombatLogEntry;
}

export interface NextCombatRoundAction {
  type: typeof ActionTypes.NEXT_ROUND; // Use ActionTypes
}

export interface ToggleCombatTurnAction {
  type: typeof ActionTypes.TOGGLE_TURN; // Use ActionTypes
}

export interface UpdateCombatModifiersAction {
  type: typeof ActionTypes.UPDATE_MODIFIERS; // Use ActionTypes
  payload: {
    player: number | null;
    opponent: number | null;
  };
}

export interface EndCombatAction {
  type: typeof ActionTypes.END_COMBAT; // Add END_COMBAT action type
}

export interface ResetCombatAction {
  type: typeof ActionTypes.RESET_COMBAT; // Use ActionTypes (handles legacy 'combat/END_COMBAT')
}

// ExecuteCombatActionAction removed as it was unused

export interface UpdateCombatStateAction {
  type: typeof ActionTypes.UPDATE_COMBAT_STATE; // Use ActionTypes
  payload: Partial<CombatState>; // Use CombatState from state, allow partial updates
}

/**
 * Combined combat actions type
 */
export type CombatAction =
  | SetCombatActiveAction
  | SetCombatTypeAction
  | SetCombatantsAction
  | AddCombatLogEntryAction
  | NextCombatRoundAction
  | ToggleCombatTurnAction
  | UpdateCombatModifiersAction
  | EndCombatAction
  | ResetCombatAction
  | UpdateCombatStateAction;