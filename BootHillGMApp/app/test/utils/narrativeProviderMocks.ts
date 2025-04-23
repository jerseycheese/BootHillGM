/**
 * Mocks for testing the NarrativeProvider component
 * 
 * Provides mock implementations and utilities for testing
 * components that use the NarrativeProvider and useNarrative hook.
 * 
 * @example
 * // In your test file
 * import { 
 *   mockUseNarrative,
 *   setupNarrativeProviderMocks
 * } from '../utils/narrativeProviderMocks';
 * 
 * // Setup mocks before tests
 * setupNarrativeProviderMocks();
 * 
 * // Configure mock implementation for a specific test
 * mockUseNarrative.mockReturnValue({
 *   state: { ... },
 *   dispatch: jest.fn()
 * });
 */
import { initialGameState, GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';

// Mock for useNarrative hook
export const mockUseNarrative = jest.fn();

// Standard error for when hook is used outside provider
export const mockNarrativeError = new Error('useNarrative must be used within a NarrativeProvider');

// Create mock implementations for useGameState
export const mockGameStateWithEmptyNarrative: {
  state: GameState; 
  dispatch: jest.Mock;
} = {
  state: {
    ...initialGameState,
    narrative: {
      ...initialGameState.narrative,
      narrativeHistory: []
    },
  },
  dispatch: jest.fn()
};

/**
 * Standard mock return type for useNarrative
 */
export interface MockNarrativeContextValue {
  state: GameState;
  dispatch: jest.Mock<void, [GameAction]>;
}

/**
 * Creates a default mock return value for the useNarrative hook
 * 
 * @returns A mock narrative context value with empty state and mock dispatch
 */
export const createMockNarrativeContext = (): MockNarrativeContextValue => ({
  state: {
    ...initialGameState,
    narrative: {
      ...initialGameState.narrative,
      narrativeHistory: []
    }
  },
  dispatch: jest.fn()
});

/**
 * Setup all mocks required for the NarrativeProvider tests
 * This includes mocking both the GameStateProvider and NarrativeProvider
 */
export const setupNarrativeProviderMocks = (): void => {
  // Mock for GameStateProvider
  jest.mock('../../context/GameStateProvider', () => ({
    useGameState: jest.fn().mockReturnValue(mockGameStateWithEmptyNarrative)
  }));

  // Mock for NarrativeProvider
  jest.mock('../../hooks/narrative/NarrativeProvider', () => {
    // Save original module
    const originalModule = jest.requireActual('../../hooks/narrative/NarrativeProvider');
    
    return {
      ...originalModule,
      // Override useNarrative for testing
      useNarrative: () => mockUseNarrative(),
      // Keep NarrativeProvider as is
      NarrativeProvider: originalModule.NarrativeProvider
    };
  });

  // Reset the mock implementation to a default value
  mockUseNarrative.mockReturnValue(createMockNarrativeContext());
};
