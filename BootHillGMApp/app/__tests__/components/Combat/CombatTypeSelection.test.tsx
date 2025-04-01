import React from 'react';
import { screen } from '@testing-library/react'; // Keep screen import
import CombatTypeSelection from '../../../components/Combat/CombatTypeSelection';
import { Character } from '../../../types/character';
// import { TestCampaignStateProvider } from '../../utils/testWrappers'; // Removed legacy wrapper
// Remove GameStateProvider import
import { createMockGameState } from '../../../test/utils/inventoryTestUtils'; // Import state utility
import { renderWithMockContext } from '../../../test/utils/testWrappers'; // Import the new mock context renderer

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
    isNPC: false, // Add missing required property
    inventory: { items: [] },
    // Add missing required Character properties
    minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
    maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
    strengthHistory: { baseStrength: 10, changes: [] }
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
    isPlayer: false, // Add missing required property
    inventory: { items: [] },
    // Add missing required Character properties
    minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
    maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
    strengthHistory: { baseStrength: 10, changes: [] }
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays cleaned opponent name with default weapon', () => {
    // Create initial state with weapon in inventory
    // Create full GameState using the utility
    const initialState = createMockGameState({
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon', quantity: 1, description: '' } // Ensure full InventoryItem
        ]
      },
      character: { player: mockPlayer }
    });
    
    // Use a modified opponent with metadata in name
    const opponentWithMetadata = {
      ...mockOpponent,
      name: 'Rancher\nSUGGESTED_ACTIONS: []'
    };

    // Render with mock context provider
    renderWithMockContext(
      <CombatTypeSelection
        playerCharacter={mockPlayer}
        opponent={opponentWithMetadata}
        onSelectType={mockOnSelectType}
      />,
      initialState // Pass the mock state to the wrapper
    );

    // Check that weapon combat option is available
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
    expect(screen.getByText('Brawling')).toBeInTheDocument();
    
    // Check that the opponent name is cleaned
    expect(screen.getByText('Opponent: Rancher')).toBeInTheDocument();
  });

  it('shows available weapons for both combatants', () => {
    // Create initial state with weapons
    // Create full GameState using the utility
    const initialState = createMockGameState({
      inventory: {
        items: [
          { id: '1', name: 'Colt Peacemaker', category: 'weapon', quantity: 1, description: '' },
          { id: '2', name: 'Knife', category: 'weapon', quantity: 1, description: '' }
        ]
      },
      character: { player: mockPlayer }
    });

    // Modify player to have a weapon property
    const playerWithWeapon = {
      ...mockPlayer,
      // weapon: { name: 'Player Weapon', damage: 5 } // 'weapon' is not a direct property of Character
    };

    // Modify opponent to have a weapon property
    const opponentWithWeapon = {
      ...mockOpponent,
      // weapon: { name: 'Shotgun', damage: 8 } // 'weapon' is not a direct property of Character
    };

    // Render with mock context provider
    renderWithMockContext(
      <CombatTypeSelection
        playerCharacter={playerWithWeapon}
        opponent={opponentWithWeapon}
        onSelectType={mockOnSelectType}
      />,
      initialState // Pass the mock state to the wrapper
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
    // Create full GameState using the utility
    const initialState = createMockGameState({
      inventory: {
        items: [
          { id: '1', name: 'Healing Potion', category: 'medical', quantity: 1, description: '' }
        ]
      },
      character: { player: mockPlayer }
    });

    // Render with mock context provider
    renderWithMockContext(
      <CombatTypeSelection
        playerCharacter={mockPlayer}
        opponent={mockOpponent}
        onSelectType={mockOnSelectType}
      />,
      initialState // Pass the mock state to the wrapper
    );

    // Check that weapon combat option is disabled
    expect(screen.getByTestId('weapon-button')).toBeDisabled();
    expect(screen.getByText('No weapons available for combat')).toBeInTheDocument();
  });
});
