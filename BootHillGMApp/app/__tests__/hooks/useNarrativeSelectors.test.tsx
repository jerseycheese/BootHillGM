import { renderHook } from '@testing-library/react';
import { 
  useNarrativeContext,
  useCurrentScene
} from '../../hooks/stateSelectors';
import { GameState } from '../../types/gameState';
import { initialNarrativeState } from '../../types/state/narrativeState';
import { GameStateContext } from '../../context/GameStateProvider';
import { NarrativeContext } from '../../types/narrative/context.types';
import { StoryPoint } from '../../types/narrative.types';
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
  Wrapper.displayName = 'TestNarrativeStateWrapper'; // Add display name
  return Wrapper;
};

describe('Narrative Selector Hooks', () => {
  // Mock a narrative context for testing
  const mockNarrativeContext: NarrativeContext = {
    worldContext: 'Wild West town, 1885',
    characterFocus: ['Sheriff', 'Outlaw'],
    themes: ['Justice', 'Revenge'],
    importantEvents: ['Bank robbery', 'Showdown at noon'],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {},
      relationshipImpacts: {},
      worldStateImpacts: {},
      storyArcImpacts: {},
      lastUpdated: Date.now()
    },
    narrativeBranches: {},
    pendingDecisions: [],
    decisionHistory: []
  };

  // Mock a story point for testing
  const mockStoryPoint: StoryPoint = {
    id: 'story-1',
    title: 'The Arrival',
    content: 'You arrive at the dusty town of Redemption.',
    type: 'narrative',
    choices: [],
    tags: ['start', 'town'],
  };

  // Complete mock state
  const mockGameState: GameState = {
    narrative: {
      ...initialNarrativeState,
      narrativeContext: mockNarrativeContext,
      currentStoryPoint: mockStoryPoint,
      context: "Legacy context string",
      narrativeHistory: [],
      visitedPoints: [],
      availableChoices: [],
      displayMode: 'standard',
      error: null
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
    inventory: { items: [], equippedWeaponId: null },
    journal: { entries: [] },
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

  test('useNarrativeContext returns the current narrative context', () => {
    const { result } = renderHook(() => useNarrativeContext(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBeDefined();
    expect(result.current?.worldContext).toBe('Wild West town, 1885');
    expect(result.current?.themes).toContain('Justice');
    expect(result.current?.characterFocus).toContain('Sheriff');
  });

  test('useCurrentScene returns the current story point', () => {
    const { result } = renderHook(() => useCurrentScene(), {
      wrapper: createWrapper(mockGameState)
    });
    
    expect(result.current).toBeDefined();
    expect(result.current?.id).toBe('story-1');
    expect(result.current?.title).toBe('The Arrival');
    expect(result.current?.content).toContain('dusty town of Redemption');
  });

  test('hooks handle missing state gracefully', () => {
    // Empty state
    const emptyState: GameState = {
      ...mockGameState,
      narrative: {
        ...initialNarrativeState,
        narrativeContext: undefined,
        currentStoryPoint: null,
        context: "",
      }
    };
    
    const { result: contextResult } = renderHook(() => useNarrativeContext(), {
      wrapper: createWrapper(emptyState)
    });
    
    expect(contextResult.current).toBeUndefined();
    
    const { result: sceneResult } = renderHook(() => useCurrentScene(), {
      wrapper: createWrapper(emptyState)
    });
    expect(sceneResult.current).toBeNull();
  });

  test('hooks handle legacy property names correctly', () => {
    // State with legacy properties
    const legacyState: GameState = {
      ...mockGameState,
      narrative: {
        ...initialNarrativeState,
        narrativeContext: undefined,
        currentStoryPoint: null,
        context: mockNarrativeContext as any, // Cast to any to satisfy string type for legacy test
        // @ts-expect-error - add legacy property for testing
        currentScene: mockStoryPoint,
      }
    };
    
    const { result: contextResult } = renderHook(() => useNarrativeContext(), {
      wrapper: createWrapper(legacyState)
    });
    
    expect(contextResult.current).toBeDefined();
    expect(contextResult.current?.worldContext).toBe('Wild West town, 1885');
    
    const { result: sceneResult } = renderHook(() => useCurrentScene(), {
      wrapper: createWrapper(legacyState)
    });
    
    expect(sceneResult.current).toBeDefined();
    expect(sceneResult.current?.title).toBe('The Arrival');
  });
});