import { renderHook } from '@testing-library/react';
import { 
  useCombatActive, 
  useCombatRound,
  usePlayerTurn,
  useCombatType,
  useCombatLog,
  useLastCombatLogEntry
} from '../../hooks/stateSelectors';
import { CombatState } from '../../types/state/combatState';
import { GameState } from '../../types/gameState';
import { createGameProviderWrapper } from '../../test/utils/testWrappers';
import { CombatType } from '../../types/combat';

describe('Combat Selector Hooks', () => {
  const mockCombatState: CombatState = {
    isActive: true,
    combatType: 'brawling' as CombatType,
    rounds: 3,
    playerTurn: true,
    playerCharacterId: 'player-1',
    opponentCharacterId: 'opponent-1',
    combatLog: [
      { text: 'Combat started', timestamp: 1000, type: 'info' },
      { text: 'Player attacks', timestamp: 2000, type: 'player' }
    ],
    roundStartTime: 0,
    modifiers: { player: 2, opponent: -1 },
    currentTurn: null
  };

  // Create a complete game state to ensure proper initialization
  const mockGameState: Partial<GameState> = {
    combat: mockCombatState,
    // Ensure these required state properties exist to avoid undefined issues
    character: { player: null, opponent: null },
    inventory: { items: [] },
    journal: { entries: [] },
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
    currentPlayer: '',
    npcs: [],
    quests: [],
    location: null,
    gameProgress: 0,
    suggestedActions: [],
    savedTimestamp: Date.now(),
    isClient: true
  };

  test('useCombatActive returns combat active state', () => {
    const { result } = renderHook(() => useCombatActive(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBe(true);
  });

  test('useCombatRound returns the current round number', () => {
    const { result } = renderHook(() => useCombatRound(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBe(3);
  });

  test('usePlayerTurn returns whether it is the player\'s turn', () => {
    const { result } = renderHook(() => usePlayerTurn(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBe(true);
  });

  test('useCombatType returns the current combat type', () => {
    const { result } = renderHook(() => useCombatType(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBe('brawling');
  });

  test('useCombatLog returns the combat log entries', () => {
    const { result } = renderHook(() => useCombatLog(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].text).toBe('Combat started');
    expect(result.current[1].text).toBe('Player attacks');
  });

  test('useLastCombatLogEntry returns the most recent log entry', () => {
    const { result } = renderHook(() => useLastCombatLogEntry(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toEqual({
      text: 'Player attacks',
      timestamp: 2000,
      type: 'player'
    });
  });

  test('hooks handle missing state gracefully', () => {
    // Create a minimal valid game state with empty combat
    const emptyState: Partial<GameState> = {
      combat: {
        isActive: false,
        combatType: null, // Explicitly set to null, not 'brawling'
        rounds: 0,
        playerTurn: true,
        playerCharacterId: '',
        opponentCharacterId: '',
        combatLog: [],
        roundStartTime: 0,
        modifiers: { player: 0, opponent: 0 },
        currentTurn: null
      },
      character: { player: null, opponent: null },
      inventory: { items: [] },
      journal: { entries: [] },
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
      }
    };
    
    const { result: activeResult } = renderHook(() => useCombatActive(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(activeResult.current).toBe(false);
    
    const { result: roundResult } = renderHook(() => useCombatRound(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(roundResult.current).toBe(0);
    
    const { result: turnResult } = renderHook(() => usePlayerTurn(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(turnResult.current).toBe(true);
    
    const { result: typeResult } = renderHook(() => useCombatType(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(typeResult.current).toBe(null);
    
    const { result: logResult } = renderHook(() => useCombatLog(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(logResult.current).toEqual([]);
    
    const { result: lastEntryResult } = renderHook(() => useLastCombatLogEntry(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(lastEntryResult.current).toBeUndefined();
  });
});
