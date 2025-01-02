import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatus } from '../../components/Combat/CombatStatus';
import { Character } from '../../types/character';
import { CombatState } from '../../types/combat';

describe('CombatStatus', () => {
  const mockPlayer: Character = {
    id: 'player1',
    name: 'Test Player',
    inventory: [],
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 10,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    wounds: [],
    isUnconscious: false
  };

  const mockOpponent: Character = {
    id: 'opponent1',
    name: 'Test Opponent',
    inventory: [],
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 10,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    wounds: [],
    isUnconscious: false
  };

  test('displays "No weapon equipped" when player has no weapon', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={{ 
        isActive: true,
        combatType: 'weapon',
        winner: null,
        weapon: { 
          playerWeapon: null,
          opponentWeapon: null,
          round: 1,
          currentRange: 10,
          roundLog: []
        } 
      }}
      />
    );
    expect(screen.getByText('No weapon equipped')).toBeInTheDocument();
  });

  test('displays player weapon name when weapon is equipped', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={{ 
          isActive: true,
          combatType: 'weapon',
          winner: null,
          weapon: { 
            playerWeapon: {
              id: 'weapon1',
              name: 'Colt .45',
              modifiers: {
                damage: '1d6',
                range: 10,
                accuracy: 5,
                speed: 1,
                reliability: 95
              }
            },
            opponentWeapon: null,
            round: 1,
            currentRange: 10,
            roundLog: []
          } 
        }}
      />
    );
    expect(screen.getByText('Colt .45')).toBeInTheDocument();
  });

  test('displays opponent weapon name when weapon is equipped', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={{ 
          isActive: true,
          combatType: 'weapon',
          winner: null,
          weapon: { 
            opponentWeapon: {
              id: 'weapon2',
              name: 'Winchester Rifle',
              modifiers: {
                damage: '2d6',
                range: 50,
                accuracy: 8,
                speed: 2,
                reliability: 95
              }
            },
            playerWeapon: null,
            round: 1,
            currentRange: 10,
            roundLog: []
          } 
        }}
      />
    );
    expect(screen.getByText('Winchester Rifle')).toBeInTheDocument();
  });
});
