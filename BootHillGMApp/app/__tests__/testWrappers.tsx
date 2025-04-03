import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GameStateProvider } from '../context/GameStateProvider';
import { NarrativeProvider } from '../hooks/narrative/NarrativeProvider';
import { GameState } from '../types/gameState';
import { initialState } from '../types/initialState';

/**
 * TestWrapper component with display name for React testing
 */
const TestWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
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
 * 
 * @param initialState Optional initial state to provide
 * @returns A wrapper component for testing
 */
export const createGameProviderWrapper = (initialState?: Partial<GameState>) => {
  // Return a wrapper component that includes the GameStateProvider
  const GameProviderWrapperComponent: React.FC<{children: React.ReactNode}> = ({ children }) => (
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
 */
export const renderWithProviders = (
  ui: React.ReactElement, 
  { initialState, ...renderOptions }: { initialState?: Partial<GameState> } & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <GameStateProvider initialState={initialState as GameState || initialState}>
      <NarrativeProvider>
        {children}
      </NarrativeProvider>
    </GameStateProvider>
  );
  
  // Add display name
  Wrapper.displayName = 'TestProviderWrapper';
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Dummy test to satisfy Jest's requirement
if (typeof describe === 'function') {
  describe('TestWrappers', () => {
    it('exists', () => {
      expect(TestWrapper).toBeDefined();
      expect(createGameProviderWrapper).toBeDefined();
      expect(renderWithProviders).toBeDefined();
    });
  });
}

export default TestWrapper;
