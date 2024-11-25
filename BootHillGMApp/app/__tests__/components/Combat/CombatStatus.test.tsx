import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatus } from '../../../components/Combat/CombatStatus';
import { Character, Wound } from '../../../types/character';

// Mock combat utils
jest.mock('../../../utils/combatUtils', () => ({
  cleanCharacterName: jest.fn((name: string) => name),
  calculateCurrentStrength: jest.requireActual('../../../utils/strengthSystem').calculateCurrentStrength
}));

// Import the mocked module
import * as combatUtils from '../../../utils/combatUtils';

describe('CombatStatus', () => {
  const mockPlayer: Character = {
    name: 'Test Player',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 15,
      baseStrength: 15,
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
    ...mockPlayer,
    name: 'Test Opponent'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders strength values correctly', () => {
    render(
      <CombatStatus
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
      />
    );

    expect(screen.getByTestId('player-strength-value')).toHaveTextContent('15/15');
    expect(screen.getByTestId('opponent-strength-value')).toHaveTextContent('15/15');
    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(mockPlayer.name);
    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(mockOpponent.name);
  });

  test('applies red text class for low player strength', () => {
    const weakPlayer: Character = {
      ...mockPlayer,
      wounds: [
        { location: 'chest', severity: 'serious', strengthReduction: 10, turnReceived: 1 }
      ]
    };

    render(
      <CombatStatus
        playerCharacter={weakPlayer}
        opponent={mockOpponent}
      />
    );

    const playerStrengthValue = screen.getByTestId('player-strength-value');
    expect(playerStrengthValue).toHaveClass('text-red-600');
    expect(playerStrengthValue).toHaveTextContent('5/15');
  });

  test('displays wounds correctly', () => {
    const wounds: Wound[] = [
      { location: 'leftArm', severity: 'light', strengthReduction: 3, turnReceived: 1 },
      { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 2 }
    ];

    const woundedPlayer: Character = {
      ...mockPlayer,
      wounds
    };

    render(
      <CombatStatus
        playerCharacter={woundedPlayer}
        opponent={mockOpponent}
      />
    );

    // Find wound elements and verify their content
    const woundElements = screen.getAllByRole('listitem');
    
    // Check first wound (leftArm)
    expect(woundElements[0]).toHaveTextContent('leftArm');
    expect(woundElements[0]).toHaveTextContent('light');
    expect(woundElements[0]).toHaveTextContent('-3 STR');
    
    // Check second wound (chest)
    expect(woundElements[1]).toHaveTextContent('chest');
    expect(woundElements[1]).toHaveTextContent('serious');
    expect(woundElements[1]).toHaveTextContent('-7 STR');
  });

  test('shows unconscious status', () => {
    const unconsciousPlayer: Character = {
      ...mockPlayer,
      isUnconscious: true
    };

    render(
      <CombatStatus
        playerCharacter={unconsciousPlayer}
        opponent={mockOpponent}
      />
    );

    expect(screen.getByText('(Unconscious)')).toBeInTheDocument();
  });

  test('applies correct color classes to wound severity', () => {
    const wounds: Wound[] = [
      { location: 'leftArm', severity: 'light', strengthReduction: 3, turnReceived: 1 },
      { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 2 }
    ];

    const woundedPlayer: Character = {
      ...mockPlayer,
      wounds
    };

    render(
      <CombatStatus
        playerCharacter={woundedPlayer}
        opponent={mockOpponent}
      />
    );

    const woundElements = screen.getAllByRole('listitem');
    const lightWound = woundElements[0];
    const seriousWound = woundElements[1];

    expect(lightWound).toHaveClass('text-yellow-600');
    expect(seriousWound).toHaveClass('text-red-600');
  });

  test('cleans character names', () => {
    const playerWithMetadata: Character = {
      ...mockPlayer,
      name: 'Test Player ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };
    const opponentWithMetadata: Character = {
      ...mockOpponent,
      name: 'Test Opponent ACQUIRED_ITEMS: REMOVED_ITEMS:'
    };

    render(
      <CombatStatus
        playerCharacter={playerWithMetadata}
        opponent={opponentWithMetadata}
      />
    );

    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(playerWithMetadata.name);
    expect(combatUtils.cleanCharacterName).toHaveBeenCalledWith(opponentWithMetadata.name);
  });
});
