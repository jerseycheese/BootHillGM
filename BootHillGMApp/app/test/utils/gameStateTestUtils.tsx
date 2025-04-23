/**
 * Game State Test Utilities
 * 
 * Provides helpers for testing components that rely on GameState.
 * This module provides consistent test helpers for working with GameState objects,
 * mocking character data, and configuring mock implementations of GameStorage.
 */

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { GameState, initialGameState } from '../../types/gameState';
import { CampaignStateProvider } from '../../components/CampaignStateProvider';
import { deepMerge } from './objectUtils';
import GameProvider from '../../utils/gameEngine';
import { CampaignStateContextType } from '../../types/campaignState.types';

type MockFn = ((...args: any[]) => any) & {
  calls: any[][];
  returnValue: any;
  mockReturnValue(value: any): MockFn;
};

// Create mock function implementation that works in both browser and test environments
export function createMockFn(): MockFn {
  const fn = ((...args: any[]) => {
    fn.calls.push(args);
    return fn.returnValue;
  }) as MockFn;
  fn.calls = [];
  fn.returnValue = undefined;
  fn.mockReturnValue = (value: any) => {
    fn.returnValue = value;
    return fn;
  };
  return fn;
}

/**
 * Mock localStorage implementation for testing
 */
export const mockLocalStorage = {
  store: {} as Record<string, string>,

  getItem: (key: string): string | null => {
    return mockLocalStorage.store[key] || null;
  },

  setItem: (key: string, value: string): void => {
    mockLocalStorage.store[key] = value;
  },

  removeItem: (key: string): void => {
    delete mockLocalStorage.store[key];
  },

  clear: (): void => {
    mockLocalStorage.store = {};
  },

  get length(): number {
    return Object.keys(mockLocalStorage.store).length;
  },

  key: (index: number): string | null => {
    const keys = Object.keys(mockLocalStorage.store);
    return keys[index] || null;
  }
};

/**
 * Setup GameStorage mocks for testing
 * This configures the mock implementations of the GameStorage functions
 */
export const setupGameStorageMocks = (GameStorageMock: any) => {
  // Mock the core functions used in tests
  GameStorageMock.getCharacter = createMockFn().mockReturnValue({ 
    player: null, 
    opponent: null 
  });
  GameStorageMock.getJournalEntries = createMockFn().mockReturnValue([]);
  GameStorageMock.getDefaultInventoryItems = createMockFn().mockReturnValue([]);
  GameStorageMock.getGameState = createMockFn().mockReturnValue(null);
  GameStorageMock.getNarrativeText = createMockFn().mockReturnValue([]);
  GameStorageMock.saveGameState = createMockFn();
  
  return GameStorageMock;
};

/**
 * Create a mock GameState for testing
 * Allows for deep merging partial state
 */
export const createMockGameState = (partialState: Partial<GameState> = {}): GameState => {
  return deepMerge(initialGameState, partialState);
};

/**
 * Default props for gameplay controls components
 */
export const defaultGameplayControlsProps = {
  onAction: createMockFn(),
  onNavigate: createMockFn(),
  dispatch: createMockFn()
};

/**
 * Default props for GameSession components testing
 */
export const defaultGameSessionProps = {
  state: initialGameState,
  dispatch: createMockFn(),
  handleEquipWeapon: createMockFn(),
  isLoading: false,
  error: null,
  isCombatActive: false,
  opponent: null,
  handleCombatEnd: createMockFn().mockReturnValue(Promise.resolve()),
  handlePlayerHealthChange: createMockFn(),
  handleStrengthChange: createMockFn(),
  handleUseItem: createMockFn(),
};

/**
 * Render a component with CampaignStateProvider
 */
export const renderWithCampaignStateProvider = (
  ui: React.ReactElement,
  state: GameState = initialGameState
): RenderResult => {
  return render(
    <CampaignStateProvider initialState={state}>
      {ui}
    </CampaignStateProvider>
  );
};

/**
 * Render a component with GameProvider wrapper
 */
export const renderWithGameProvider = (
  ui: React.ReactElement,
  state: GameState = initialGameState
): RenderResult => {
  // Convert GameState to ExtendedGameState
  const extendedState = {
    ...state,
    opponent: state.character?.opponent || null
  };

  return render(
    <GameProvider initialExtendedState={extendedState}>
      {ui}
    </GameProvider>
  );
};

/**
 * Create a wrapper component with both providers for use in testing-library
 */
export const createGameProviderWrapper = (state: GameState = initialGameState) => {
  const extendedState = {
    ...state,
    opponent: state.character?.opponent || null
  };

  const GameProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <GameProvider initialExtendedState={extendedState}>
        <CampaignStateProvider initialState={state}>
          {children}
        </CampaignStateProvider>
      </GameProvider>
    );
  };
  GameProviderWrapper.displayName = 'TestGameProviderWrapper'; // Add display name
  return GameProviderWrapper;
};

/**
 * Render a component wrapped in both providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  state: GameState = initialGameState
): RenderResult => {
  const wrapper = createGameProviderWrapper(state);
  return render(ui, { wrapper });
};

// Export all utilities
export const gameStateUtils = {
  mockLocalStorage,
  setupGameStorageMocks,
  createMockGameState,
  defaultGameplayControlsProps,
  defaultGameSessionProps,
  renderWithCampaignStateProvider,
  renderWithGameProvider,
  renderWithProviders,
  createGameProviderWrapper,
  createMockFn
};

export default gameStateUtils;