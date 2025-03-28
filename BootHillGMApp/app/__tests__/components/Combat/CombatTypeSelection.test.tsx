import { render, screen } from '@testing-library/react';
import { CombatTypeSelection } from '../../../components/Combat/CombatTypeSelection';
import { Character } from '../../../types/character';
import { GameProvider } from '../../../hooks/useGame';

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
    // Create mock state with weapon in inventory
    const mockState = {
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon' }
        ]
      },
      character: {
        player: mockPlayer,
        opponent: null
      }
    };
    
    // Use a modified opponent with metadata in name
    const opponentWithMetadata = {
      ...mockOpponent,
      name: 'Rancher\nSUGGESTED_ACTIONS: []'
    };

    // Render with GameProvider and custom state
    render(
      <GameProvider initialState={mockState}>
        <CombatTypeSelection
          playerCharacter={mockPlayer}
          opponent={opponentWithMetadata}
          onSelectType={mockOnSelectType}
        />
      </GameProvider>
    );

    // Check that weapon combat option is available
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
    expect(screen.getByText('Brawling')).toBeInTheDocument();
  });

  it('shows available weapons for both combatants', () => {
    // Create mock state with weapons
    const mockState = {
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon' },
          { id: '2', name: 'Knife', category: 'weapon' }
        ]
      },
      character: {
        player: mockPlayer,
        opponent: null
      }
    };

    // Render with GameProvider and custom state
    render(
      <GameProvider initialState={mockState}>
        <CombatTypeSelection
          playerCharacter={mockPlayer}
          opponent={mockOpponent}
          onSelectType={mockOnSelectType}
        />
      </GameProvider>
    );

    // Check that weapon combat option is available and enabled
    const weaponButton = screen.getByText('Weapon Combat');
    expect(weaponButton).toBeInTheDocument();
    expect(weaponButton.closest('button')).not.toHaveAttribute('disabled');
  });
  
  it('disables weapon combat option when no weapons available', () => {
    // Create mock state with NO weapons
    const mockState = {
      inventory: {
        items: [
          { id: '1', name: 'Healing Potion', category: 'medical' }
        ]
      },
      character: {
        player: mockPlayer,
        opponent: null
      }
    };

    // Render with GameProvider and custom state
    render(
      <GameProvider initialState={mockState}>
        <CombatTypeSelection
          playerCharacter={mockPlayer}
          opponent={mockOpponent}
          onSelectType={mockOnSelectType}
        />
      </GameProvider>
    );

    // Check that weapon combat option is disabled
    const weaponButton = screen.getByRole('button', { name: /Weapon Combat/ });
    expect(weaponButton).toBeDisabled();
    expect(screen.getByText('No weapons available for combat')).toBeInTheDocument();
  });
});
