import { CombatType } from '../combat';
import { CombatLogEntry } from '../state/combatState';

/**
 * Combat action types
 */
export type CombatActionType =
  | 'combat/SET_ACTIVE'
  | 'combat/SET_COMBAT_TYPE'
  | 'combat/SET_COMBATANTS'
  | 'combat/ADD_LOG_ENTRY'
  | 'combat/NEXT_ROUND'
  | 'combat/TOGGLE_TURN'
  | 'combat/UPDATE_MODIFIERS'
  | 'combat/RESET_COMBAT'
  | 'combat/EXECUTE_ACTION';

/**
 * Combat action interfaces
 */
export interface SetCombatActiveAction {
  type: 'combat/SET_ACTIVE';
  payload: boolean;
}

export interface SetCombatTypeAction {
  type: 'combat/SET_COMBAT_TYPE';
  payload: CombatType;
}

export interface SetCombatantsAction {
  type: 'combat/SET_COMBATANTS';
  payload: {
    playerCharacterId: string;
    opponentCharacterId: string;
  };
}

export interface AddCombatLogEntryAction {
  type: 'combat/ADD_LOG_ENTRY';
  payload: CombatLogEntry;
}

export interface NextCombatRoundAction {
  type: 'combat/NEXT_ROUND';
}

export interface ToggleCombatTurnAction {
  type: 'combat/TOGGLE_TURN';
}

export interface UpdateCombatModifiersAction {
  type: 'combat/UPDATE_MODIFIERS';
  payload: {
    player: number | null;
    opponent: number | null;
  };
}

export interface ResetCombatAction {
  type: 'combat/RESET_COMBAT';
}

export interface ExecuteCombatActionAction {
  type: 'combat/EXECUTE_ACTION';
  payload: {
    action: string;
    characterId: string;
    targetId: string;
    data?: Record<string, unknown>;
  };
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
  | ResetCombatAction
  | ExecuteCombatActionAction;