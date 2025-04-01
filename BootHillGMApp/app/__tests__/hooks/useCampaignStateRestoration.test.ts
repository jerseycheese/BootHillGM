import { renderHook } from '@testing-library/react';
import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';
import { GameState } from '../../types/gameState';
// Removed unused imports: GameState, LocationType
import { Character } from '../../types/character';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { CharacterState } from '../../types/state/characterState';
import { CombatState } from '../../types/state/combatState';

// Removed TestGameState interface as GameState should be used directly

describe('useCampaignStateRestoration', () => {
    const mockCharacter: Character = { // Add missing properties
        isNPC: false,
        isPlayer: true,
        id: 'test-character',
        name: 'Test Character',
        attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, baseStrength: 10, bravery: 10, experience: 5 },
        minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
        maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] },
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

    const mockState: GameState = { // Use GameState type
        currentPlayer: 'Player1',
        npcs: [],
        location: { type: 'town', name: 'Testville' }, // Use a LocationType object
        inventory: mockInventoryState,
        journal: mockJournalState,
        quests: [],
        character: mockCharacterState,
        combat: mockCombatState,
        narrative: { // Ensure all NarrativeState properties are present
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          context: "",
          displayMode: 'standard',
          error: null,
          // Add potentially missing optional properties if needed by tests
          narrativeContext: undefined,
          selectedChoice: undefined,
          storyProgression: undefined,
          currentDecision: undefined,
          lore: undefined,
        },
        ui: { // Ensure all UIState properties are present
          isLoading: false,
          modalOpen: null,
          notifications: [],
          activeTab: 'character'
        },
        gameProgress: 0,
        suggestedActions: [],
        // Removed legacy combatState property
        // Removed legacy getters
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
    expect(result.current.combat?.isActive).toBe(false); // Check slice property
  });

  test('restores complete game state correctly', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(mockState)
      })
    );

    expect(result.current.character).toEqual(mockCharacterState);
    // Access properties via slices
    expect(result.current.character?.opponent).toBeTruthy();
    expect(result.current.character?.opponent?.name).toBe('Test Opponent');
    expect(result.current.combat?.isActive).toBe(true);
    // Access combat properties via combat slice, remove combatState access
    expect(result.current.combat?.currentTurn).toBe('player');
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
    expect(result.current.combat?.isActive).toBe(false); // Check slice property
    
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

    // Check player/opponent within the character slice
    expect(result.current.character?.player).toBeNull();
    expect(result.current.character?.opponent).toBeNull();
    expect(result.current.isClient).toBe(true);
  });

  test('properly restores nested combat state', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(mockState)
      })
    );

    const state = result.current; // Use GameState directly
    // Access combat properties via combat slice
    expect(state.combat).toBeTruthy();
    expect(state.combat?.combatLog).toBeInstanceOf(Array);
    expect(state.combat?.currentTurn).toBe('player');
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

    const state = result.current; // Use GameState directly
    expect(result.current.inventory.items).toEqual([]);
    expect(result.current.journal.entries).toEqual([]);
    // Check combat slice properties instead of legacy combatState
    expect(state.combat?.isActive).toBe(false);
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

    // Access properties via slices
    expect(typeof result.current.combat?.isActive).toBe('boolean');
    expect(typeof result.current.character?.opponent?.isUnconscious).toBe('boolean');
  });
});
