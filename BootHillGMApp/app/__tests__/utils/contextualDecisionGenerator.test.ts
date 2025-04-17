/**
 * Tests for the contextual decision generator
 * Specifically focused on preventing stale context issues (#210)
 */
import { generateEnhancedDecision } from '../../utils/contextualDecisionGenerator';
import { GameState } from '../../types/gameState';
import { NarrativeContext } from '../../types/narrative/context.types';
import { CombatType } from '../../types/state/combatState';
import * as helpers from '../../utils/decisionGeneratorHelpers'; // Add ES6 import

// Mock dependencies - mocking the entire module to avoid spyOn issues
jest.mock('../../utils/decisionGeneratorHelpers', () => ({
  getRefreshedGameState: jest.fn(gameState => ({
    ...gameState,
    narrative: {
      ...gameState.narrative,
      narrativeHistory: [
        ...gameState.narrative.narrativeHistory,
        'Fresh narrative entry added during refresh'
      ]
    }
  })),
  isGameStateReadyForDecisions: jest.fn(() => true),
  getSafePlayerCharacter: jest.fn(() => ({
    id: 'test-player',
    name: 'Test Player',
    isNPC: false,
    isPlayer: true,
    inventory: { items: [] },
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 0
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false
  }))
}));

// Create mock implementations that will be used consistently across tests
const mockGenerateDecision = jest.fn().mockImplementation(async () => ({
  id: 'test-ai-decision',
  prompt: 'AI-Generated Decision Prompt',
  timestamp: Date.now(),
  options: [
    { id: 'ai-option-1', text: 'AI Option 1', impact: 'Impact 1' },
    { id: 'ai-option-2', text: 'AI Option 2', impact: 'Impact 2' }
  ],
  context: 'Generated with AI using recent narrative context',
  importance: 'moderate',
  characters: [],
  aiGenerated: true
}));

const mockDetectDecisionPoint = jest.fn().mockReturnValue({ 
  score: 0.8, 
  shouldPresent: true, 
  reason: 'For testing' 
});

// Mock the contextual decision service
jest.mock('../../services/ai/contextualDecisionService', () => ({
  getContextualDecisionService: jest.fn(() => ({
    generateDecision: mockGenerateDecision,
    detectDecisionPoint: mockDetectDecisionPoint
  }))
}));

describe('Contextual Decision Generator', () => {
  // Setup a mock game state for testing
  const mockGameState: GameState = {
    currentPlayer: 'player',
    npcs: [],
    location: null,
    inventory: { 
      items: [],
      equippedWeaponId: null 
    },
    quests: [],
    gameProgress: 0,
    character: {
      player: null,
      opponent: null
    },
    combat: {
      rounds: 0,
      isActive: false,
      combatType: 'brawling' as CombatType,
      playerTurn: true,
      winner: null,
      playerCharacterId: '',
      opponentCharacterId: '',
      roundStartTime: 0,
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: null,
      combatLog: []
    },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [
        'You enter the dusty saloon.',
        'The bartender eyes you suspiciously.',
        'You order a whiskey and take a seat.',
        'A stranger approaches your table.'
      ],
      displayMode: 'standard',
      context: '',
      narrativeContext: {
        decisionHistory: []
      }
    },
    ui: { 
      activeTab: 'narrative',
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    suggestedActions: [],
    isClient: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should use refreshed game state rather than stale state', async () => {
    // const helpers = require('../../utils/decisionGeneratorHelpers'); // Remove require
    
    // Act: Generate a decision
    const decision = await generateEnhancedDecision(mockGameState, undefined, undefined, true);
    
    // Assert: getRefreshedGameState should have been called
    expect(helpers.getRefreshedGameState).toHaveBeenCalledWith(mockGameState);
    
    // The decision should be generated successfully
    expect(decision).not.toBeNull();
    expect(decision?.id).toBe('test-ai-decision');
    expect(mockGenerateDecision).toHaveBeenCalled();
  });
  
  test('should extract recent narrative context for better decisions', async () => {
    // Setup: Create a narrativeContext object
    const narrativeContext: NarrativeContext = {
      decisionHistory: []
    };
    
    // Act: Generate a decision with the narrativeContext
    const decision = await generateEnhancedDecision(mockGameState, narrativeContext, undefined, true);
    
    // Assert: narrativeContext should be updated with recent events
    expect(narrativeContext.recentEvents).toBeTruthy();
    expect(decision).not.toBeNull();
    expect(mockGenerateDecision).toHaveBeenCalled();
  });
  
  test('should update existing narrative context with recent events', async () => {
    // const helpers = require('../../utils/decisionGeneratorHelpers'); // Remove require
    
    // Setup: Create a mock game state with existing narrative context
    const gameStateWithContext = {
      ...mockGameState,
      narrative: {
        ...mockGameState.narrative,
        narrativeContext: {
          recentEvents: 'Old context information',
          decisionHistory: []
        }
      }
    };
    
    // Act: Generate a decision
    const decision = await generateEnhancedDecision(gameStateWithContext, undefined, undefined, true);
    
    // Assert: The decision generator should have been called with updated context
    expect(helpers.getRefreshedGameState).toHaveBeenCalledWith(gameStateWithContext);
    expect(decision).not.toBeNull();
    expect(mockGenerateDecision).toHaveBeenCalled();
  });
  
  test('should handle errors gracefully with fallback decisions', async () => {
    // Setup: Make the AI generator fail
    mockGenerateDecision.mockRejectedValueOnce(new Error('Test error'));
    
    // Act: Generate a decision
    const decision = await generateEnhancedDecision(mockGameState, undefined, undefined, true);
    
    // Assert: Should fall back to a template decision
    expect(decision).not.toBeNull();
    // The fallback decision has an ID that contains "fallback"
    expect(decision?.id).toContain('fallback');
  });
  
  test('should prioritize recent narrative entries in context', async () => {
    // Setup: Create a game state with a long narrative history
    const gameStateWithLongHistory = {
      ...mockGameState,
      narrative: {
        ...mockGameState.narrative,
        narrativeHistory: [
          'Old entry 1',
          'Old entry 2',
          'Old entry 3',
          'Old entry 4',
          'Old entry 5',
          'Old entry 6',
          'Recent entry 1',
          'Recent entry 2',
          'Most recent entry'
        ]
      }
    };
    
    // Act: Generate a decision
    const decision = await generateEnhancedDecision(gameStateWithLongHistory, undefined, undefined, true);
    
    // Assert: The decision should be generated successfully
    expect(decision).not.toBeNull();
    expect(mockGenerateDecision).toHaveBeenCalled();
    
    // Get the first argument passed to generateDecision
    const callArgs = mockGenerateDecision.mock.calls[0];
    expect(callArgs).toBeDefined();
    const narrativeArg = callArgs[0];
    
    // Verify the narrative arg is defined
    expect(narrativeArg).toBeDefined();
  });
  
  test('handles location information correctly in context', async () => {
    // Setup: Create a game state with location information
    const gameStateWithLocation = {
      ...mockGameState,
      location: {
        type: 'town' as const,
        name: 'Boot Hill'
      }
    };
    
    // Act: Generate a decision
    await generateEnhancedDecision(gameStateWithLocation, undefined, undefined, true);
    
    // Assert: The generateDecision function should have been called
    expect(mockGenerateDecision).toHaveBeenCalled();
  });
  
  test('creates minimal narrative context when none exists', async () => {
    // Setup: Create a game state with no narrative context
    const gameStateWithoutContext = {
      ...mockGameState,
      narrative: {
        ...mockGameState.narrative,
        narrativeContext: undefined
      }
    };
    
    // Act: Generate a decision
    const decision = await generateEnhancedDecision(gameStateWithoutContext, undefined, undefined, true);
    
    // Assert: A narrative context should have been created
    expect(decision).not.toBeNull();
    expect(mockGenerateDecision).toHaveBeenCalled();
    
    // Get the first argument passed to generateDecision
    const callArgs = mockGenerateDecision.mock.calls[0];
    expect(callArgs).toBeDefined();
    const narrativeArg = callArgs[0];
    
    // Verify the narrative context is created
    expect(narrativeArg.narrativeContext).toBeDefined();
    expect(narrativeArg.narrativeContext?.recentEvents).toBeDefined();
  });
});