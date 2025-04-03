import React from 'react';
import { render, screen } from '@testing-library/react';
import TestWrapper, { createGameProviderWrapper, renderWithProviders } from './testWrappers';
import { GameState } from '../types/gameState';

// Mock the GameStateProvider and NarrativeProvider
jest.mock('../context/GameStateProvider', () => ({
  GameStateProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-game-state-provider">{children}</div>
  ),
  useGameState: jest.fn().mockReturnValue({
    state: {},
    dispatch: jest.fn()
  })
}));

jest.mock('../hooks/narrative/NarrativeProvider', () => ({
  NarrativeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-narrative-provider">{children}</div>
  ),
  useNarrative: jest.fn().mockReturnValue({
    state: {},
    dispatch: jest.fn()
  })
}));

describe('Test Wrappers', () => {
  test('TestWrapper renders providers correctly', () => {
    render(
      <TestWrapper>
        <div data-testid="test-content">Test Content</div>
      </TestWrapper>
    );

    // Check that our providers and content are rendered
    expect(screen.getByTestId('mock-game-state-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-narrative-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('createGameProviderWrapper creates a wrapper with providers', () => {
    const Wrapper = createGameProviderWrapper();
    
    render(
      <Wrapper>
        <div data-testid="test-content">Test Content</div>
      </Wrapper>
    );

    // Check that our providers and content are rendered
    expect(screen.getByTestId('mock-game-state-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-narrative-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('renderWithProviders renders the component with providers', () => {
    renderWithProviders(
      <div data-testid="test-content">Test Content</div>
    );

    // Check that our providers and content are rendered
    expect(screen.getByTestId('mock-game-state-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-narrative-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('createGameProviderWrapper accepts initialState', () => {
    const initialState: Partial<GameState> = {
      inventory: { items: [] },
      gameProgress: 50
    };
    
    const Wrapper = createGameProviderWrapper(initialState);
    
    render(
      <Wrapper>
        <div data-testid="test-content">With Custom State</div>
      </Wrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('With Custom State')).toBeInTheDocument();
  });

  test('renderWithProviders accepts initialState', () => {
    const initialState: Partial<GameState> = {
      inventory: { items: [] },
      gameProgress: 50
    };
    
    renderWithProviders(
      <div data-testid="test-content">With Custom State</div>,
      { initialState }
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('With Custom State')).toBeInTheDocument();
  });
});
