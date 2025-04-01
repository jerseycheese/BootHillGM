import { useState, useEffect, useRef } from 'react';
import { Character } from '../types/character';
import { GameState } from '../types/gameState';

/**
 * Custom hook to safely extract player character from game state
 * 
 * @param state - Current game state
 * @returns Object containing player character, error state, and recovery flags
 */
export function useCharacterExtraction(state: GameState | null | undefined) {
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null);
  const [playerCharacterError, setPlayerCharacterError] = useState<Error | null>(null);
  
  // Refs for tracking recovery state
  const recoveryInProgress = useRef(false);
  const characterRecovered = useRef(false);

  // Extract player character safely
  useEffect(() => {
    if (!state || !state.character || characterRecovered.current) return;

    try {
      let extractedCharacter = null;
      
      // Safely handle different character data formats
      if (state.character) {
        if (typeof state.character === 'object' && 'player' in state.character && state.character.player) {
          // CharacterState format
          extractedCharacter = state.character.player;
        } else if (typeof state.character === 'object' && 'attributes' in state.character) {
          // Direct Character structure
          extractedCharacter = state.character as unknown as Character;
        }
      }
      
      // Validate minimum required properties
      if (extractedCharacter && 
          typeof extractedCharacter === 'object' && 
          'attributes' in extractedCharacter && 
          extractedCharacter.attributes && 
          typeof extractedCharacter.attributes === 'object') {
        // Valid character found
        setPlayerCharacter(extractedCharacter);
        setPlayerCharacterError(null); // Clear any previous error
      } else if (extractedCharacter) {
        // Character object exists but is missing attributes - likely an intermediate state.
        // Don't throw an error, just wait for a valid state. Log it for debugging.
        console.warn('Intermediate character state detected (missing attributes). Waiting for valid state.');
        // Optionally clear the character if we want to show loading
        // setPlayerCharacter(null);
      } else {
        // No character object found at all in the state.
        // This might be normal during initial load before state is hydrated.
        // setPlayerCharacter(null); // Ensure character is null
      }
    } catch (error) { // Catch any unexpected errors during extraction
      console.error('Unexpected error extracting player character:', error);
      setPlayerCharacterError(error instanceof Error ? error : new Error('Unknown extraction error'));
      setPlayerCharacter(null);
    }
  }, [state]);

  return {
    playerCharacter,
    playerCharacterError,
    recoveryInProgress,
    characterRecovered
  };
}
