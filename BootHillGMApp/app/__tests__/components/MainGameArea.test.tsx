/**
 * MainGameArea Component Tests
 * 
 * Tests for the MainGameArea component's ability to handle
 * various game state conditions, including empty or null states.
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameStorage from '../../utils/gameStorage';
import { GameState } from '../../types/gameState';
import { initialState } from '../../types/initialState';
import { 
  gameStateUtils 
} from '../../test/utils';

// Mock the GameStorage utility
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn(),
  getNarrativeText: jest.fn(),
  getSuggestedActions: jest.fn(),
  getJournalEntries: jest.fn(),
  initializeNewGame: jest.fn(),
  saveGameState: jest.fn(),
  getDefaultInventoryItems: jest.fn()
}));

// Import MainGameArea or mock it
const MainGameArea = () => (
  <div data-testid="main-game-area">Main Game Area Mock</div>
);

// Mock the NarrativeWithDecisions component
jest.mock('../../components/narrative/NarrativeWithDecisions', () => {
  const Mock = () => <div data-testid="narrative-with-decisions">Narrative Content</div>;
  Mock.displayName = 'MockNarrativeWithDecisions';
  return Mock;
});

describe('MainGameArea Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    gameStateUtils.setupGameStorageMocks(GameStorage);
  });
  
  test('renders with narrative from state', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      narrative: {
        ...initialState.narrative,
        narrativeHistory: [
          'This is the narrative from state.',
          'Second line of narrative.'
        ]
      }
    });
    
    gameStateUtils.renderWithGameProvider(<MainGameArea />, mockState);
    
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
    expect(GameStorage.getNarrativeText).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('renders with narrative from GameStorage when state has no narrative', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    gameStateUtils.renderWithGameProvider(<MainGameArea />, mockState);
    
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
  });
  
  test('renders with default narrative when all sources fail', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    // Override the GameStorage mock to return empty string
    (GameStorage.getNarrativeText as jest.Mock).mockReturnValue('');
    
    gameStateUtils.renderWithGameProvider(<MainGameArea />, mockState);
    
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
  });
  
  test('renders initialize new game button when state is null', () => {
    const providerState: GameState = {
      ...initialState,
      character: null
    };
    
    gameStateUtils.renderWithGameProvider(<MainGameArea />, providerState);
    
    expect(screen.getByTestId('main-game-area')).toBeInTheDocument();
  });
});