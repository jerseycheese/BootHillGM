/**
 * Test State Setup Utilities
 * 
 * Helper functions to prepare test state with adapters applied
 * for component and integration tests.
 */

import { GameState } from '../../types/gameState';
import { prepareStateForTesting } from './stateTestUtils';
import { GameEngineAction } from '../../types/gameActions';
import { CharacterState, CombatState, InventoryState, JournalState, NarrativeState } from '../../types/state';

interface TestState extends GameState { // Extend GameState only
  player: CharacterState['player'];
  opponent: CharacterState['opponent'];
  inventory: InventoryState;
  entries: JournalState['entries'];
  isCombatActive: CombatState['isActive'];
  narrativeContext: NarrativeState['narrativeContext'];
  combatRounds: CombatState['rounds'];
  currentTurn: CombatState['currentTurn'];
}

interface MockStateProvider {
  state: GameState;
  dispatch: jest.Mock; // Changed to jest.Mock
  player: TestState['player'];
  opponent: TestState['opponent'];
  inventory: TestState['inventory'];
  entries: TestState['entries'];
  isCombatActive: TestState['isCombatActive'];
  narrativeContext: TestState['narrativeContext'];
  combatRounds: TestState['combatRounds'];
  currentTurn: TestState['currentTurn'];
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
  const adaptedState = prepareStateForTesting(initialState as GameState);
  console.log("Adapted State:", adaptedState); // Added log statement

  // Return a context value that mimics the structure of GameProvider
  return {
    state: adaptedState,
    dispatch,
    
    // Legacy properties
    player: (adaptedState as TestState).player, // Cast adaptedState to TestState
    opponent: (adaptedState as TestState).opponent, // Cast adaptedState to TestState
    inventory: (adaptedState as TestState).inventory, // Cast adaptedState to TestState
    entries: (adaptedState as TestState).entries, // Cast adaptedState to TestState
    isCombatActive: (adaptedState as TestState).isCombatActive, // Cast adaptedState to TestState
    narrativeContext: (adaptedState as TestState).narrativeContext, // Cast adaptedState to TestState
    combatRounds: (adaptedState as TestState).combatRounds, // Cast adaptedState to TestState
    currentTurn: (adaptedState as TestState).currentTurn, // Cast adaptedState to TestState
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
  const updatedState = prepareStateForTesting({
    ...provider.state,
    ...additionalState
  });
  
  // Return updated provider
  return {
    ...provider,
    state: updatedState,
    
    // Update legacy properties
    player: (updatedState as TestState).player, // Cast updatedState to TestState
    opponent: (updatedState as TestState).opponent, // Cast updatedState to TestState
    inventory: (updatedState as TestState).inventory, // Cast updatedState to TestState
    entries: (updatedState as TestState).entries, // Cast updatedState to TestState
    isCombatActive: (updatedState as TestState).isCombatActive, // Cast updatedState to TestState
    narrativeContext: (updatedState as TestState).narrativeContext, // Cast updatedState to TestState
    combatRounds: (updatedState as TestState).combatRounds, // Cast updatedState to TestState
    currentTurn: (updatedState as TestState).currentTurn, // Cast updatedState to TestState
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
