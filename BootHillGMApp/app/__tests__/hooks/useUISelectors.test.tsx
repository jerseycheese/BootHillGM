import { renderHook } from '@testing-library/react';
import { 
  useNotifications, 
  useNotificationsByType,
  useLatestNotification
} from '../../hooks/stateSelectors';
import { UIState } from '../../types/state/uiState';
import { GameState } from '../../types/gameState';
import { GameStateContext } from '../../context/GameStateProvider';
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
  Wrapper.displayName = 'TestUIStateWrapper'; // Add display name
  return Wrapper;
};

describe('UI Selector Hooks', () => {
  const mockUIState: UIState = {
    isLoading: false,
    modalOpen: null,
    notifications: [
      { id: '1', message: 'Item acquired', type: 'success', timestamp: 1000 },
      { id: '2', message: 'Error loading', type: 'error', timestamp: 2000 },
      { id: '3', message: 'Quest updated', type: 'success', timestamp: 3000 }
    ],
    activeTab: 'character'
  };

  // Create a complete mock state
  const mockGameState: GameState = {
    ui: mockUIState,
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

  test('useNotifications returns all notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(3);
    expect(result.current[0].message).toBe('Item acquired');
    expect(result.current[1].message).toBe('Error loading');
    expect(result.current[2].message).toBe('Quest updated');
  });

  test('useNotificationsByType returns notifications filtered by type', () => {
    const { result } = renderHook(() => useNotificationsByType('success'), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toHaveLength(2);
    expect(result.current[0].message).toBe('Item acquired');
    expect(result.current[1].message).toBe('Quest updated');
  });

  test('useLatestNotification returns the most recent notification', () => {
    const { result } = renderHook(() => useLatestNotification(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toEqual({
      id: '3', 
      message: 'Quest updated', 
      type: 'success', 
      timestamp: 3000
    });
  });

  test('hooks handle missing state gracefully', () => {
    // Empty state with no notifications
    const emptyState: GameState = {
      ...mockGameState,
      ui: {
        ...mockGameState.ui,
        notifications: []
      }
    };
    
    const { result: notificationsResult } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(emptyState)
    });
    expect(notificationsResult.current).toEqual([]);
    
    const { result: typeResult } = renderHook(() => useNotificationsByType('success'), {
      wrapper: createWrapper(emptyState)
    });
    expect(typeResult.current).toEqual([]);
    
    const { result: latestResult } = renderHook(() => useLatestNotification(), {
      wrapper: createWrapper(emptyState)
    });
    expect(latestResult.current).toBeUndefined();
  });
});