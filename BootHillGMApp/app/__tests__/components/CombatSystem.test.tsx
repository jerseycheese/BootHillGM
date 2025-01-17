import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { CombatSystem } from '../../components/Combat/CombatSystem';
import { Character } from '../../types/character';
import * as combatUtils from '../../utils/combatUtils';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { WEAPON_STATS } from '../../types/combat';

// Mock combat utils
jest.mock('../../utils/combatUtils', () => {
  const originalModule = jest.requireActual('../../utils/combatUtils');

  return {
    ...originalModule, // Import all functions from the original module
    cleanCharacterName: jest.fn(name => name.split(' ACQUIRED_ITEMS:')[0]),
  };
});

import { setupMocks } from '../../test/setup/mockSetup';

const { mockLocalStorage } = setupMocks();

beforeEach(() => {
  setupMocks();
});

describe('CombatSystem', () => {
  const mockPlayer: Character = {
    id: 'player-id', // Add id property
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
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: false,
    weapon: {
      id: 'test-weapon',
      name: 'Colt Revolver',
      modifiers: WEAPON_STATS['Colt Revolver'],
      ammunition: 6,
      maxAmmunition: 6
    }
  };

  const mockOpponent: Character = {
    id: 'opponent-id', // Add id property
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
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: true,
    weapon: {
      id: 'opponent-weapon',
      name: 'Winchester Rifle',
      modifiers: WEAPON_STATS['Winchester Rifle'],
      ammunition: 15,
      maxAmmunition: 15
    }
  };

  // Mock campaign state with character and weapon
  const mockCampaignState = JSON.parse(JSON.stringify({
    character: mockPlayer,
    inventory: [{
      id: 'test-weapon',
      name: 'Test Weapon',
      category: 'weapon',
      quantity: 1
    }],
    journal: [],
    isCombatActive: false,
    opponent: null,
    combatState: {
      isActive: false,
      combatType: null,
      winner: null,
      combatLog: []
    },
    savedTimestamp: Date.now()
  }));

  const mockOnCombatEnd = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderCombatSystem = (props: Partial<Parameters<typeof CombatSystem>[0]> = {}) => {
    return render(
      <CampaignStateProvider>
        <CombatSystem
          playerCharacter={mockPlayer}
          opponent={mockOpponent}
          onCombatEnd={mockOnCombatEnd}
          dispatch={mockDispatch}
          {...props}
        />
      </CampaignStateProvider>
    );
  };

  test('renders combat interface with combat type selection initially', () => {
    renderCombatSystem();
    
    // Check strength displays
    expect(screen.getByTestId('player-strength-value')).toHaveTextContent('10/10');
    expect(screen.getByTestId('opponent-strength-value')).toHaveTextContent('10/10');
    
    // Check combat type selection is present
    expect(screen.getByText('Choose Combat Type')).toBeInTheDocument();
    expect(screen.getByText('Brawling')).toBeInTheDocument();
    expect(screen.getByText('Weapon Combat')).toBeInTheDocument();
  });

  test('shows combat type selection when initialCombatState has null combatType', () => {
    renderCombatSystem({
      initialCombatState: {
        isActive: true,
        combatType: null,
        winner: null,
        combatLog: [],
        participants: [], // Add participants
        rounds: 0 // Add rounds
      }
    });
    
    expect(screen.getByText('Choose Combat Type')).toBeInTheDocument();
  });

  test('shows brawling controls when initialCombatState has brawling combatType', () => {
    renderCombatSystem({
      initialCombatState: {
        isActive: true,
        combatType: 'brawling',
        winner: null,
        brawling: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          roundLog: []
        },
        combatLog: [],
        participants: [], // Add participants
        rounds: 0 // Add rounds
      }
    });
    
    expect(screen.getByText('Punch')).toBeInTheDocument();
    expect(screen.getByText('Grapple')).toBeInTheDocument();
  });

  test('shows brawling controls after selecting brawling combat', async () => {
    renderCombatSystem();

    // Find and click the Brawling button (with its description)
    const brawlingButton = screen.getByRole('button', {
      name: /Brawling.*hand-to-hand combat/i
    });
    fireEvent.click(brawlingButton);

    expect(screen.getByText('Punch')).toBeInTheDocument();
    expect(screen.getByText('Grapple')).toBeInTheDocument();
  });

  test('handles player punch action', async () => {
    renderCombatSystem();

    // Select brawling combat
    const brawlingButton = screen.getByRole('button', {
      name: /Brawling.*hand-to-hand combat/i
    });
    fireEvent.click(brawlingButton);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Punch'));
    });

    // Additional assertions can be added here to verify combat log updates
  });

  test('handles player grapple action', async () => {
    renderCombatSystem();

    // Select brawling combat
    const brawlingButton = screen.getByRole('button', {
      name: /Brawling.*hand-to-hand combat/i
    });
    fireEvent.click(brawlingButton);
    
    await act(async () => {
      fireEvent.click(screen.getByText('Grapple'));
    });

    // Additional assertions can be added here to verify combat log updates
  });

  test('weapon combat option is disabled when no weapons available', () => {
    // Create a mock state with no weapons
    const noWeaponsPlayer = {
      ...mockPlayer,
      weapon: undefined  // Remove weapon from player
    };
    
    const noWeaponsOpponent = {
      ...mockOpponent,
      weapon: undefined  // Remove weapon from opponent
    };

    // Mock empty inventory state
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      ...mockCampaignState,
      inventory: [], // Empty inventory
      character: noWeaponsPlayer
    }));

    renderCombatSystem({
      playerCharacter: noWeaponsPlayer,
      opponent: noWeaponsOpponent
    });

    const weaponButton = screen.getByRole('button', { name: /Weapon Combat/i });
    expect(weaponButton).toBeDisabled();
    expect(screen.getByText('No weapons available for combat')).toBeInTheDocument();
  });

  test('shows weapon controls when weapon combat selected', async () => {
    // Mock campaign state with weapon
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockCampaignState));

    // Render with mock character that has a weapon
    const characterWithWeapon = {
      ...mockPlayer,
      weapon: {
        id: 'test-weapon',
        name: 'Test Weapon',
        modifiers: WEAPON_STATS['Test Weapon'] || WEAPON_STATS['Colt Revolver'],
        ammunition: 6,
        maxAmmunition: 6
      }
    };

    render(
      <CampaignStateProvider>
        <CombatSystem
          playerCharacter={characterWithWeapon}
          opponent={mockOpponent}
          onCombatEnd={mockOnCombatEnd}
          dispatch={mockDispatch}
        />
      </CampaignStateProvider>
    );

    const weaponButton = screen.getByRole('button', { name: /Weapon Combat/i });
    expect(weaponButton).not.toBeDisabled();
    
    fireEvent.click(weaponButton);
    const weaponControls = screen.getByTestId('weapon-combat-controls');
    expect(within(weaponControls).getByText('Your Weapon')).toBeInTheDocument();
    expect(within(weaponControls).getByText('Colt Revolver')).toBeInTheDocument();
    expect(within(weaponControls).getByText('Opponent\'s Weapon')).toBeInTheDocument();
    expect(within(weaponControls).getByText('Winchester Rifle')).toBeInTheDocument();
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

  // Test is pending, functionality not in place yet.
  // test('displays weapon combat log entries', async () => {
  //   const mockWeaponState = {
  //     ...mockCampaignState,
  //     combatType: 'weapon' as const,
  //     combatLog: [
  //       { text: 'Test combat log entry', type: 'hit', timestamp: Date.now() }
  //     ]
  //   };
    
  //   render(
  //     <CampaignStateProvider>
  //       <CombatSystem
  //         playerCharacter={mockPlayer}
  //         opponent={mockOpponent}
  //         onCombatEnd={mockOnCombatEnd}
  //         dispatch={mockDispatch}
  //         initialCombatState={mockWeaponState}
  //       />
  //     </CampaignStateProvider>
  //   );

  //   expect(screen.getByText('Test combat log entry')).toBeInTheDocument();
  // });
});
