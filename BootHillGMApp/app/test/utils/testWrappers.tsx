import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GameProvider } from '../../hooks/useGame';
import { ExtendedGameState } from '../../types/extendedState';
import { prepareStateForTesting } from './stateTestUtils';

/**
 * Creates a wrapper component with GameProvider for testing hooks and components
 * that rely on the GameContext.
 * 
 * @param initialState Optional initial state to provide
 * @returns A wrapper component for testing
 */
export const createGameProviderWrapper = (initialState?: Partial<ExtendedGameState>) => {
  // Prepare state with adapters if provided
  const state = initialState ? prepareStateForTesting(initialState) as ExtendedGameState : undefined;
  
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