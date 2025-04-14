// /app/utils/initialization/scenarios/restoredGameState.ts
import { Dispatch } from 'react';
import { GameAction } from '../../../types/actions';
import { Character } from '../../../types/character';
import { debug } from '../initHelpers';

/**
 * Handles normal state restoration when saved state exists
 * This function is called when a user returns to a game with existing save data
 * It restores the entire game state from the saved JSON string
 * 
 * @param params - Object containing restoration parameters
 * @param params.character - The player character
 * @param params.savedState - JSON string containing the saved game state
 * @param params.dispatch - Redux dispatch function
 * @returns Promise resolving to void
 */
export async function handleRestoredGameState(params: {
  character: Character;
  savedState: string;
  dispatch: Dispatch<GameAction>;
}): Promise<void> {
  const { character, savedState, dispatch } = params;
  
  if (process.env.NODE_ENV !== 'production') {
    debug('Found saved state, restoring game...');
  }
  
  try {
    const parsedState = JSON.parse(savedState);
    
    // Ensure character is properly set in parsed state
    if (parsedState.character) {
      parsedState.character.player = character;
    }
    
    dispatch({ 
      type: 'SET_STATE', 
      payload: parsedState 
    } as GameAction);
    
    if (process.env.NODE_ENV !== 'production') {
      debug('Game state restored');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== 'production') {
      debug('Error restoring game state:', errorMessage);
    }
    
    // Re-throw to let caller handle the error
    throw new Error(`Failed to restore game state: ${errorMessage}`);
  }
}
