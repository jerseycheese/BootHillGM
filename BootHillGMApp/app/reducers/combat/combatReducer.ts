import { CombatState, initialCombatState } from '../../types/state/combatState';
import { GameAction } from '../../types/actions';

/**
 * Combat slice reducer
 * Handles all combat-related state updates
 */
export function combatReducer(
  state: CombatState = initialCombatState, 
  action: GameAction
): CombatState {
  switch (action.type) {
    case 'combat/SET_ACTIVE': {
      if (action.payload === false) {
        // If combat is being deactivated, reset most state but preserve combat type
        return {
          ...initialCombatState,
          combatType: state.combatType
        };
      }
      
      // If combat is being activated, set isActive to true
      return {
        ...state,
        isActive: true
      };
    }
    
    case 'combat/SET_COMBAT_TYPE': {
      return {
        ...state,
        combatType: action.payload
      };
    }
    
    case 'combat/SET_COMBATANTS': {
      return {
        ...state,
        playerCharacterId: action.payload.playerCharacterId,
        opponentCharacterId: action.payload.opponentCharacterId
      };
    }
    
    case 'combat/ADD_LOG_ENTRY': {
      return {
        ...state,
        combatLog: [...state.combatLog, action.payload]
      };
    }
    
    case 'combat/NEXT_ROUND': {
      return {
        ...state,
        rounds: state.rounds + 1,
        roundStartTime: Date.now()
      };
    }
    
    case 'combat/TOGGLE_TURN': {
      return {
        ...state,
        playerTurn: !state.playerTurn
      };
    }
    
    case 'combat/UPDATE_MODIFIERS': {
      const { player, opponent } = action.payload;
      
      return {
        ...state,
        modifiers: {
          player: player !== null ? player : state.modifiers.player,
          opponent: opponent !== null ? opponent : state.modifiers.opponent
        }
      };
    }
    
    case 'combat/RESET_COMBAT': {
      return {
        ...initialCombatState,
        isActive: true,
        combatType: state.combatType
      };
    }
    
    // Handle SET_STATE for state restoration
    case 'SET_STATE': {
      if (!action.payload.combat) {
        return state;
      }
      
      return {
        ...state,
        ...action.payload.combat
      };
    }
    
    default:
      return state;
  }
}
