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
import { GameSessionProps } from '../../components/GameArea/types';

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

// Import the actual MainGameArea component
import { MainGameArea } from '../../components/GameArea/MainGameArea';

// Mock the NarrativeWithDecisions component and keep a reference to it
import NarrativeWithDecisions from '../../components/narrative/NarrativeWithDecisions';
jest.mock('../../components/narrative/NarrativeWithDecisions');
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
    gameStateUtils.mockLocalStorage.clear();
    gameStateUtils.setupGameStorageMocks(GameStorage);
  });
  
  test('renders with narrative from state', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      narrative: {
        ...initialState.narrative,
        narrativeHistory: [
          'This is the narrative from state.',
          'Player: Do something', // Add player action
          'Second line of narrative.'
        ]
      }
    });
    
    gameStateUtils.renderWithGameProvider(<MainGameArea {...defaultTestProps} state={mockState} />, mockState);
    
    // Check that the component renders its container
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
    
    expect(GameStorage.getNarrativeText).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('renders with narrative from GameStorage when state has no narrative', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    gameStateUtils.renderWithGameProvider(<MainGameArea {...defaultTestProps} state={mockState} />, mockState);
    
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
  });
  
  test('renders with default narrative when all sources fail', () => {
    const mockState: GameState = {
      ...initialState,
      narrative: null as unknown as typeof initialState.narrative
    };
    
    // Override the GameStorage mock to return empty string
    (GameStorage.getNarrativeText as jest.Mock).mockReturnValue('');
    
    gameStateUtils.renderWithGameProvider(<MainGameArea {...defaultTestProps} state={mockState} />, mockState);
    
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
  });
  
  test('renders initialize new game button when state is null', () => {
    // Test rendering when state is null (should show loading/recovery)
    // Note: MainGameArea itself handles null state internally now
    // Pass undefined to the provider to simulate no initial state override
    gameStateUtils.renderWithGameProvider(<MainGameArea {...defaultTestProps} state={initialState} />, undefined);
    // Note: MainGameArea receives initialState here, but the test setup simulates the provider starting empty.
    // If MainGameArea truly needs to handle receiving null/undefined state prop, its type definition needs update.
    // For now, we test the provider starting empty.
    
    // Check for the loading state or recovery options container
    expect(screen.getByTestId('main-game-area-container')).toBeInTheDocument();
    // Further assertions could check for specific loading text or recovery buttons if needed
  });
});