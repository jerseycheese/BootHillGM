import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatControls } from '../../../components/Combat/CombatControls';
import { CombatStatus } from '../../../components/Combat/CombatStatus';
import { Character } from '../../../types/character';
import { CombatState } from '../../../types/combat';

// Mock combat utils
jest.mock('../../../utils/combatUtils', () => ({
  cleanCharacterName: jest.fn((name: string) => name),
  calculateCurrentStrength: jest.requireActual('../../../utils/strengthSystem').calculateCurrentStrength
}));

describe('Combat UI Components', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 15,
      baseStrength: 15,
      bravery: 10,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: []
  };

  const mockCombatState: CombatState = {
    isActive: true,
    combatType: 'brawling',
    winner: null,
    combatLog: [],
    brawling: {
      round: 1,
      playerModifier: 0,
      opponentModifier: 0,
      roundLog: []
    }
  };

  describe('CombatControls', () => {
    const mockAttack = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders player turn indicator correctly', () => {
      render(
        <CombatControls
          currentTurn="player"
          isProcessing={false}
          onAttack={mockAttack}
        />
      );

      expect(screen.getByText("Player's Turn")).toHaveClass('bg-green-100');
    });

    test('disables attack button when processing', () => {
      render(
        <CombatControls
          currentTurn="player"
          isProcessing={true}
          onAttack={mockAttack}
        />
      );

      expect(screen.queryByText('Attack')).not.toBeInTheDocument();
    });
  });

  describe('CombatStatus', () => {
    test('renders strength values correctly', () => {
      render(
        <CombatStatus
          playerCharacter={mockCharacter}
          opponent={mockCharacter}
          combatState={mockCombatState}
        />
      );

      expect(screen.getByTestId('player-strength-value')).toHaveTextContent('15/15');
      expect(screen.getByTestId('opponent-strength-value')).toHaveTextContent('15/15');
    });
  });
});
