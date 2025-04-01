import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GameProvider, GameContext, GameContextProps } from '../../hooks/useGame'; // Import GameContext & Props
import { ExtendedGameState } from '../../types/extendedState';
import { GameState } from '../../types/gameState'; // Import GameState
import { createDefaultMockGameState } from './inventoryTestUtils'; // Import state creator
/**
 * Creates a wrapper component with GameProvider for testing hooks and components
 * that rely on the GameContext.
 * 
 * @param initialState Optional initial state to provide
 * @returns A wrapper component for testing
 */
export const createGameProviderWrapper = (initialState?: Partial<ExtendedGameState>) => {
  // Prepare state with adapters if provided
  // State preparation is no longer needed
  const state = initialState as ExtendedGameState | undefined;
  
  // Return a wrapper component that includes the GameProvider
  const GameProviderWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider initialState={state}>
      {children}
    </GameProvider>
  );

  // Add display name
  GameProviderWrapper.displayName = 'GameProviderWrapper';
  
  return GameProviderWrapper;
};

/**
 * Custom render function that wraps the component with GameProvider
 * 
 * @param ui Component to render
 * @param initialState Optional initial state for the GameProvider
 * @param options Additional render options
 * @returns The rendered component with RTL utilities
 */
export const renderWithGameProvider = (
  ui: React.ReactElement, 
  initialState?: Partial<ExtendedGameState>,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = createGameProviderWrapper(initialState);
  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Custom render function that wraps the component with a mock GameContext value,
 * bypassing the actual GameProvider's useReducer logic. Useful for isolating
 * components from reducer initialization issues during tests.
 *
 * @param ui Component to render
 * @param mockStateOverrides Partial GameState to merge with defaults for the mock context
 * @param options Additional render options
 * @returns The rendered component with RTL utilities and mock context
 */
export const renderWithMockContext = (
  ui: React.ReactElement,
  mockStateOverrides: Partial<GameState> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Ensure we have a complete base state to avoid partial state issues
  const baseState = createDefaultMockGameState();
  const mockState: GameState = {
     ...baseState,
     ...mockStateOverrides,
     // Deep merge slice overrides manually if necessary, example for character:
     character: {
       ...baseState.character,
       ...(mockStateOverrides.character || {}),
       // Ensure player/opponent are explicitly null if undefined after merge
       player: (mockStateOverrides.character?.player !== undefined ? mockStateOverrides.character.player : baseState.character?.player) ?? null,
       opponent: (mockStateOverrides.character?.opponent !== undefined ? mockStateOverrides.character.opponent : baseState.character?.opponent) ?? null,
     },
     inventory: {
        ...baseState.inventory,
        ...(mockStateOverrides.inventory || {}),
     },
     combat: {
        ...baseState.combat,
        ...(mockStateOverrides.combat || {}),
     },
     // Add other slices as needed for deep merging
     journal: {
        ...baseState.journal,
        ...(mockStateOverrides.journal || {}),
     },
     narrative: {
        ...baseState.narrative,
        ...(mockStateOverrides.narrative || {}),
     },
     ui: {
        ...baseState.ui,
        ...(mockStateOverrides.ui || {}),
     },
   };
  const mockDispatch = jest.fn();

  // Construct the simplified context value matching the updated GameContextProps
  const mockContextValue: GameContextProps = {
    state: mockState, // Provide the merged mock state
    dispatch: mockDispatch, // Provide the mock dispatch
  };

  // Simple wrapper component providing the mock context value
  const MockContextWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameContext.Provider value={mockContextValue}>
      {children}
    </GameContext.Provider>
  );
  MockContextWrapper.displayName = 'MockContextWrapper';

  // Render the UI with the mock context wrapper
  return render(ui, { wrapper: MockContextWrapper, ...options });
};