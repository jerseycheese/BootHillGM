import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CombatSystem } from '../../components/CombatSystem';
import { Character } from '../../types/character';
import * as combatUtils from '../../utils/combatUtils';
import { CampaignStateProvider } from '../../components/CampaignStateManager';

// Mock combat utils
jest.mock('../../utils/combatUtils', () => ({
  cleanCharacterName: jest.fn(name => name.split(' ACQUIRED_ITEMS:')[0])
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('CombatSystem', () => {
  const mockPlayer: Character = {
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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  };

  const mockOpponent: Character = {
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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
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
    combatState: null,
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
        summary: null
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
        summary: null,
        brawling: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          roundLog: []
        }
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
    renderCombatSystem();

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
        modifiers: {
          damage: '1d6',
          range: 20,
          accuracy: 0,
          reliability: 95,
          speed: 0
        }
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
    expect(screen.getByText('Your Weapon')).toBeInTheDocument();
    expect(screen.getByText('Test Weapon')).toBeInTheDocument();
    expect(screen.getByText('Damage: 1d6')).toBeInTheDocument();
    expect(screen.getByText('Range: 20y')).toBeInTheDocument();
    expect(screen.getByText('Speed: 0')).toBeInTheDocument();
    expect(screen.getByText('Opponent\'s Weapon')).toBeInTheDocument();
    expect(screen.getByText('No visible weapon')).toBeInTheDocument();
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
  //     roundLog: [
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
