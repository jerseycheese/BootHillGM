import { useReducer } from 'react';
import { Character } from '../types/character';
import { ActionTypes } from '../types/actionTypes';

/**
 * Custom hook for managing character stats, including derived stats.
 * Uses a reducer to handle state updates and enforce validation rules.
 */

interface CharacterState {
  character: Character | null;
}

type CharacterAction =
  | { type: typeof ActionTypes.SET_CHARACTER; payload: Character }
  | { type: 'UPDATE_STAT'; payload: { stat: keyof Character['attributes']; value: number } };

const initialState: CharacterState = {
  character: null,
};

/**
 * Reducer function to manage character state updates.
 * Handles setting the character and updating individual stats with validation.
 */
function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case ActionTypes.SET_CHARACTER:
      return { ...state, character: action.payload };
    case 'UPDATE_STAT':
      { // Add opening brace for block scope
        if (!state.character) return state;
        const { stat, value } = action.payload;

        // Basic validation based on Boot Hill rules
        if (
          (stat === 'speed' ||
            stat === 'gunAccuracy' ||
            stat === 'throwingAccuracy' ||
            stat === 'bravery') &&
          (value < 1 || value > 10)
        ) {
          return state;
        }

        if (stat === 'baseStrength' && (value < 8 || value > 20)) {
          return state;
        }

        return {
          ...state,
          character: {
            ...state.character,
            attributes: {
              ...state.character.attributes,
              [stat]: value,
            },
          },
        };
      } // Add closing brace for block scope
    default:
      return state;
  }
}

export default function useCharacterStats() {
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Derived stat calculations based on the current character's attributes
  const derivedStats = {
    hitPoints: state.character ? state.character.attributes.baseStrength * 2 : 0,
    // Add more derived stats here as needed
  };

  /**
   * Sets the character data in the state.
   * @param character The character data to set.
   */
  const setCharacter = (character: Character) => {
    dispatch({ type: ActionTypes.SET_CHARACTER, payload: character });
  };

  /**
   * Updates a specific stat of the character.
   * @param stat The name of the stat to update.
   * @param value The new value of the stat.
   */
  const updateStat = (stat: keyof Character['attributes'], value: number) => {
    dispatch({ type: 'UPDATE_STAT', payload: { stat, value } });
  };

  return {
    character: state.character,
    derivedStats,
    setCharacter,
    updateStat,
  };
}
