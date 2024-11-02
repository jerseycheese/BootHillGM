import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CombatSystem from '../../components/CombatSystem';
import { Character } from '../../types/character';
import * as combatRules from '../../utils/combatRules';
import * as combatUtils from '../../utils/combatUtils';

// Mock the combat rules
jest.mock('../../utils/combatRules', () => ({
  calculateHitChance: jest.fn().mockReturnValue(62),
  rollD100: jest.fn().mockReturnValue(26)
}));

// Mock combat utils
jest.mock('../../utils/combatUtils', () => ({
  cleanCharacterName: jest.fn(name => name.split(' ACQUIRED_ITEMS:')[0]),
  getWeaponName: jest.fn(char => char.weapon?.name || 'fists'),
  formatHitMessage: jest.fn(({ attackerName, defenderName, weaponName, damage, roll, hitChance }) => 
    `${attackerName} hits ${defenderName} with ${weaponName} for ${damage} damage! [Roll: ${roll}/${hitChance}]`
  ),
  formatMissMessage: jest.fn((attacker, defender, roll, hitChance) => 
    `${attacker} misses ${defender}! [Roll: ${roll}/${hitChance}]`
  ),
  calculateCombatDamage: jest.fn().mockReturnValue(1)
}));

describe('CombatSystem', () => {
  const mockPlayer: Character = {
    name: 'Player',
    health: 100,
    attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, bravery: 10, experience: 5 },
    skills: { shooting: 50, riding: 50, brawling: 50 },
    weapon: { name: 'Colt Revolver', damage: '1d6' }
  };

  const mockOpponent: Character = {
    name: 'Opponent',
    health: 100,
    attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, bravery: 10, experience: 5 },
    skills: { shooting: 50, riding: 50, brawling: 50 },
    weapon: { name: 'Winchester Rifle', damage: '1d8' }
  };

  const mockOnCombatEnd = jest.fn();
  const mockOnPlayerHealthChange = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (combatRules.rollD100 as jest.Mock).mockReturnValue(26);
    (combatRules.calculateHitChance as jest.Mock).mockReturnValue(62);
    (combatUtils.calculateCombatDamage as jest.Mock).mockReturnValue(1);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderCombatSystem = (props: Partial<Parameters<typeof CombatSystem>[0]> = {}) => {
    return render(
      <CombatSystem
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onCombatEnd={mockOnCombatEnd}
        onPlayerHealthChange={mockOnPlayerHealthChange}
        dispatch={mockDispatch}
        {...props}
      />
    );
  };

  test('renders combat interface when opponent is present', () => {
    renderCombatSystem();

    expect(screen.getByTestId('player-health-label')).toHaveTextContent('Player Health:');
    expect(screen.getByTestId('player-health-value')).toHaveTextContent('100');
    expect(screen.getByTestId('opponent-health-label')).toHaveTextContent('Opponent Health:');
    expect(screen.getByTestId('opponent-health-value')).toHaveTextContent('100');
  });

  test('handles player attack with weapon display', async () => {
    renderCombatSystem();

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('combat-log-entry-0')).toHaveTextContent(/Player hits Opponent with Colt Revolver for 1 damage!/);
      expect(screen.getByTestId('combat-log-entry-0')).toHaveTextContent(/\[Roll: 26\/62\]/);
      expect(screen.getByTestId('opponent-health-value')).toHaveTextContent('99');
      expect(screen.getByTestId('opponent-turn-indicator')).toHaveClass('bg-green-100');
    });
  });

  test('ends combat when opponent health reaches 0', async () => {
    const lowHealthOpponent = { ...mockOpponent, health: 1 };
    renderCombatSystem({
      opponent: lowHealthOpponent,
      initialCombatState: {
        playerHealth: 100,
        opponentHealth: 1,
        currentTurn: 'player',
        combatLog: []
      }
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('opponent-health-value')).toHaveTextContent('0');
      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'player',
        expect.stringContaining('Player hits Opponent with Colt Revolver - a fatal shot!')
      );
    });
  });

  test('ends combat when player health reaches 0', async () => {
    renderCombatSystem({
      playerCharacter: { ...mockPlayer, health: 1 },
      initialCombatState: {
        playerHealth: 1,
        opponentHealth: 100,
        currentTurn: 'opponent',
        combatLog: []
      }
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('player-health-value')).toHaveTextContent('0');
      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'opponent',
        expect.stringContaining('Opponent hits Player with Winchester Rifle - a fatal shot!')
      );
      expect(mockOnPlayerHealthChange).toHaveBeenCalledWith(0);
    });
  });

  test('uses "fists" as weapon when no weapon equipped', async () => {
    const unarmedPlayer = { ...mockPlayer, weapon: undefined };
    renderCombatSystem({
      playerCharacter: unarmedPlayer
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('combat-log-entry-0')).toHaveTextContent(/Player hits Opponent with fists for 1 damage!/);
    });
  });

  test('cleans metadata from character names in combat messages', async () => {
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

    await act(async () => {
      fireEvent.click(screen.getByText('Attack'));
      jest.runAllTimers();
    });

    await waitFor(() => {
      const logEntry = screen.getByTestId('combat-log-entry-0');
      expect(logEntry).toHaveTextContent(/Player hits Opponent with Colt Revolver/);
      expect(logEntry.textContent).not.toContain('ACQUIRED_ITEMS:');
      expect(logEntry.textContent).not.toContain('REMOVED_ITEMS:');
    });
  });
});
