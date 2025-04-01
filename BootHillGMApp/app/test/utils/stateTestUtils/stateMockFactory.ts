/**
 * Factory function for creating mock states with proper typing
 * Central component that handles state preparation and getter creation
 */
import { GameState } from '../../../types/gameState';
import { BaseMockState } from './types';
import { createDefaultMockGameState } from '../inventoryTestUtils'; // Import default state creator

// Forward declaration to avoid circular dependency
// This is defined in index.ts but used here
// Removed import of obsolete prepareStateForTesting

/**
 * Helper function to create a mock state with properly typed getters
 * Similar to React's component factory pattern
 * 
 * @param {BaseMockState} state - The base state to convert
 * @returns {GameState} A properly formatted game state with getters and adapters applied
 */
export function createMockState(state: BaseMockState): GameState {
  // Create a default GameState structure
  const defaultState = createDefaultMockGameState();

  // Deep merge the provided BaseMockState into the default GameState
  // This ensures all required properties exist, especially in nested slices
  const mergedState: GameState = {
    ...defaultState, // Start with the full default structure
    ...state, // Override top-level properties from input state
    // Deep merge slices, ensuring base properties exist if input slice is partial
    character: {
      ...defaultState.character,
      ...state.character,
    },
    combat: {
      ...defaultState.combat,
      ...state.combat,
    },
    inventory: {
      ...defaultState.inventory,
      ...state.inventory,
    },
    journal: {
      ...defaultState.journal,
      ...state.journal,
    },
    narrative: {
      ...defaultState.narrative,
      ...state.narrative,
      // Deep merge narrativeContext if it exists in input state
      narrativeContext: state.narrative?.narrativeContext ? {
        ...defaultState.narrative.narrativeContext,
        ...state.narrative.narrativeContext,
      } : defaultState.narrative.narrativeContext,
    },
    ui: {
      ...defaultState.ui,
      ...state.ui,
    },
  };

  return mergedState;
}