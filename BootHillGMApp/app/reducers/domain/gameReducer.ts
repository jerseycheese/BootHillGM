/**
 * Game State Reducer
 * 
 * Handles general game-related state changes including player information,
 * location, progress tracking, and suggested action management.
 * Note: This is different from the root gameReducer.
 */

import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { LocationType } from '../../services/locationService';
import { SuggestedAction } from '../../types/campaign';

/**
 * Process game-specific actions
 * 
 * @param state Current game state
 * @param action Game action to process
 * @returns Updated game state
 */
export function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionTypes.SET_PLAYER: {
      const playerName = typeof action.payload === 'string' ? action.payload : '';
      return { 
        ...state, 
        currentPlayer: playerName
      };
    }
      
    case ActionTypes.SET_LOCATION:
      return { ...state, location: action.payload as LocationType | null };

    case ActionTypes.SET_GAME_PROGRESS:
      return { ...state, gameProgress: action.payload as number };
      
    case ActionTypes.SET_SAVED_TIMESTAMP: {
      const timestamp = typeof action.payload === 'number' ? action.payload : Date.now();
      return {
        ...state,
        meta: { ...(state.meta || {}), savedAt: timestamp }
      };
    }
      
    case ActionTypes.SET_SUGGESTED_ACTIONS: {
      const suggestedActions = Array.isArray(action.payload) 
                               ? action.payload as SuggestedAction[] 
                               : [];
      return { ...state, suggestedActions };
    }
      
    default:
      return state;
  }
}
