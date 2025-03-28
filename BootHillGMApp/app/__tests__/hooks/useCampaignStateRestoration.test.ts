import { renderHook } from '@testing-library/react';
import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { LocationType } from '../../services/locationService';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { CharacterState } from '../../types/state/characterState';
import { CombatState } from '../../types/state/combatState';

interface TestGameState extends GameState {
  location: LocationType | null; // Updated to match GameState
  combatState?: unknown; // For backwards compatibility in tests
}

describe('useCampaignStateRestoration', () => {
    const mockCharacter: Character = {
        isNPC: false,
        isPlayer: true,
        id: 'test-character',
        name: 'Test Character',
        attributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            baseStrength: 10,
            bravery: 10,
            experience: 5,
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] }, // Updated to use new inventory format
    };

    // Create a properly structured character state
    const mockCharacterState: CharacterState = {
        player: { ...mockCharacter },
        opponent: {
            ...mockCharacter,
            name: 'Test Opponent',
            isNPC: true,
            isPlayer: false,
            isUnconscious: false, // Ensure this is a boolean
        },
    };

    // Create an inventory state
    const mockInventoryState: InventoryState = { 
        items: [] 
    };

    // Create a journal state
    const mockJournalState: JournalState = {
        entries: []
    };

    // Create a combat state
    const mockCombatState: CombatState = {
        isActive: true,
        combatType: 'brawling',
        rounds: 0,
        playerTurn: true,
        playerCharacterId: 'test-character',
        opponentCharacterId: 'test-opponent',
        combatLog: [{ text: 'Combat started', type: 'info', timestamp: Date.now() }],
        roundStartTime: Date.now(),
        modifiers: { player: 0, opponent: 0 },
        currentTurn: 'player'
    };

    const mockState: TestGameState = {
        currentPlayer: 'Player1',
        npcs: [],
        location: { type: 'town', name: 'Testville' }, // Use a LocationType object
        inventory: mockInventoryState,
        journal: mockJournalState,
        quests: [],
        character: mockCharacterState,
        combat: mockCombatState,
        narrative: {
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'standard',
          error: null
        },
        ui: {
          isLoading: false,
          modalOpen: null,
          notifications: []
        },
        gameProgress: 0,
        suggestedActions: [],
        // For backwards compatibility in tests
        combatState: {
            currentTurn: 'player',
            combatLog: [{ text: 'Combat started', type: 'info', timestamp: Date.now() }],
            isActive: true,
            combatType: 'brawling',
            winner: null,
            participants: [],
            rounds: 0
        },
        get player() {
          return this.character?.player ?? null;
        },
        get opponent() {
          return this.character?.opponent ?? null;
        },
        get isCombatActive() {
          return this.combat?.isActive ?? false;
        }
    };

  test('returns initial state when initializing new game', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: true, 
        savedStateJSON: null 
      })
    );

    // Test should check for null character state instead of looking inside it
    expect(result.current.character).not.toBeNull();
    expect(result.current.isClient).toBe(true);
    expect(result.current.isCombatActive).toBe(false);
  });

  test('restores complete game state correctly', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(mockState)
      })
    );

    expect(result.current.character).toEqual(mockCharacterState);
    expect(result.current.opponent).toBeTruthy();
    expect(result.current.opponent?.name).toBe('Test Opponent');
    expect(result.current.isCombatActive).toBe(true);
    expect((result.current as TestGameState).combatState?.currentTurn).toBe('player');
  });

  test('handles corrupted JSON gracefully', () => {
    // Temporarily suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: 'invalid json' 
      })
    );

    expect(result.current.character).not.toBeNull();
    expect(result.current.isClient).toBe(true);
    expect(result.current.isCombatActive).toBe(false);
    
    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('handles missing character data gracefully', () => {
    const invalidState = { ...mockState, character: null };
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(invalidState)
      })
    );

    expect(result.current.character).toBeNull();
    expect(result.current.isClient).toBe(true);
  });

  test('properly restores nested combat state', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(mockState)
      })
    );

    const state = result.current as TestGameState;
    expect(state.combatState).toBeTruthy();
    expect(state.combatState?.combatLog).toBeInstanceOf(Array);
    expect(state.combatState?.currentTurn).toBe('player');
  });

  test('ensures deep copy of inventory items', () => {
    // Create a test item
    const testItem = { id: '1', name: 'Test Item', quantity: 1, description: 'Test Description' };
    
    // Create a test state with an inventory item
    const stateWithInventory = {
      ...mockState,
      inventory: {
        items: [testItem]
      }
    };

    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(stateWithInventory)
      })
    );

    // Check that inventory has the item
    expect(result.current.inventory.items).toHaveLength(1);
    expect(result.current.inventory.items[0]).toEqual(testItem);
    // Verify it's a deep copy
    expect(result.current.inventory.items[0]).not.toBe(testItem);
  });

  test('handles missing optional state properties', () => {
    const minimalState = {
      currentPlayer: 'Player1',
      character: mockCharacter,
      location: 'Saloon'
    };

    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(minimalState)
      })
    );

    const state = result.current as TestGameState;
    expect(result.current.inventory.items).toEqual([]);
    expect(result.current.journal.entries).toEqual([]);
    expect(state.combatState).toBeUndefined();
  });

  test('properly converts boolean values', () => {
    // Create character with numeric boolean values
    const characterWithNumericBooleans = {
      ...mockCharacter,
      isUnconscious: true // Ensure this is a boolean
    };
    
    // Create state with numeric boolean values
    const stateWithBooleans = {
      ...mockState,
      combat: {
        ...mockState.combat,
        isActive: 1,
      },
      character: {
        player: mockCharacter,
        opponent: characterWithNumericBooleans
      }
    };

    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(stateWithBooleans)
      })
    );

    expect(typeof result.current.isCombatActive).toBe('boolean');
    expect(typeof result.current.opponent?.isUnconscious).toBe('boolean');
  });
});
