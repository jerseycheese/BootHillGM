import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatus } from '../../components/Combat/CombatStatus';
import { Character } from '../../types/character';
import { CombatState } from '../../types/combat';
import { DefaultWeapons } from '../../data/defaultWeapons';

describe('CombatStatus', () => {
  const mockPlayer: Character = {
    id: 'player1',
    name: 'Player',
    inventory: [],
    attributes: {
      speed: 3,
      gunAccuracy: 3,
      throwingAccuracy: 3,
      strength: 3,
      baseStrength: 3,
      bravery: 3,
      experience: 3
    },
    wounds: [],
    isUnconscious: false,
    weapon: {
      id: 'custom-weapon',
      name: 'Custom Pistol',
      modifiers: {
        accuracy: 1,
        range: 15,
        damage: '1d6',
        reliability: 90,
        speed: 1
      }
    }
  };

  const mockOpponent: Character = {
    id: 'opponent1',
    name: 'Opponent',
    inventory: [],
    attributes: {
      speed: 3,
      gunAccuracy: 3,
      throwingAccuracy: 3,
      strength: 3,
      baseStrength: 3,
      bravery: 3,
      experience: 3
    },
    wounds: [],
    isUnconscious: false
  };

  const mockCombatState: CombatState = {
    isActive: true,
    combatType: 'weapon',
    winner: null
  };

  it('displays player weapon correctly', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={mockCombatState}
      />
    );
    
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Colt Revolver')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('displays default weapon for opponent when no weapon specified', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={mockCombatState}
      />
    );
    
    expect(screen.getByText('Opponent')).toBeInTheDocument();
    expect(screen.getByText('Colt Revolver')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles missing combat state gracefully', () => {
    render(
      <CombatStatus 
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        combatState={null as unknown as CombatState}
      />
    );
    
    expect(screen.getByText('No weapon equipped')).toBeInTheDocument();
  });
});
