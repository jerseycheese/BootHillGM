import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatControls } from '../../../components/Combat/CombatControls';
import { CombatLog } from '../../../components/Combat/CombatLog';
import { CombatStatus } from '../../../components/Combat/CombatStatus';
import { Character, Wound } from '../../../types/character';

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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
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
      expect(screen.getByText("Opponent's Turn")).not.toHaveClass('bg-green-100');
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

  describe('CombatLog', () => {
    const mockEntries = [
      {
        text: 'Player hits Opponent with Colt Revolver for 5 damage!',
        type: 'hit' as const,
        timestamp: 1234567890
      },
      {
        text: 'Opponent misses Player! [Roll: 85/62]',
        type: 'miss' as const,
        timestamp: 1234567891
      }
    ];

    test('renders combat log with entries', () => {
      render(<CombatLog entries={mockEntries} />);
      
      expect(screen.getByTestId('combat-log')).toBeInTheDocument();
      mockEntries.forEach((entry, index) => {
        expect(screen.getByTestId(`combat-log-entry-${index}`)).toHaveTextContent(entry.text);
      });
    });

    test('renders empty combat log when no entries provided', () => {
      render(<CombatLog entries={[]} />);
      expect(screen.queryByTestId('combat-log-entry-0')).not.toBeInTheDocument();
    });
  });

  describe('CombatStatus', () => {
    test('renders strength values correctly', () => {
      render(
        <CombatStatus
          playerCharacter={mockCharacter}
          opponent={mockCharacter}
        />
      );

      expect(screen.getByTestId('player-strength-value')).toHaveTextContent('15/15');
      expect(screen.getByTestId('opponent-strength-value')).toHaveTextContent('15/15');
    });

    test('handles wounds correctly', () => {
      const woundedCharacter: Character = {
        ...mockCharacter,
        wounds: [
          { location: 'leftArm', severity: 'light', strengthReduction: 3, turnReceived: 1 } as Wound,
          { location: 'chest', severity: 'serious', strengthReduction: 7, turnReceived: 2 } as Wound
        ]
      };

      console.log('woundedCharacter:', woundedCharacter); // Debug code

      render(
        <CombatStatus
          playerCharacter={woundedCharacter}
          opponent={mockCharacter}
        />
      );

      const woundElements = screen.getAllByRole('listitem');
      expect(woundElements[0]).toHaveTextContent('leftArm');
      expect(woundElements[0]).toHaveTextContent('light');
      expect(woundElements[1]).toHaveTextContent('chest');
      expect(woundElements[1]).toHaveTextContent('serious');
    });
  });
});
