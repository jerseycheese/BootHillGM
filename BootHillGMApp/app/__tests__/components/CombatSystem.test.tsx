import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CombatSystem from '../../components/CombatSystem';
import { Character } from '../../types/character';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import { CampaignState } from '../../types/campaign';

// Mock the AI service
jest.mock('../../utils/aiService', () => ({
  getAIResponse: jest.fn(),
}));

const mockDispatch = jest.fn();
const mockSaveGame = jest.fn();
const mockLoadGame = jest.fn();

describe('CombatSystem', () => {
  const mockPlayer: Character = {
    name: 'Player',
    health: 100,
    attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, bravery: 10, experience: 5 },
    skills: { shooting: 50, riding: 50, brawling: 50 }
  };

  const mockOpponent: Character = {
    name: 'Opponent',
    health: 100,
    attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, bravery: 10, experience: 5 },
    skills: { shooting: 50, riding: 50, brawling: 50 }
  };

  const mockOnCombatEnd = jest.fn();
  const mockOnPlayerHealthChange = jest.fn();

  const mockState: CampaignState = {
    character: mockPlayer,
    location: 'Test Location',
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [],
    isCombatActive: false,
    opponent: null,
    savedTimestamp: null,
  };
  
  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <CampaignStateContext.Provider value={{ state: mockState, dispatch: mockDispatch, saveGame: mockSaveGame, loadGame: mockLoadGame }}>
        {ui}
      </CampaignStateContext.Provider>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.25); // Ensure hit (0.25 < 0.5)
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test('renders combat interface when opponent is present', () => {
    renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    expect(screen.getByText('Combat')).toBeInTheDocument();
    expect(screen.getByText('Player Health: 100')).toBeInTheDocument();
    expect(screen.getByText('Opponent Health: 100')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
  });

  test('does not render combat interface when opponent is null', () => {
    renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={null}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    expect(screen.queryByText('Combat')).not.toBeInTheDocument();
  });

  test('handles player attack', async () => {
    renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    fireEvent.click(screen.getByText('Attack'));

    await waitFor(() => {
      expect(screen.getByText(/Player hits Opponent for \d+ damage!/)).toBeInTheDocument();
      expect(screen.getByText(/Opponent Health: \d+/)).toBeInTheDocument();
    });
  });

  test('ends combat when opponent health reaches 0', async () => {
    const lowHealthOpponent = { ...mockOpponent, health: 1 };
    renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={lowHealthOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    fireEvent.click(screen.getByText('Attack'));

    await waitFor(() => {
      expect(mockOnCombatEnd).toHaveBeenCalledWith('player', expect.any(String));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_JOURNAL' }));
    });
  });

  test('ends combat when player health reaches 0', async () => {
    const lowHealthPlayer = { ...mockPlayer, health: 1 };
    renderWithContext(
      <CombatSystem
        playerCharacter={lowHealthPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    fireEvent.click(screen.getByText('Attack'));
    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(mockOnCombatEnd).toHaveBeenCalledWith('opponent', expect.any(String));
      expect(mockOnPlayerHealthChange).toHaveBeenCalledWith(0);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_JOURNAL' }));
    });
  });

  test('initiates combat when opponent is provided', async () => {
    const { rerender } = renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={null}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    expect(screen.queryByText('Combat')).not.toBeInTheDocument();

    rerender(
      <CampaignStateContext.Provider value={{ state: mockState, dispatch: mockDispatch, saveGame: mockSaveGame, loadGame: mockLoadGame }}>
        <CombatSystem
          playerCharacter={mockPlayer}
          opponent={mockOpponent}
          onCombatEnd={mockOnCombatEnd}
          onPlayerHealthChange={mockOnPlayerHealthChange}
        />
      </CampaignStateContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Combat')).toBeInTheDocument();
      expect(screen.getByText('Player Health: 100')).toBeInTheDocument();
      expect(screen.getByText('Opponent Health: 100')).toBeInTheDocument();
    });
  });

  test('ends combat and returns to normal gameplay', async () => {
    const { rerender } = renderWithContext(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
      />
    );

    expect(screen.getByText('Combat')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Attack'));
    
    // Simulate combat ending (opponent defeated)
    rerender(
      <CampaignStateContext.Provider value={{ state: mockState, dispatch: mockDispatch, saveGame: mockSaveGame, loadGame: mockLoadGame }}>
        <CombatSystem
          playerCharacter={mockPlayer}
          opponent={null}
          onCombatEnd={mockOnCombatEnd}
          onPlayerHealthChange={mockOnPlayerHealthChange}
        />
      </CampaignStateContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Combat')).not.toBeInTheDocument();
    });
  });
});
