/**
 * Test Wrapper Utilities
 *
 * Helper components for wrapping test components with providers
 */

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import GameProvider from '../../utils/gameEngine';
import { CampaignStateContext } from '../../hooks/useCampaignStateContext';
import { CampaignStateProvider } from '../../components/CampaignStateProvider';
import { GameState, initialGameState as importedInitialGameState } from '../../types/gameState';
import { createMockFn } from './mockUtils';

export interface TestWrapperProps {
  children: ReactNode;
  initialGameState?: GameState;
}

/**
 * Base test wrapper component that provides both GameProvider and CampaignStateContext
 */
export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialGameState: wrapperInitialState = importedInitialGameState
}) => {
  // Determine if we're in a test environment
  const mockFunction = typeof jest !== 'undefined' ? jest.fn : createMockFn;
  
  const contextValue = {
    state: wrapperInitialState,
    dispatch: mockFunction(),
    saveGame: mockFunction(),
    loadGame: mockFunction(),
    cleanupState: mockFunction(),
    player: wrapperInitialState.character?.player || null,
    opponent: wrapperInitialState.character?.opponent || null,
    inventory: wrapperInitialState.inventory?.items || [],
    entries: wrapperInitialState.journal?.entries || [],
    isCombatActive: wrapperInitialState.combat?.isActive || false,
    narrativeContext: wrapperInitialState.narrative?.narrativeContext
  };

  return (
    <GameProvider>
      <CampaignStateContext.Provider value={contextValue}>
        {children}
      </CampaignStateContext.Provider>
    </GameProvider>
  );
};

/**
 * Custom render function that wraps with all providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialGameState?: GameState }
) {
  const initialState = options?.initialGameState || importedInitialGameState;
  return render(ui, {
    wrapper: props => (
      <TestWrapper initialGameState={initialState} {...props} />
    ),
    ...options
  });
}

/**
 * Re-export everything from testing-library/react
 */
export * from '@testing-library/react';
