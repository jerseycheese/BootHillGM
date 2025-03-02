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
      // Only check timestamp and text for duplicates to avoid false positives
      const isDuplicate = state.roundLog.some(
        entry => entry.timestamp === action.entry.timestamp && entry.text === action.entry.text
      );
      
      if (isDuplicate) {
        return state;
      }
      
      return {
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
      // Only advance from round 1 to 2, never back to 1
      if (state.round === 1) {
        return {
          ...state,
          round: 2
        };
      }
      // If already in round 2, maintain current state
      return state;
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
