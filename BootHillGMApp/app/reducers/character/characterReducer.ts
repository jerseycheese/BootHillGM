import { CharacterState, initialCharacterState } from '../../types/state/characterState';
import { GameAction } from '../../types/actions';
import { calculateUpdatedStrength } from '../../utils/strengthSystem';
import { Character } from '../../types/character';
import { UpdateCharacterPayload } from '../../types/actions/characterActions';
import { ActionTypes } from '../../types/actionTypes';
import { isNonNullObject, isCharacter, hasId } from '../utils/typeGuards';

/**
 * Type guard for Character update payload
 */
function isUpdateCharacterPayload(payload: unknown): payload is UpdateCharacterPayload {
  return hasId(payload);
}

/**
 * Helper function to update a character with a payload
 */
function updateCharacter(character: Character, payload: UpdateCharacterPayload): Character {
  // Initialize attributes with empty object if not provided
  let updatedAttributes = payload.attributes || { /* Intentionally empty */ };
  let updatedHistory = character.strengthHistory;

  // Handle strength calculation if damage is inflicted
  if (payload.attributes && 
      typeof payload.attributes.strength !== 'undefined' && 
      typeof payload.damageInflicted !== 'undefined') {
    
    const { newStrength, updatedHistory: newHistory } = calculateUpdatedStrength(character, payload.damageInflicted);
    updatedAttributes = {
      ...updatedAttributes,
      strength: newStrength
    };
    updatedHistory = newHistory;
  }

  // Create updated character with type safety
  return {
    ...character,
    ...payload,
    attributes: {
      ...character.attributes,
      ...updatedAttributes,
      // Always preserve baseStrength
      baseStrength: character.attributes.baseStrength
    },
    // Ensure wounds is always an array
    wounds: [...(Array.isArray(payload.wounds) ? payload.wounds : character.wounds)],
    strengthHistory: updatedHistory
  };
}

/**
 * Character slice reducer
 * Handles all character-related state updates
 */
export function characterReducer(
  state: CharacterState = initialCharacterState,
  action: GameAction
): CharacterState {
  switch (action.type) {
    case 'character/SET_CHARACTER': {
      // Ensure we have a valid character
      if (!isCharacter(action.payload)) {
        return state;
      }

      return {
        ...state,
        player: action.payload
      };
    }

    case 'character/UPDATE_CHARACTER': {
      // Ensure payload has an id
      if (!isUpdateCharacterPayload(action.payload)) {
        return state;
      }

      const payload = action.payload;
      
      // For player update
      if (state.player && state.player.id === payload.id) {
        return {
          ...state,
          player: updateCharacter(state.player, payload)
        };
      }
      
      // For opponent update
      if (state.opponent && state.opponent.id === payload.id) {
        return {
          ...state,
          opponent: updateCharacter(state.opponent, payload)
        };
      }
      
      // No matching character found
      return state;
    }

    case 'character/SET_OPPONENT': {
      // Allow null opponent (for clearing)
      if (action.payload === null) {
        return {
          ...state,
          opponent: null
        };
      }
      
      // Ensure opponent is a valid character
      if (!isCharacter(action.payload)) {
        return state;
      }

      return {
        ...state,
        opponent: action.payload
      };
    }
    
    // Handle SET_STATE for state restoration
    case ActionTypes.SET_STATE: { // Use ActionTypes constant
      if (!isNonNullObject(action.payload) || !('character' in action.payload)) {
        return state;
      }
      
      const payload = action.payload as Record<string, unknown>;
      
      // If character state exists in payload, use it
      if (isNonNullObject(payload.character)) {
        const characterPayload = payload.character as Record<string, unknown>;
        
        // Create a new state with properly typed player and opponent
        const newState: CharacterState = {
          ...state
        };
        
        // Update player if present
        if ('player' in characterPayload && isCharacter(characterPayload.player)) {
          newState.player = characterPayload.player;
        }
        
        // Update opponent if present
        if ('opponent' in characterPayload && (characterPayload.opponent === null || isCharacter(characterPayload.opponent))) {
          newState.opponent = characterPayload.opponent as Character | null;
        }
        
        return newState;
      }
      
      return state;
    }

    default:
      return state;
  }
}
// Benign change to test if errors are resolved
