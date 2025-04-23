/**
 * Character Reducer
 * 
 * Handles all character-related state changes including player and opponent management.
 */

import { GameState } from '../../types/gameState';
import { CharacterAction, UpdateCharacterPayload } from '../../types/actions/characterActions';
import { Character } from '../../types/character';
import { ActionTypes } from '../../types/actionTypes';
import { CharacterState } from '../../types/state/characterState';

/**
 * Process character-related actions
 * 
 * @param state Current game state
 * @param action Character action to process
 * @returns Updated game state
 */
export function characterReducer(state: GameState, action: CharacterAction): GameState {
  // Handle null character state
  if (state.character === null) {
    // Initialize character state if null
    const defaultCharacterState: CharacterState = {
      player: null,
      opponent: null
    };
    state = { ...state, character: defaultCharacterState };
  }

  switch (action.type) {
    case ActionTypes.SET_CHARACTER: {
      // Create an exact CharacterState object with no optional properties
      return {
        ...state,
        character: {
          player: action.payload as Character | null,
          opponent: state.character ? state.character.opponent : null
        }
      };
    }
      
    case ActionTypes.SET_OPPONENT: {
      // Create an exact CharacterState object with no optional properties
      return {
        ...state,
        character: {
          player: state.character ? state.character.player : null,
          opponent: action.payload as Character | null
        }
      };
    }
      
    case ActionTypes.UPDATE_CHARACTER:
      if (!state.character || !state.character.player) return state;
      return {
        ...state,
        character: {
          ...state.character,
          player: {
            ...state.character.player,
            ...(action.payload as Partial<Character>)
          }
        }
      };
      
    case ActionTypes.UPDATE_OPPONENT: {
      if (!state.character || !state.character.opponent) return state;
      
      const payload = action.payload as UpdateCharacterPayload;
      const currentOpponent = state.character.opponent;

      // Safely merge attributes, only updating those present in the payload
      const updatedAttributes = {
        ...currentOpponent.attributes,
        ...(payload.attributes || {}) // Spread payload attributes only if they exist
      };

      return {
        ...state,
        character: {
          ...state.character,
          opponent: {
            ...currentOpponent, // Spread the existing opponent
            ...payload, // Spread other payload properties (id, wounds, etc.)
            attributes: updatedAttributes // Apply the safely merged attributes
          } as Character
        }
      };
    }
      
    default:
      return state;
  }
}
