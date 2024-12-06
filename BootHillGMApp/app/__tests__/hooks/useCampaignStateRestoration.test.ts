import { renderHook } from '@testing-library/react';
import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';
import { GameState } from '../../types/campaign';
import { Character } from '../../types/character';

interface CombatState {
  playerStrength: number;
  opponentStrength: number;
  currentTurn: 'player';
  combatLog: Array<{ text: string; type: string; timestamp: number }>;
}

interface TestGameState extends GameState {
  combatState?: CombatState;
}

describe('useCampaignStateRestoration', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
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
    inventory: []
  };

  const mockState: TestGameState = {
    currentPlayer: 'Player1',
    npcs: [],
    location: 'Saloon',
    inventory: [],
    quests: [],
    character: mockCharacter,
    narrative: '',
    gameProgress: 0,
    journal: [],
    isCombatActive: true,
    opponent: {
      ...mockCharacter,
      name: 'Test Opponent'
    },
    suggestedActions: [],
    combatState: {
      playerStrength: 100,
      opponentStrength: 100,
      currentTurn: 'player' as const,
      combatLog: [{ text: 'Combat started', type: 'info', timestamp: Date.now() }]
    }
  };

  test('returns initial state when initializing new game', () => {
    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: true, 
        savedStateJSON: null 
      })
    );

    expect(result.current.character).toBeNull();
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

    expect(result.current.character).toEqual(mockCharacter);
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

    expect(result.current.character).toBeNull();
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
    expect(typeof state.combatState?.playerStrength).toBe('number');
    expect(state.combatState?.combatLog).toBeInstanceOf(Array);
    expect(state.combatState?.currentTurn).toBe('player');
  });

  test('ensures deep copy of inventory items', () => {
    const stateWithInventory = {
      ...mockState,
      inventory: [{ id: '1', name: 'Test Item', quantity: 1, description: 'Test Description' }]
    };

    const { result } = renderHook(() => 
      useCampaignStateRestoration({ 
        isInitializing: false, 
        savedStateJSON: JSON.stringify(stateWithInventory)
      })
    );

    expect(result.current.inventory).toHaveLength(1);
    expect(result.current.inventory[0]).toEqual(stateWithInventory.inventory[0]);
    // Verify it's a deep copy
    expect(result.current.inventory[0]).not.toBe(stateWithInventory.inventory[0]);
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
    expect(result.current.inventory).toEqual([]);
    expect(result.current.journal).toEqual([]);
    expect(state.combatState).toBeUndefined();
  });

  test('properly converts boolean values', () => {
    const stateWithBooleans = {
      ...mockState,
      isCombatActive: 1,
      opponent: {
        ...mockCharacter,
        isUnconscious: 1
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
