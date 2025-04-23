/**
 * Combat Reducer
 * 
 * Handles all combat-related state changes including combat flow,
 * turn management, and combat logging.
 */

import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { CombatLogEntry } from '../../types/state/combatState';

/**
 * Process combat-related actions
 * 
 * @param state Current game state
 * @param action Game action to process
 * @returns Updated game state
 */
export function combatReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionTypes.SET_COMBAT_ACTIVE:
      return {
        ...state,
        combat: {
          ...state.combat,
          isActive: action.payload !== undefined ? action.payload : false
        }
      };
      
    case ActionTypes.END_COMBAT:
      return {
        ...state,
        combat: {
          ...state.combat,
          isActive: false,
          rounds: 0,
          playerTurn: true,
          combatLog: [...(state.combat.combatLog || []), { text: 'Combat ended', timestamp: Date.now(), type: 'info' }]
        },
        character: state.character === null ? {
          player: null,
          opponent: null
        } : {
          ...state.character,
          opponent: null // Remove opponent when combat ends
        }
      };
      
    case ActionTypes.ADD_LOG_ENTRY:
      return {
        ...state,
        combat: {
          ...state.combat,
          combatLog: [...(state.combat.combatLog || []), action.payload as CombatLogEntry]
        }
      };
      
    case ActionTypes.NEXT_ROUND:
      return {
        ...state,
        combat: {
          ...state.combat,
          rounds: state.combat.rounds + 1,
          roundStartTime: Date.now()
        }
      };
      
    case ActionTypes.TOGGLE_TURN:
      return {
        ...state,
        combat: {
          ...state.combat,
          playerTurn: !state.combat.playerTurn
        }
      };
      
    default:
      return state;
  }
}
