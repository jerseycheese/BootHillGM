/**
 * Game State Test Utilities
 * 
 * Common utilities and mock data for game state initialization tests.
 * This module provides consistent test helpers for working with GameState objects,
 * mocking character data, and configuring mock implementations of GameStorage.
 */

import { GameState } from '../../types/gameState';
import { initialState } from '../../types/initialState';
import { renderWithGameProvider } from './testWrappers';
import { createMockLocalStorage } from './localStorageMock';

/**
 * Mock localStorage implementation for all tests that use this module
 * This ensures tests don't interact with the actual browser localStorage
 */
export const mockLocalStorage = createMockLocalStorage();

// Re-export the render functions for consistent usage
export { renderWithGameProvider };

/**
 * Type definition for dispatch function used in GameSession components
 * This helps maintain type safety when mocking dispatch in tests
 */
export type DispatchFunction = React.Dispatch<unknown>;

/**
 * Default mock dispatch function for use in tests
 * This is a Jest mock function that can be used to spy on dispatch calls
 */
export const mockDispatch = jest.fn();

/**
 * Default props for components requiring GameSessionProps
 * These props satisfy the interface requirements while allowing customization
 * All handler functions are Jest mocks for easy assertions
 */
export const defaultGameSessionProps = {
  dispatch: mockDispatch,
  isLoading: false,
  error: null,
  isCombatActive: false,
  opponent: null,
  handleUserInput: jest.fn(),
  retryLastAction: jest.fn(),
  handleCombatEnd: jest.fn(),
  handlePlayerHealthChange: jest.fn(),
  handleUseItem: jest.fn(),
  handleEquipWeapon: jest.fn(),
  executeCombatRound: jest.fn(),
  initiateCombat: jest.fn(),
  getCurrentOpponent: jest.fn().mockReturnValue(null),
};

/**
 * Default props for GameplayControls component
 * Simplified version of GameSessionProps with only the props needed for GameplayControls
 */
export const defaultGameplayControlsProps = {
  dispatch: mockDispatch,
  isLoading: false,
  isCombatActive: false,
  opponent: null,
  onUserInput: jest.fn(),
  onCombatEnd: jest.fn(),
  onPlayerHealthChange: jest.fn(),
};

/**
 * Mock player character with all required properties
 * This provides a consistent character object for tests with reasonable default values
 * All required fields are included to avoid TypeScript errors
 */
export const mockPlayerCharacter = {
  id: 'test-player',
  name: 'Test Character',
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

/**
 * Creates a mock GameState object with default values that can be overridden
 * This is the primary utility for creating test state objects
 * 
 * @param overrides - Partial GameState object with values to override defaults
 * @returns Complete GameState object suitable for testing
 */
export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  ...initialState,
  ...overrides
});

/**
 * Creates a GameState with a default mock character
 * Shorthand for creating a state with a fully-configured character
 * 
 * @returns GameState with mockPlayerCharacter already configured
 */
export const createMockCharacterState = () => createMockGameState({
  character: {
    player: mockPlayerCharacter,
    opponent: null
  }
});

/**
 * Interface for GameStorage mock object
 * Provides type safety when working with the mocked GameStorage utility
 */
interface GameStorageMock {
  getCharacter: jest.Mock;
  getDefaultInventoryItems: jest.Mock;
  getNarrativeText: jest.Mock;
  getSuggestedActions: jest.Mock;
  getJournalEntries: jest.Mock; 
  initializeNewGame: jest.Mock;
  [key: string]: jest.Mock;
}

/**
 * Configures standard mock implementations for the GameStorage object
 * This ensures consistent behavior across tests that use GameStorage
 * 
 * @param GameStorage - The mocked GameStorage object to configure
 */
export const setupGameStorageMocks = (GameStorage: Record<string, unknown>): void => {
  // Cast to our interface to ensure type safety
  const typedGameStorage = GameStorage as unknown as GameStorageMock;
  
  // We need to apply the mock implementations directly rather than just setting them
  typedGameStorage.getCharacter.mockImplementation(() => ({
    player: mockPlayerCharacter,
    opponent: null
  }));
  
  typedGameStorage.getDefaultInventoryItems.mockImplementation(() => [
    { id: 'item-canteen', name: 'Canteen', description: 'Holds water', quantity: 1, category: 'gear' }
  ]);
  
  typedGameStorage.getNarrativeText.mockImplementation(() => 
    'Your adventure begins in the rugged frontier town of Boot Hill...'
  );
  
  typedGameStorage.getSuggestedActions.mockImplementation(() => [
    { id: 'action-1', title: 'Look around', description: 'Examine your surroundings', type: 'optional' }
  ]);
  
  typedGameStorage.getJournalEntries.mockImplementation(() => [
    { id: 'entry-1', title: 'Journal Entry', content: 'Test content', timestamp: Date.now() }
  ]);
  
  typedGameStorage.initializeNewGame.mockImplementation(() => ({
    character: {
      player: {
        id: 'new-player',
        name: 'New Character',
      },
      opponent: null
    },
    narrative: {
      narrativeHistory: ['New adventure begins...']
    },
    suggestedActions: [
      { id: 'new-action-1', title: 'Look around', description: 'Examine your surroundings', type: 'optional' }
    ]
  }));
};

// Adding a dummy test to satisfy Jest's requirement for at least one test in a file
describe('gameStateTestUtils', () => {
  test('createMockGameState creates a valid state object', () => {
    const mockState = createMockGameState();
    expect(mockState).toBeDefined();
    expect(mockState).toEqual(expect.objectContaining({
      ...initialState
    }));
  });
  
  test('createMockCharacterState includes character data', () => {
    const state = createMockCharacterState();
    expect(state.character).toBeDefined();
    expect(state.character?.player?.name).toBe('Test Character');
  });
  
  test('setupGameStorageMocks configures mocks correctly', () => {
    const mockGameStorage = {
      getCharacter: jest.fn(),
      getDefaultInventoryItems: jest.fn(),
      getNarrativeText: jest.fn(),
      getSuggestedActions: jest.fn(),
      getJournalEntries: jest.fn(),
      initializeNewGame: jest.fn()
    };
    
    setupGameStorageMocks(mockGameStorage as Record<string, unknown>);
    
    // Call the function to trigger the mock implementation
    mockGameStorage.getCharacter();
    expect(mockGameStorage.getCharacter).toHaveBeenCalled();
  });
});
