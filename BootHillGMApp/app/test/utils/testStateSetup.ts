/**
 * Test State Setup Utilities
 * 
 * Helper functions to prepare test state with adapters applied
 * for component and integration tests.
 */

import { GameState } from '../../types/gameState';
// Removed import of obsolete prepareStateForTesting
import { GameEngineAction } from '../../types/gameActions';
// Removed unused state slice imports

// Removed obsolete TestState interface

// Updated MockStateProvider to remove legacy properties
interface MockStateProvider {
  state: GameState;
  dispatch: jest.Mock;
}

/**
/**
 * Type guard to check if an object has the state provider shape
 */
function isStateProvider(value: unknown): value is { state: GameState; dispatch: (...args: GameEngineAction[]) => GameEngineAction } { // More specific type for dispatch
  return (
    value !== null &&
    typeof value === 'object' &&
    'state' in value &&
    'dispatch' in value &&
    typeof value.dispatch === 'function'
  );
}

/**
 * Creates a mock state provider for testing components that use state
 * 
 * @param initialState Initial state to provide (will be adapted)
 * @param dispatch Mock dispatch function (defaults to no-op)
 * @returns Context value with adapted state and legacy properties
 */
export const createMockStateProvider = (
  initialState: Partial<GameState> = {},
  dispatch: jest.Mock<GameEngineAction, GameEngineAction[]> = jest.fn() // Changed to jest.Mock
): MockStateProvider => { // Changed return type to MockStateProvider
  // Ensure it's in the new format and apply adapters
  // State preparation is no longer needed
  const adaptedState = initialState as GameState;
  // console.log("Initial State:", adaptedState); // Keep log if needed for debugging

  // Return a context value that mimics the structure of GameProvider
  return {
    state: adaptedState,
    dispatch,
    
    // Removed legacy properties
  };
};

/**
 * Merges additional state into an existing state provider
 * Useful for updating state in tests without recreating the whole provider
 * 
 * @param provider Existing state provider
 * @param additionalState Additional state to merge
 * @returns Updated state provider
 */
export const updateMockStateProvider = (
  provider: MockStateProvider,
  additionalState: Partial<GameState>
): MockStateProvider => { // Changed return type to MockStateProvider
  if (!isStateProvider(provider)) {
    throw new Error('Invalid state provider');
  }
  
  // Merge additional state and apply adapters
  // State preparation is no longer needed
  const updatedState = {
    ...provider.state,
    ...additionalState
  } as GameState; // Cast merged state to GameState
  
  // Return updated provider
  return {
    ...provider,
    state: updatedState,
    
    // Removed legacy properties
  };
};

/**
 * Mock data for common test scenarios
 */
export const mockTestData = {
  withCharacter: () => ({
    character: {
      player: {
        id: 'test-player',
        name: 'Test Character',
        attributes: {
          speed: 5,
          gunAccuracy: 6,
          throwingAccuracy: 4,
          strength: 7,
          baseStrength: 7,
          bravery: 5,
          experience: 3
        },
        wounds: [],
        isUnconscious: false,
        isNPC: false,
        isPlayer: true
      }
    }
  }),
  
  withCombat: () => ({
    character: {
      player: {
        id: 'test-player',
        name: 'Test Character',
        attributes: { 
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 7, 
          baseStrength: 7,
          bravery: 5,
          experience: 3
        },
        isNPC: false,
        isPlayer: true
      },
      opponent: {
        id: 'test-opponent',
        name: 'Test Opponent',
        attributes: { 
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 6, 
          baseStrength: 6,
          bravery: 5,
          experience: 3
        },
        isNPC: true,
        isPlayer: false
      }
    },
    combat: {
      isActive: true,
      rounds: 1,
      currentTurn: 'player'
    }
  }),
  
  withInventory: () => ({
    inventory: {
      items: [
        { id: 'item1', name: 'Revolver', type: 'weapon', quantity: 1, category: 'weapon' },
        { id: 'item2', name: 'Bandage', type: 'healing', quantity: 3, category: 'medical' },
        { id: 'item3', name: 'Canteen', type: 'usable', quantity: 1, category: 'general' }
      ]
    }
  }),
  
  withJournal: () => ({
    journal: {
      entries: [
        { id: 'entry1', title: 'Entry 1', content: 'Test content 1', timestamp: 1615000000000 },
        { id: 'entry2', title: 'Entry 2', content: 'Test content 2', timestamp: 1615100000000 }
      ]
    }
  }),
  
  withNarrative: () => ({
    narrative: {
      context: {
        location: 'Saloon',
        time: 'Evening',
        mood: 'Tense'
      },
      currentScene: 'confrontation',
      dialogues: [
        { id: 'dialogue1', speaker: 'NPC', text: 'Hello stranger', timestamp: 1615000000000 }
      ]
    }
  }),
  
  /**
   * Combines multiple test data objects
   * @param testData Array of test data objects to combine
   * @returns Combined test data
   */
  combine: (...testData: Array<Partial<GameState>>) => {
    const combinedState: Partial<GameState> = {};
    for (const current of testData) {
      if (current.character) {
        combinedState.character = { ...combinedState.character, ...current.character };
      }
      if (current.combat) {
        combinedState.combat = { ...combinedState.combat, ...current.combat };
      }
      if (current.inventory) {
        combinedState.inventory = {
          // Preserve existing equipped weapon ID unless overridden by current state
          equippedWeaponId: current.inventory?.equippedWeaponId ?? combinedState.inventory?.equippedWeaponId ?? null,
          items: [
            ...(combinedState.inventory?.items || []),
            ...(current.inventory?.items || [])
          ]
        };
      }
      if (current.journal) {
        combinedState.journal = {
          entries: [
            ...(combinedState.journal?.entries || []),
            ...(current.journal?.entries || [])
          ]
        };
      }
      if (current.narrative) {
        combinedState.narrative = { ...combinedState.narrative, ...current.narrative };
      }
    }
    return combinedState;
  }
};

/**
 * Updates a component test to ensure it's using the mock state with adapters
 * 
 * Example usage in test:
 * ```
 * import { createMockStateProvider, mockTestData } from '../../test/utils/testStateSetup';
 * 
 * // In a test
 * const { state, dispatch } = createMockStateProvider(mockTestData.withInventory());
 * 
 * // Then use in component render
 * render(
 *   <GameContext.Provider value={{ state, dispatch }}>
 *     <ComponentUnderTest />
 *   </GameContext.Provider>
 * );
 * ```
 */
