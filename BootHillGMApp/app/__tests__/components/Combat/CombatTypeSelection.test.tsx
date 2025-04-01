import React from 'react';
import { render, screen } from '@testing-library/react';
import CombatTypeSelection from '../../../components/Combat/CombatTypeSelection';
import { Character } from '../../../types/character';
import { TestCampaignStateProvider } from '../../utils/testWrappers';

describe('CombatTypeSelection', () => {
  const mockOnSelectType = jest.fn();
  
  // Mock player character
  const mockPlayer: Character = {
    id: 'player1',
    name: 'Player',
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    wounds: [],
    isUnconscious: false,
    isPlayer: true,
    inventory: {
      items: []
    }
  };
  
  // Mock opponent character
  const mockOpponent: Character = {
    id: 'opponent1',
    name: 'Rancher',
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      baseStrength: 10,
      bravery: 5,
      experience: 0
    },
    wounds: [],
    isUnconscious: false,
    isNPC: true,
    inventory: {
      items: []
    }
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays cleaned opponent name with default weapon', () => {
    // Create initial state with weapon in inventory
    const initialState = {
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon', type: 'weapon' }
        ]
      },
      character: {
        player: mockPlayer
      }
    };
    
    // Use a modified opponent with metadata in name
    const opponentWithMetadata = {
      ...mockOpponent,
      name: 'Rancher\nSUGGESTED_ACTIONS: []'
    };

    // Render with TestCampaignStateProvider
    render(
      <TestCampaignStateProvider initialState={initialState}>
        <CombatTypeSelection
          playerCharacter={mockPlayer}
          opponent={opponentWithMetadata}
          onSelectType={mockOnSelectType}
        />
      </TestCampaignStateProvider>
    );

    // Check that weapon combat option is available
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
    expect(screen.getByText('Brawling')).toBeInTheDocument();
    
    // Check that the opponent name is cleaned
    expect(screen.getByText('Opponent: Rancher')).toBeInTheDocument();
  });

  it('shows available weapons for both combatants', () => {
    // Create initial state with weapons
    const initialState = {
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon', type: 'weapon' },
          { id: '2', name: 'Knife', category: 'weapon', type: 'weapon' }
        ]
      },
      character: {
        player: mockPlayer
      }
    };

    // Modify player to have a weapon property
    const playerWithWeapon = {
      ...mockPlayer,
      weapon: { name: 'Player Weapon', damage: 5 }
    };

    // Modify opponent to have a weapon property
    const opponentWithWeapon = {
      ...mockOpponent,
      weapon: { name: 'Shotgun', damage: 8 }
    };

    // Render with TestCampaignStateProvider
    render(
      <TestCampaignStateProvider initialState={initialState}>
        <CombatTypeSelection
          playerCharacter={playerWithWeapon}
          opponent={opponentWithWeapon}
          onSelectType={mockOnSelectType}
        />
      </TestCampaignStateProvider>
    );

    // Check that weapon combat option is available and enabled
    const weaponButton = screen.getByText('Weapon Combat');
    expect(weaponButton).toBeInTheDocument();
    expect(screen.getByTestId('weapon-button')).not.toBeDisabled();
    
    // Check that opponent name is displayed
    expect(screen.getByText('Opponent: Rancher')).toBeInTheDocument();
  });
  
  it('disables weapon combat option when no weapons available', () => {
    // Create initial state with NO weapons
    const initialState = {
      inventory: {
        items: [
          { id: '1', name: 'Healing Potion', category: 'medical', type: 'consumable' }
        ]
      },
      character: {
        player: mockPlayer
      }
    };

    // Render with TestCampaignStateProvider
    render(
      <TestCampaignStateProvider initialState={initialState}>
        <CombatTypeSelection
          playerCharacter={mockPlayer}
          opponent={mockOpponent}
          onSelectType={mockOnSelectType}
        />
      </TestCampaignStateProvider>
    );

    // Check that weapon combat option is disabled
    expect(screen.getByTestId('weapon-button')).toBeDisabled();
    expect(screen.getByText('No weapons available for combat')).toBeInTheDocument();
  });
});
