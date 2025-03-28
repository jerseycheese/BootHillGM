import { GameState } from '../types/gameState';
import { Character } from '../types/character';
// Import the global declarations if needed for window.bhgmDebug
import '../types/global.d';

/**
 * Check if the game state is ready for decisions.
 * 
 * This function validates that all required game state elements
 * are present and in the appropriate state for decision generation.
 * 
 * @param gameState - Current game state
 * @returns True if the game state is ready, false otherwise
 */
export function isGameStateReadyForDecisions(gameState: GameState): boolean {
  // Must have a character
  if (!gameState.character) {
    return false;
  }
  
  // Must have player character
  if (!gameState.character.player) {
    return false;
  }
  
  // Must have some narrative history
  if (gameState.narrative.narrativeHistory.length < 2) {
    return false;
  }
  
  // Must not be in combat
  if (gameState.combat?.isActive) {
    return false;
  }
  
  return true;
}

/**
 * Get the latest game state from debug tools if available
 * 
 * This helper ensures we always work with the most up-to-date state
 * when generating decisions, fixing the stale context issue (#210)
 * 
 * @param originalState - The state initially passed to the function
 * @returns The most up-to-date game state available
 */
export function getRefreshedGameState(originalState: GameState): GameState {
  // In browser environment, try to get fresh state from debug tools
  if (typeof window !== 'undefined' && window.bhgmDebug?.getState) {
    try {
      const freshState = window.bhgmDebug.getState();
      
      // If we got a valid state, update the narrative portion
      if (freshState && freshState.narrative) {
        return {
          ...originalState,
          narrative: freshState.narrative
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to get fresh state from debug tools:', error);
      }
    }
  }
  
  // Fall back to the original state
  return originalState;
}

/**
 * Safely get the player character, ensuring it's not null
 * This is a helper to handle the Character | null type
 * 
 * @param gameState - Current game state
 * @returns Player character or a default character if none exists
 */
export function getSafePlayerCharacter(gameState: GameState): Character {
  if (!gameState.character || !gameState.character.player) {
    // Return a minimally valid Character to satisfy the type system
    // This should rarely happen since we check isGameStateReadyForDecisions first
    return {
      id: 'default-player',
      name: 'Player',
      isNPC: false,
      isPlayer: true,
      inventory: { items: [] },
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 0
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      wounds: [],
      isUnconscious: false
    };
  }
  
  return gameState.character.player;
}
