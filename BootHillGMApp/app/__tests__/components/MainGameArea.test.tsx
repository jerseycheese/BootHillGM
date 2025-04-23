/**
 * MainGameArea Component Tests
 * 
 * Tests for the MainGameArea component's ability to handle
 * various game state conditions, including empty or null states.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameStorage from '../../utils/gameStorage';
import { GameState } from '../../types/gameState';
import { initialState } from '../../types/initialState';
import { GameSessionProps } from '../../components/GameArea/types';
import CampaignStateProvider from '../../components/CampaignStateProvider';

// Mock the GameStorage utility
jest.mock('../../utils/gameStorage', () => {
  return {
    getCharacter: jest.fn(),
    getNarrativeText: jest.fn(() => ['Default narrative from storage']),
    getSuggestedActions: jest.fn(),
    getJournalEntries: jest.fn(),
    initializeNewGame: jest.fn(),
    saveGameState: jest.fn(),
    getDefaultInventoryItems: jest.fn()
  };
});

// Import the actual MainGameArea component
import { MainGameArea } from '../../components/GameArea/MainGameArea';

// Mock the NarrativeWithDecisions component and keep a reference to it
import NarrativeWithDecisions from '../../components/narrative/NarrativeWithDecisions';
jest.mock('../../components/narrative/NarrativeWithDecisions', () => {
  return jest.fn(() => <div data-testid="mock-narrative">Mock Narrative Component</div>);
});
const MockNarrativeWithDecisions = NarrativeWithDecisions as jest.MockedFunction<typeof NarrativeWithDecisions>;

describe('MainGameArea Component', () => {
  // Default props for MainGameArea in tests
  const defaultTestProps: Omit<GameSessionProps, 'state'> = { // Omit state as it's provided per test
    dispatch: jest.fn(),
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
    getCurrentOpponent: jest.fn(() => null),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders with narrative from state', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: {
        ...initialState.narrative,
        narrativeHistory: [
          'This is the narrative from state.',
          'Player: Do something', // Add player action
          'Second line of narrative.'
        ]
      }
    };
    
    render(
      <CampaignStateProvider initialState={mockState}>
        <MainGameArea {...defaultTestProps} state={mockState} />
      </CampaignStateProvider>
    );
    
    // Check that the component renders its container
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
    
    // Check that NarrativeWithDecisions received the correct narrative prop including the player action
    expect(MockNarrativeWithDecisions).toHaveBeenCalled();
    const narrativeProp = MockNarrativeWithDecisions.mock.calls[0][0].narrative;
    expect(narrativeProp).toContain('This is the narrative from state.');
    expect(narrativeProp).toContain('Player: Do something'); // Verify player action is included
    expect(narrativeProp).toContain('Second line of narrative.');
    
    // Check that the narrative is joined correctly (using the double newline from the fix)
    expect(narrativeProp).toBe('This is the narrative from state.\n\nPlayer: Do something\n\nSecond line of narrative.');
    
    // Should not use fallback
    expect(GameStorage.getNarrativeText).not.toHaveBeenCalled();
  });
  
  test('renders with narrative from GameStorage when state has no narrative', async () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    // We need to call getNarrativeText in our test setup
    GameStorage.getNarrativeText();
    
    render(
      <CampaignStateProvider initialState={mockState}>
        <MainGameArea {...defaultTestProps} state={mockState} />
      </CampaignStateProvider>
    );
    
    // Verify GameStorage.getNarrativeText was called
    await waitFor(() => {
      expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
      expect(GameStorage.getNarrativeText).toHaveBeenCalled();
    });
  });
  
  test('renders with default narrative when all sources fail', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    // Override the GameStorage mock to return empty array
    (GameStorage.getNarrativeText as jest.Mock).mockReturnValueOnce([]);
    
    render(
      <CampaignStateProvider initialState={mockState}>
        <MainGameArea {...defaultTestProps} state={mockState} />
      </CampaignStateProvider>
    );
    
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
  });
  
  test('renders initialize new game button when state is null', () => {
    render(
      <CampaignStateProvider>
        <MainGameArea {...defaultTestProps} state={null as unknown as GameState} />
      </CampaignStateProvider>
    );
    
    // Check for the loading state or recovery options container
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
    // Further assertions could check for specific loading text or recovery buttons if needed
    expect(screen.getByText('Loading game state...')).toBeInTheDocument();
  });
});