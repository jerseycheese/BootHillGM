/**
 * Test Wrappers for Boot Hill GM
 * 
 * This file provides wrapper components and render functions for testing
 * hooks and components that rely on GameStateProvider and NarrativeProvider.
 * 
 * Use these utilities to:
 * - Render components with the necessary providers
 * - Test hooks that require context
 * - Mock state and dispatch functions
 */

import React, { Dispatch } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GameStateContext, GameStateProvider } from '../../context/GameStateProvider';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { createDefaultMockGameState } from './inventoryTestUtils';
import { NarrativeProvider } from '../../hooks/narrative/NarrativeProvider';
import { initialState } from '../../types/initialState';

// Define the context type based on GameStateProvider's context
interface GameStateContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/**
 * Basic test wrapper component with both GameStateProvider and NarrativeProvider
 */
export const TestWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <GameStateProvider initialState={initialState}>
    <NarrativeProvider>
      {children}
    </NarrativeProvider>
  </GameStateProvider>
);

// Set a display name for the component to avoid ESLint warnings
TestWrapper.displayName = 'TestProviderWrapper';

/**
 * Creates a wrapper component with the correct GameStateProvider for testing hooks and components
 * that rely on the GameStateContext.
 * 
 * @param initialState Optional initial state to provide
 * @returns A wrapper component for testing
 * 
 * @example
 * const wrapper = createGameProviderWrapper({
 *   narrative: { narrativeHistory: ['Event 1'] }
 * });
 * const { result } = renderHook(() => useNarrative(), { wrapper });
 */
export const createGameProviderWrapper = (initialState?: Partial<GameState>) => {
  // Return a wrapper component that includes the GameStateProvider
  const GameProviderWrapperComponent = ({ children }: { children: React.ReactNode }) => (
    // Pass the initial state to the correct provider with the property name it expects
    <GameStateProvider initialState={initialState as GameState}>
      <NarrativeProvider>
        {children}
      </NarrativeProvider>
    </GameStateProvider>
  );

  // Add display name
  GameProviderWrapperComponent.displayName = 'GameProviderWrapper';
  
  return GameProviderWrapperComponent;
};

/**
 * Custom render function that wraps the component with GameStateProvider
 * 
 * @param ui Component to render
 * @param initialState Optional initial state for the GameStateProvider
 * @param options Additional render options
 * @returns The rendered component with RTL utilities
 * 
 * @example
 * const { getByText } = renderWithGameProvider(<MyComponent />, {
 *   inventory: { items: [{ id: '1', name: 'Potion' }] }
 * });
 */
export const renderWithGameProvider = (
  ui: React.ReactElement, 
  initialState?: Partial<GameState>,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = createGameProviderWrapper(initialState);
  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Legacy alias for renderWithGameProvider to maintain backward compatibility
 * @deprecated Use renderWithGameProvider instead
 */
export const renderWithProviders = (
  ui: React.ReactElement, 
  { initialState, ...renderOptions }: { initialState?: Partial<GameState> } & Omit<RenderOptions, 'wrapper'> = {}
) => {
  return renderWithGameProvider(ui, initialState, renderOptions);
};

/**
 * Custom render function that wraps the component with a mock GameStateContext value,
 * bypassing the actual GameStateProvider's useReducer logic. Useful for isolating
 * components from reducer initialization issues during tests.
 *
 * @param ui Component to render
 * @param mockStateOverrides Partial GameState to merge with defaults for the mock context
 * @param options Additional render options
 * @returns The rendered component with RTL utilities and mock context
 * 
 * @example
 * const mockDispatch = jest.fn();
 * const { getByText } = renderWithMockContext(<MyComponent />, {
 *   inventory: { items: [{ id: '1', name: 'Potion' }] }
 * });
 * // Later assert if actions were dispatched
 * expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_ITEM', payload: {...} });
 */
export const renderWithMockContext = (
  ui: React.ReactElement,
  mockStateOverrides: Partial<GameState> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Ensure we have a complete base state to avoid partial state issues
  const baseState = createDefaultMockGameState();
  // Deep merge state overrides - ensure nested objects are handled
  const mockState: GameState = {
     ...baseState,
     ...mockStateOverrides,
     character: {
       ...baseState.character,
       ...(mockStateOverrides.character || {}),
       player: (mockStateOverrides.character?.player !== undefined ? mockStateOverrides.character.player : baseState.character?.player) ?? null,
       opponent: (mockStateOverrides.character?.opponent !== undefined ? mockStateOverrides.character.opponent : baseState.character?.opponent) ?? null,
     },
     inventory: {
        ...baseState.inventory,
        ...(mockStateOverrides.inventory || {}),
        items: mockStateOverrides.inventory?.items ?? baseState.inventory.items, // Ensure items array is merged
     },
     combat: {
        ...baseState.combat,
        ...(mockStateOverrides.combat || {}),
     },
     journal: {
        ...baseState.journal,
        ...(mockStateOverrides.journal || {}),
        entries: mockStateOverrides.journal?.entries ?? baseState.journal.entries, // Ensure entries array is merged
     },
     narrative: {
        ...baseState.narrative,
        ...(mockStateOverrides.narrative || {}),
        // Ensure nested narrative properties are merged if necessary
        narrativeHistory: mockStateOverrides.narrative?.narrativeHistory ?? baseState.narrative.narrativeHistory,
        availableChoices: mockStateOverrides.narrative?.availableChoices ?? baseState.narrative.availableChoices,
     },
     ui: {
        ...baseState.ui,
        ...(mockStateOverrides.ui || {}),
     },
     // Ensure top-level properties are also merged correctly
     suggestedActions: mockStateOverrides.suggestedActions ?? baseState.suggestedActions,
     location: mockStateOverrides.location !== undefined ? mockStateOverrides.location : baseState.location,
   };
  const mockDispatch = jest.fn();

  // Construct the context value matching GameStateContextType
  const mockContextValue: GameStateContextType = {
    state: mockState, // Provide the merged mock state
    dispatch: mockDispatch, // Provide the mock dispatch
  };

  // Simple wrapper component providing the mock context value using the correct context
  const MockContextWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameStateContext.Provider value={mockContextValue}>
      <NarrativeProvider>
        {children}
      </NarrativeProvider>
    </GameStateContext.Provider>
  );
  MockContextWrapper.displayName = 'MockContextWrapper';

  // Render the UI with the mock context wrapper
  return {
    ...render(ui, { wrapper: MockContextWrapper, ...options }),
    // Also expose mock state and dispatch for assertions
    mockState,
    mockDispatch
  };
};

// Export default for convenience
export default TestWrapper;