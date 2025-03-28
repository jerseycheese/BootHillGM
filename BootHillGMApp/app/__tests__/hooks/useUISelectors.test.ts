import { renderHook } from '@testing-library/react';
import { 
  useNotifications, 
  useNotificationsByType,
  useLatestNotification
} from '../../hooks/stateSelectors';
import { UIState } from '../../types/state/uiState';
import { GameState } from '../../types/gameState';
import { createGameProviderWrapper } from '../../test/utils/testWrappers';

describe('UI Selector Hooks', () => {
  const mockUIState: UIState = {
    isLoading: false,
    modalOpen: null,
    notifications: [
      { id: '1', message: 'Item acquired', type: 'success', timestamp: 1000 },
      { id: '2', message: 'Error loading', type: 'error', timestamp: 2000 },
      { id: '3', message: 'Quest updated', type: 'success', timestamp: 3000 }
    ]
  };

  // Create a complete game state to ensure proper initialization
  const mockGameState: Partial<GameState> = {
    ui: mockUIState,
    // Ensure these required state properties exist to avoid undefined issues
    character: { player: null, opponent: null },
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
    },
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
    currentPlayer: '',
    npcs: [],
    quests: [],
    location: null,
    gameProgress: 0,
    suggestedActions: [],
    savedTimestamp: Date.now(),
    isClient: true
  };

  test('useNotifications returns all notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(3);
    expect(result.current[0].message).toBe('Item acquired');
    expect(result.current[1].message).toBe('Error loading');
    expect(result.current[2].message).toBe('Quest updated');
  });

  test('useNotificationsByType returns notifications filtered by type', () => {
    const { result } = renderHook(() => useNotificationsByType('success'), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].message).toBe('Item acquired');
    expect(result.current[1].message).toBe('Quest updated');
  });

  test('useLatestNotification returns the most recent notification', () => {
    const { result } = renderHook(() => useLatestNotification(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toEqual({
      id: '3', 
      message: 'Quest updated', 
      type: 'success', 
      timestamp: 3000
    });
  });

  test('hooks handle missing state gracefully', () => {
    // Create a minimal valid game state with empty UI notifications
    const emptyState: Partial<GameState> = {
      ui: {
        isLoading: false,
        modalOpen: null,
        notifications: []
      },
      character: { player: null, opponent: null },
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
      },
      inventory: { items: [] },
      journal: { entries: [] },
      narrative: {
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        narrativeHistory: [],
        displayMode: 'standard',
        error: null
      }
    };
    
    const { result: notificationsResult } = renderHook(() => useNotifications(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(notificationsResult.current).toEqual([]);
    
    const { result: typeResult } = renderHook(() => useNotificationsByType('success'), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(typeResult.current).toEqual([]);
    
    const { result: latestResult } = renderHook(() => useLatestNotification(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(latestResult.current).toBeUndefined();
  });
});
