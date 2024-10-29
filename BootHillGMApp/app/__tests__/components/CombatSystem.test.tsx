import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CombatSystem from '../../components/CombatSystem';
import { Character } from '../../types/character';

// Mock the combat rules
jest.mock('../../utils/combatRules', () => ({
  calculateHitChance: jest.fn().mockReturnValue(62),
  rollD100: jest.fn().mockReturnValue(26)
}));

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
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock Math.random to return consistent damage values
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // Will result in damage of 1
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test('renders combat interface when opponent is present', () => {
    render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    expect(screen.getByText('Combat')).toBeInTheDocument();
    expect(screen.getByText('Player Health: 100')).toBeInTheDocument();
    expect(screen.getByText('Opponent Health: 100')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
  });

  test('handles player attack', async () => {
    render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
    });

    expect(screen.getByText(/Player hits Opponent for \d+ damage!/)).toBeInTheDocument();
    expect(screen.getByText(/Opponent Health: 99/)).toBeInTheDocument();
  });

  test('cleans metadata from character names in combat messages', async () => {
    const playerWithMetadata: Character = {
      ...mockPlayer,
      name: 'Player ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };
    const opponentWithMetadata: Character = {
      ...mockOpponent,
      name: 'Opponent ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };

    render(
      <CombatSystem
        playerCharacter={playerWithMetadata}
        opponent={opponentWithMetadata}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
    });

    const combatMessage = screen.getByText(/Player hits Opponent for \d+ damage!/);
    expect(combatMessage.textContent).not.toContain('ACQUIRED_ITEMS:');
    expect(combatMessage.textContent).not.toContain('REMOVED_ITEMS:');
  });

  test('ends combat when opponent health reaches 0', async () => {
    const lowHealthOpponent = { ...mockOpponent, health: 1 };
    render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={lowHealthOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
    });

    await waitFor(() => {
      expect(mockOnCombatEnd).toHaveBeenCalledWith('player', expect.any(String));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_JOURNAL' }));
    });
  });

  test('ends combat when player health reaches 0', async () => {
    const lowHealthPlayer = { ...mockPlayer, health: 1 };
    render(
      <CombatSystem
        playerCharacter={lowHealthPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    // First player attack
    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
    });

    // Wait for opponent's turn and attack
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnCombatEnd).toHaveBeenCalledWith('opponent', expect.any(String));
      expect(mockOnPlayerHealthChange).toHaveBeenCalledWith(0);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_JOURNAL' }));
    });
  });

  test('initiates combat when opponent is provided', async () => {
    const { rerender } = render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    expect(screen.getByText('Combat')).toBeInTheDocument();

    rerender(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Combat')).toBeInTheDocument();
      expect(screen.getByText('Player Health: 100')).toBeInTheDocument();
      expect(screen.getByText('Opponent Health: 100')).toBeInTheDocument();
    });
  });
});
