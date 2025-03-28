import { GameState } from '../../types/gameState';
import { LegacyState } from './stateAdapterTypes';

/**
 * Character State Adapter
 * 
 * Maps the new character slice structure back to the original format
 * expected by legacy components and tests.
 */
export const characterAdapter = {
  // Getter to adapt new state to old state shape
  getPlayer: (state: GameState) => {
    return state?.character?.player || null;
  },
  
  // Getter to adapt new state to old state shape
  getOpponent: (state: GameState) => {
    return state?.character?.opponent || null;
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Cast to a type that includes legacy properties
    const legacyState = state as unknown as LegacyState;
    
    // Only create a new state if we need to add legacy properties
    if (legacyState.player !== undefined && legacyState.opponent !== undefined) {
      // Legacy properties already exist, no need to add them
      return state;
    }
    
    // Use property descriptors for dynamic computed properties
    return Object.defineProperties(
      // Shallow copy of the state
      { ...state },
      {
        // Define getters for legacy properties that compute values on demand
        player: {
          get: () => state.character?.player || null,
          enumerable: true,
          configurable: true
        },
        opponent: {
          get: () => state.character?.opponent || null,
          enumerable: true,
          configurable: true
        }
      }
    );
  }
};