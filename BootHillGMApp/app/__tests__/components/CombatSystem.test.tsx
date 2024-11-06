import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CombatSystem } from '../../components/CombatSystem';
import { Character } from '../../types/character';
import * as combatUtils from '../../utils/combatUtils';

// Mock combat utils
jest.mock('../../utils/combatUtils', () => ({
  cleanCharacterName: jest.fn(name => name.split(' ACQUIRED_ITEMS:')[0])
}));

describe('CombatSystem', () => {
  const mockPlayer: Character = {
    name: 'Player',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  };

  const mockOpponent: Character = {
    name: 'Opponent',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  };

  const mockOnCombatEnd = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCombatSystem = (props: Partial<Parameters<typeof CombatSystem>[0]> = {}) => {
    return render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        dispatch={mockDispatch}
        {...props}
      />
    );
  };

  test('renders combat interface when opponent is present', () => {
    renderCombatSystem();

    expect(screen.getByTestId('player-strength-label')).toHaveTextContent('Player Strength:');
    expect(screen.getByTestId('player-strength-value')).toHaveTextContent('10/10');
    expect(screen.getByTestId('opponent-strength-label')).toHaveTextContent('Opponent Strength:');
    expect(screen.getByTestId('opponent-strength-value')).toHaveTextContent('10/10');
    expect(screen.getByText('Start Brawling')).toBeInTheDocument();
  });

  test('shows brawling controls after starting combat', async () => {
    renderCombatSystem();

    fireEvent.click(screen.getByText('Start Brawling'));

    expect(screen.getByText('Punch')).toBeInTheDocument();
    expect(screen.getByText('Grapple')).toBeInTheDocument();
  });

  test('handles player punch action', async () => {
    renderCombatSystem();

    fireEvent.click(screen.getByText('Start Brawling'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Punch'));
    });

    // Combat log entries will be handled by the useBrawlingCombat hook
    // which is tested separately
  });

  test('handles player grapple action', async () => {
    renderCombatSystem();

    fireEvent.click(screen.getByText('Start Brawling'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Grapple'));
    });

    // Combat log entries will be handled by the useBrawlingCombat hook
    // which is tested separately
  });

  test('cleans metadata from character names', async () => {
    const playerWithMetadata = {
      ...mockPlayer,
      name: 'Player ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };
    const opponentWithMetadata = {
      ...mockOpponent,
      name: 'Opponent ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };

    renderCombatSystem({
      playerCharacter: playerWithMetadata,
      opponent: opponentWithMetadata
    });

    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(playerWithMetadata.name);
    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(opponentWithMetadata.name);
  });
});
