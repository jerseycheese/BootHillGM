import { CombatState, initialCombatState, CombatType, CombatLogEntry } from '../../types/state/combatState';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';

/**
 * Combat slice reducer
 * Handles all combat-related state updates
 */
export function combatReducer(
  state: CombatState = initialCombatState, 
  action: GameAction
): CombatState {
  switch (action.type) {
    case ActionTypes.SET_COMBAT_ACTIVE: {
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
    
    case ActionTypes.SET_COMBAT_TYPE: {
      // Guard against undefined payload; only update if provided
      const newType = action.payload as CombatType | undefined;
      if (newType === undefined) {
        return state;
      }
      return {
        ...state,
        combatType: newType
      };
    }
    
    case ActionTypes.SET_COMBATANTS: {
      // Assert payload type based on SetCombatantsAction
      const payload = action.payload as { playerCharacterId: string; opponentCharacterId: string };
      return {
        ...state,
        playerCharacterId: payload.playerCharacterId,
        opponentCharacterId: payload.opponentCharacterId
      };
    }
    
    case ActionTypes.ADD_LOG_ENTRY: {
      // Assert payload type based on AddCombatLogEntryAction
      const payload = action.payload as CombatLogEntry;
      const currentLog = state.combatLog || [];
      return {
        ...state,
        combatLog: [...currentLog, payload]
      };
    }
    
    case ActionTypes.NEXT_ROUND: {
      return {
        ...state,
        rounds: state.rounds + 1,
        roundStartTime: Date.now()
      };
    }
    
    case ActionTypes.TOGGLE_TURN: {
      return {
        ...state,
        playerTurn: !state.playerTurn
      };
    }
    
    case ActionTypes.UPDATE_MODIFIERS: {
      // Assert payload type based on UpdateCombatModifiersAction
      const payload = action.payload as { player: number | null; opponent: number | null };
      const { player, opponent } = payload;

      return {
        ...state,
        modifiers: {
          player: player !== null ? player : state.modifiers.player,
          opponent: opponent !== null ? opponent : state.modifiers.opponent
        }
      };
    }
    
    case ActionTypes.RESET_COMBAT: {
      return {
        ...initialCombatState,
        isActive: true,
        combatType: state.combatType
      };
    }
    
    case ActionTypes.UPDATE_COMBAT_STATE: {
      // Assert payload type based on UpdateCombatStateAction
      const newCombatState = action.payload as Partial<CombatState>;

      // Create a properly structured state object from payload
      return {
        ...state,
        isActive: newCombatState.isActive ?? state.isActive,
        combatType: newCombatState.combatType ?? state.combatType,
        playerTurn: newCombatState.playerTurn ?? state.playerTurn, // Use playerTurn directly
        roundStartTime: newCombatState.roundStartTime ?? Date.now(), // Use provided or current time
        winner: newCombatState.winner ?? state.winner,
        rounds: newCombatState.rounds ?? state.rounds,
        playerCharacterId: newCombatState.playerCharacterId ?? state.playerCharacterId,
        opponentCharacterId: newCombatState.opponentCharacterId ?? state.opponentCharacterId,
        modifiers: newCombatState.modifiers ?? state.modifiers, // Update modifiers if provided
        combatLog: newCombatState.combatLog ?? state.combatLog ?? [], // Use provided or existing log
        currentTurn: newCombatState.currentTurn ?? state.currentTurn, // Use provided or existing turn
        participants: newCombatState.participants ?? state.participants // Use provided or existing participants
      };
    }
    
    // Handle SET_STATE for state restoration
    case ActionTypes.SET_STATE: {
      // Assert payload type (assuming it's GameState)
      const payload = action.payload as GameState;
      if (!payload || !payload.combat) {
        return state; // Return current state if payload or combat slice is missing
      }

      // Return the combat slice from the payload, merged with existing state (optional, depends on desired behavior)
      // If full replacement is intended, just return payload.combat
      return {
        ...state, // Keep existing state properties not in payload.combat
        ...payload.combat // Overwrite with properties from payload.combat
      };
    }
    
    default:
      return state;
  }
}
