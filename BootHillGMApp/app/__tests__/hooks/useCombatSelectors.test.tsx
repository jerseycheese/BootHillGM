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
import { GameStateContext } from '../../context/GameStateProvider';
import { CombatType } from '../../types/combat';
import React from 'react';

// Direct wrapper using GameStateContext
const createWrapper = (mockState: GameState) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <GameStateContext.Provider value={{ state: mockState, dispatch: jest.fn() }}>
        {children}
      </GameStateContext.Provider>
    );
  };
  Wrapper.displayName = 'TestCombatStateWrapper'; // Add display name
  return Wrapper;
};

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
      { text: 'Player attacks', timestamp: 2000, type: 'action' } // Changed 'player' to 'action'
    ],
    roundStartTime: 0,
    modifiers: { player: 2, opponent: -1 },
    currentTurn: null
  };

  // Create a complete mock state
  const mockGameState: GameState = {
    combat: mockCombatState,
    character: { player: null, opponent: null },
    inventory: { items: [], equippedWeaponId: null },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      context: "",
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: [],
      activeTab: 'default'
    },
    currentPlayer: '',
    npcs: [],
    quests: [],
    location: null,
    gameProgress: 0,
    suggestedActions: [],
    savedTimestamp: Date.now(),
    isClient: true,
    meta: {}
  };

  test('useCombatActive returns combat active state', () => {
    const { result } = renderHook(() => useCombatActive(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBe(true);
  });

  test('useCombatRound returns the current round number', () => {
    const { result } = renderHook(() => useCombatRound(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBe(3);
  });

  test('usePlayerTurn returns whether it is the player\'s turn', () => {
    const { result } = renderHook(() => usePlayerTurn(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBe(true);
  });

  test('useCombatType returns the current combat type', () => {
    const { result } = renderHook(() => useCombatType(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBe('brawling');
  });

  test('useCombatLog returns the combat log entries', () => {
    const { result } = renderHook(() => useCombatLog(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].text).toBe('Combat started');
    expect(result.current[1].text).toBe('Player attacks');
  });

  test('useLastCombatLogEntry returns the most recent log entry', () => {
    const { result } = renderHook(() => useLastCombatLogEntry(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toEqual({
      text: 'Player attacks',
      timestamp: 2000,
      type: 'player'
    });
  });

  test('hooks handle missing state gracefully', () => {
    // Empty state with inactive combat
    const emptyState: GameState = {
      ...mockGameState,
      combat: {
        isActive: false,
        combatType: null,
        rounds: 0,
        playerTurn: true,
        playerCharacterId: '',
        opponentCharacterId: '',
        combatLog: [],
        roundStartTime: 0,
        modifiers: { player: 0, opponent: 0 },
        currentTurn: null
      }
    };
    
    const { result: activeResult } = renderHook(() => useCombatActive(), {
      wrapper: createWrapper(emptyState)
    });
    expect(activeResult.current).toBe(false);
    
    const { result: roundResult } = renderHook(() => useCombatRound(), {
      wrapper: createWrapper(emptyState)
    });
    expect(roundResult.current).toBe(0);
    
    const { result: turnResult } = renderHook(() => usePlayerTurn(), {
      wrapper: createWrapper(emptyState)
    });
    expect(turnResult.current).toBe(true);
    
    const { result: typeResult } = renderHook(() => useCombatType(), {
      wrapper: createWrapper(emptyState)
    });
    expect(typeResult.current).toBe(null);
    
    const { result: logResult } = renderHook(() => useCombatLog(), {
      wrapper: createWrapper(emptyState)
    });
    expect(logResult.current).toEqual([]);
    
    const { result: lastEntryResult } = renderHook(() => useLastCombatLogEntry(), {
      wrapper: createWrapper(emptyState)
    });
    expect(lastEntryResult.current).toBeUndefined();
  });
});