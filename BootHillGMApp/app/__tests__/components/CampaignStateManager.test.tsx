import { renderHook, act } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { GameState } from '../../types/gameState';

import { setupMocks } from '../../test/setup/mockSetup';

beforeEach(() => {
  setupMocks();
  // Reset initialization flag
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('initializing_new_character');
  }

  // Reset jest timers
  jest.useRealTimers();
});

describe('CampaignStateManager', () => {
  // Helper function to compare states without timestamps
  const compareStatesWithoutTimestamp = (currentState: GameState, expectedState: GameState) => {
    // Create new objects without the timestamp for comparison
    const currentCompare = { ...currentState };
    const expectedCompare = { ...expectedState };
    
    // Delete timestamps before comparison
    delete currentCompare.savedTimestamp;
    delete expectedCompare.savedTimestamp;
    
    expect(currentCompare).toEqual(expectedCompare);
  };

  // Test case: Check if the CampaignStateManager initializes with the default state
  test('initializes with default state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    expect(result.current.state.currentPlayer).toBe('');
    expect(result.current.state.character).toBeNull();
    expect(result.current.state.location).toBe('');
    expect(result.current.state.narrative).toBe('');
    expect(result.current.state.inventory).toEqual([]);
    expect(result.current.state.npcs).toEqual([]);
    expect(result.current.state.quests).toEqual([]);
    expect(result.current.state.journal).toEqual([]);
    expect(result.current.state.gameProgress).toBe(0);
    expect(result.current.state.isCombatActive).toBe(false);
    expect(result.current.state.opponent).toBeNull();
    expect(result.current.state.savedTimestamp).toBeDefined();
    expect(result.current.state.isClient).toBe(true);
    expect(result.current.state.suggestedActions).toEqual([]);
    expect(result.current.state.combatState).toBeUndefined();
  });

  // Test case: Check if the state updates correctly
  test('updates state correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_PLAYER', payload: 'Test Player' });
      result.current.dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          id: '1', 
          name: 'Test Item', 
          quantity: 1, 
          description: 'A test item',
          category: 'general'
        }
      });
      result.current.dispatch({ type: 'ADD_QUEST', payload: 'Test Quest' });
    });

    expect(result.current.state.currentPlayer).toBe('Test Player');
    expect(result.current.state.inventory[0]).toEqual({ 
      id: '1', 
      name: 'Test Item', 
      quantity: 1, 
      description: 'A test item',
      category: 'general'
    });
    expect(result.current.state.quests).toEqual(['Test Quest']);
    expect(result.current.state.isClient).toBe(true);
    expect(result.current.state.suggestedActions).toEqual([]);
  });

  test('loads state from localStorage', async () => {
    const testState: GameState = {
      currentPlayer: 'Test Player',
      character: {
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
      },
      location: 'Test Town',
      narrative: 'Test narrative',
      inventory: [{ 
        id: '1', 
        name: 'Test Item', 
        quantity: 1, 
        description: 'A test item',
        category: 'general'
      }],
      npcs: ['Test NPC'],
      quests: ['Test Quest'],
      journal: [{ 
        timestamp: Date.now(), 
        content: 'Test entry',
        narrativeSummary: 'Test summary',
        type: 'narrative'
      }],
      gameProgress: 5,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: true,
      suggestedActions: [],
      combatState: {
        isActive: false,
        combatType: null,
        winner: null,
        combatLog: []
      }
    };

    localStorage.setItem('campaignState', JSON.stringify(testState));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });
    
    act(() => {
      result.current.loadGame();
    });

    const loadedState = { ...testState, ...result.current.state };
    compareStatesWithoutTimestamp(loadedState, testState);
  });

  test('handles corrupted state gracefully', async () => {
    // Temporarily suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    localStorage.setItem('campaignState', 'invalid json');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    act(() => {
      const loadedState = result.current.loadGame();
      expect(loadedState).toBeNull();
      expect(result.current.state.character).toBeNull();
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('handles no saved state gracefully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    act(() => {
      const loadedState = result.current.loadGame();
      expect(loadedState).toBeNull();
    });
  });

  // Test case: Check if the state is saved to localStorage
  test('saves state to localStorage', async () => {
    jest.useFakeTimers();
    
    const testState: GameState = {
      currentPlayer: 'Test Player',
      character: {
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
      },
      location: 'Test Town',
      narrative: 'Test narrative',
      inventory: [{ 
        id: '1', 
        name: 'Test Item', 
        quantity: 1, 
        description: 'A test item',
        category: 'general'
      }],
      npcs: ['Test NPC'],
      quests: ['Test Quest'],
      journal: [{ 
        timestamp: Date.now(), 
        content: 'Test entry',
        narrativeSummary: 'Test summary',
        type: 'narrative'
      }],
      gameProgress: 5,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: true,
      suggestedActions: [],
      combatState: undefined
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    // Set all state at once to avoid debounce issues
    act(() => {
      result.current.dispatch({ type: 'SET_STATE', payload: testState });
      // Force save without waiting for auto-save
      result.current.saveGame(testState);
    });

    // Fast-forward timers to handle any debouncing
    act(() => {
      jest.runAllTimers();
    });

    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    compareStatesWithoutTimestamp(savedState, testState);
    expect(savedState.savedTimestamp).toBeDefined();
    expect(savedState.isClient).toBe(true);
  });
});
