import { renderHook } from '@testing-library/react';
import { 
  useNarrativeContext,
  useCurrentScene
} from '../../hooks/stateSelectors';
import { NarrativeState } from '../../types/state/narrativeState';
import { GameState } from '../../types/gameState';
import { initialNarrativeState } from '../../types/state/narrativeState';
import { createGameProviderWrapper } from '../../test/utils/testWrappers';
import { NarrativeContext } from '../../types/narrative/context.types';
import { StoryPoint } from '../../types/narrative.types';

// Interface for legacy narrative state properties in tests
interface LegacyNarrativeState extends NarrativeState {
  context?: NarrativeContext;
  currentScene?: StoryPoint;
}

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
    description: 'You arrive at the dusty town of Redemption.',
    choices: [],
    tags: ['start', 'town'],
    requirements: {},
    effects: {},
    narrativeContext: mockNarrativeContext,
    location: 'town'
  };

  // Create a mock narrative state with both the standard and test formats
  const mockNarrativeState: LegacyNarrativeState = {
    ...initialNarrativeState,
    narrativeContext: mockNarrativeContext,
    currentStoryPoint: mockStoryPoint,
    // For test compatibility - include older property names as well
    context: mockNarrativeContext,
    currentScene: mockStoryPoint
  };

  // Create a complete game state to ensure proper initialization
  const mockGameState: Partial<GameState> = {
    narrative: mockNarrativeState,
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

  test('useNarrativeContext returns the current narrative context', () => {
    const { result } = renderHook(() => useNarrativeContext(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBeDefined();
    expect(result.current?.worldContext).toBe('Wild West town, 1885');
    expect(result.current?.themes).toContain('Justice');
    expect(result.current?.characterFocus).toContain('Sheriff');
  });

  test('useCurrentScene returns the current story point', () => {
    const { result } = renderHook(() => useCurrentScene(), {
      wrapper: createGameProviderWrapper(mockGameState)
    });
    
    expect(result.current).toBeDefined();
    expect(result.current?.id).toBe('story-1');
    expect(result.current?.title).toBe('The Arrival');
    expect(result.current?.description).toContain('dusty town of Redemption');
  });

  test('hooks handle missing state gracefully', () => {
    // Create a minimal valid game state with empty narrative
    const emptyState: Partial<GameState> = {
      narrative: {
        ...initialNarrativeState,
        narrativeContext: undefined,
        currentStoryPoint: null,
      } as LegacyNarrativeState,
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
      ui: {
        isLoading: false,
        modalOpen: null,
        notifications: []
      }
    };
    
    const { result: contextResult } = renderHook(() => useNarrativeContext(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(contextResult.current).toBeUndefined();
    
    const { result: sceneResult } = renderHook(() => useCurrentScene(), {
      wrapper: createGameProviderWrapper(emptyState)
    });
    expect(sceneResult.current).toBeNull();
  });

  test('hooks handle legacy property names correctly', () => {
    // Create a state with just the legacy property names
    const legacyState: Partial<GameState> = {
      narrative: {
        ...initialNarrativeState,
        context: mockNarrativeContext,
        currentScene: mockStoryPoint,
        // Explicitly remove the new property names
        narrativeContext: undefined,
        currentStoryPoint: null
      } as LegacyNarrativeState,
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
    
    const { result: contextResult } = renderHook(() => useNarrativeContext(), {
      wrapper: createGameProviderWrapper(legacyState)
    });
    expect(contextResult.current).toBeDefined();
    expect(contextResult.current?.worldContext).toBe('Wild West town, 1885');
    
    const { result: sceneResult } = renderHook(() => useCurrentScene(), {
      wrapper: createGameProviderWrapper(legacyState)
    });
    expect(sceneResult.current).toBeDefined();
    expect(sceneResult.current?.title).toBe('The Arrival');
  });
});
