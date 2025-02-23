import { BrawlingState } from "../../types/combat";
import { BrawlingAction } from "../../types/brawling.types";

/**
 * Reducer function for managing brawling combat state.
 * Handles actions like applying damage, adding log entries, updating modifiers, and ending the round/combat.
 *
 * @param {BrawlingState} state - The current brawling state.
 * @param {BrawlingAction} action - The action to be performed.
 * @returns {BrawlingState} The new brawling state after applying the action.
 */
export function brawlingReducer(state: BrawlingState, action: BrawlingAction): BrawlingState {
  switch (action.type) {
    case 'APPLY_DAMAGE': {
      return state; // Strength is updated directly in Character objects
    }
    
    case 'ADD_LOG_ENTRY': {
      // Only check timestamp for duplicates
      const isDuplicate = state.roundLog.some(
        entry => entry.timestamp === action.entry.timestamp
      );
      return isDuplicate ? state : {
        ...state,
        roundLog: [...state.roundLog, action.entry]
      };
    }
    
    case 'UPDATE_MODIFIERS': {
      return {
        ...state,
        playerModifier: action.player ?? state.playerModifier,
        opponentModifier: action.opponent ?? state.opponentModifier
      };
    }
    
    case 'END_ROUND': {
      const newRound = (state.round === 1 ? 2 : 1) as 1 | 2;
      return {
        ...state,
        round: newRound
      };
    }

    case 'END_COMBAT': {
      return {
        ...state,
        roundLog: [
          ...state.roundLog,
          {
            text: action.summary,
            type: 'info',
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'SYNC_STRENGTH': {
      return state; // No longer syncing strength directly in combat state
    }
    
    default:
      return state;
  }
}
