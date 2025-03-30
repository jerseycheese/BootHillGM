/**
 * Factory function for creating mock states with proper typing
 * Central component that handles state preparation and getter creation
 */
import { GameState } from '../../../types/gameState';
import { BaseMockState } from './types';

// Forward declaration to avoid circular dependency
// This is defined in index.ts but used here
import { prepareStateForTesting } from './index';

/**
 * Helper function to create a mock state with properly typed getters
 * Similar to React's component factory pattern
 * 
 * @param {BaseMockState} state - The base state to convert
 * @returns {GameState} A properly formatted game state with getters and adapters applied
 */
export function createMockState(state: BaseMockState): GameState {
  // Define a function to create getters properly
  const createGetters = (baseState: BaseMockState): {
    player: BaseMockState['character']['player'];
    isCombatActive: boolean;
  } => {
    // Since we can't add this parameters to getters, we'll use a reference variable
    // to maintain type safety while still benefiting from TypeScript's checking
    const self = baseState;
    
    return {
      get player() { 
        return self.character.player; 
      },
      get isCombatActive() { 
        return self.combat.isActive; 
      }
    };
  };
  
  // Create the complete state with getters
  const completeState = {
    ...state,
    ...createGetters(state)
  };
  
  // Finally, adapt the state for testing
  return prepareStateForTesting(completeState as unknown as GameState);
}