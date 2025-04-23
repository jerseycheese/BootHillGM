import { StoryPoint, NarrativeState, NarrativeDisplayMode } from '../../../../types/narrative.types';
import { Character } from '../../../../types/character';
import { LocationType } from '../../../../services/locationService';
import { DecisionImportance } from '../../../../types/narrative/decision.types';
import { DecisionResponse } from '../../../../types/ai-service.types';

/**
 * Test story point for decision service tests
 * Represents a basic narrative point in a saloon location
 */
export const testStoryPoint: StoryPoint = {
  id: 'test-story-point',
  title: 'Saloon Entrance',
  content: 'The sheriff eyes you suspiciously as you enter the saloon.',
  type: 'narrative',
  locationChange: 'SALOON' as unknown as LocationType
};

/**
 * Mock narrative state with minimal required properties for testing
 */
export const mockNarrativeState: NarrativeState = {
  currentStoryPoint: testStoryPoint,
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The locals seem wary of strangers these days.'
  ],
  narrativeContext: {
    worldContext: 'There have been several robberies in town recently.',
    characterFocus: [],
    themes: [],
    importantEvents: [],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {},
      relationshipImpacts: {},
      worldStateImpacts: {},
      storyArcImpacts: {},
      lastUpdated: 0
    },
    narrativeBranches: {},
    pendingDecisions: [],
    decisionHistory: []
  },
  visitedPoints: [],
  availableChoices: [],
  displayMode: 'standard' as NarrativeDisplayMode,
  context: ""
};

/**
 * Mock player character with all required attributes for testing
 */
export const mockCharacter: Character = {
  id: 'player-1',
  name: 'Buck Wilde',
  isNPC: false,
  isPlayer: true,
  inventory: { items: [] },
  attributes: {
    bravery: 9,
    speed: 7,
    gunAccuracy: 8,
    throwingAccuracy: 5,
    strength: 7,
    baseStrength: 7,
    experience: 0
  },
  minAttributes: {
    bravery: 0,
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    experience: 0
  },
  maxAttributes: {
    bravery: 10,
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 10,
    baseStrength: 10,
    experience: 10
  },
  wounds: [],
  isUnconscious: false
};

/**
 * Mock API response with proper formatting and structure
 * Simulates a decision about responding to the sheriff
 */
export const mockApiResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          decisionId: 'decision-123',
          prompt: 'How do you respond to the sheriff?',
          options: [
            {
              id: 'option-1',
              text: 'Tip your hat and smile',
              confidence: 0.9,
              traits: ['friendly', 'calm'],
              potentialOutcomes: ['Might ease tensions', 'Sheriff could warm up to you'],
              impact: 'Establish yourself as non-threatening'
            },
            {
              id: 'option-2',
              text: 'Ignore him and head to the bar',
              confidence: 0.7,
              traits: ['independent', 'aloof'],
              potentialOutcomes: ['Might appear suspicious', 'Sheriff could watch you closely'],
              impact: 'Establish yourself as independent but possibly suspicious'
            }
          ],
          relevanceScore: 0.85,
          metadata: {
            narrativeImpact: 'Sets the tone for town interactions',
            themeAlignment: 'Classic western standoff tension',
            pacing: 'medium',
            importance: 'significant'
          }
        })
      }
    }
  ]
};

/**
 * Creates a mock narrative state with comprehensive data for enhanced context tests
 * @param override Optional properties to override in the base state
 * @returns A fully configured narrative state for testing
 */
export const createMockNarrativeState = (override?: Partial<NarrativeState>): NarrativeState => ({
  currentStoryPoint: {
    id: 'story-point-1',
    title: 'Arrival in Town',
    content: 'You find yourself in the middle of a dusty street.',
    type: 'narrative',
    locationChange: 'TOWN_STREET' as unknown as LocationType
  },
  visitedPoints: ['intro', 'town-entrance'],
  availableChoices: [],
  displayMode: 'standard' as NarrativeDisplayMode,
  context: "",
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The sheriff eyed you suspiciously as you walked down the main street.',
    'A group of locals whispered as you passed by.',
    'You decided to head to the saloon for information.',
    'The bartender greeted you with a nod.'
  ],
  narrativeContext: {
    tone: 'serious',
    characterFocus: ['Sheriff', 'Bartender', 'Mysterious Stranger'],
    themes: ['justice', 'redemption', 'frontier-life'],
    worldContext: 'A town plagued by recent robberies and mysterious disappearances.',
    importantEvents: [
      'Sheriff mentioned missing gold shipments',
      'Bartender warned about strangers in town'
    ],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {
        'Sheriff': -10,
        'Bartender': 15
      },
      relationshipImpacts: {
        'Player': {
          'Sheriff': -10,
          'Bartender': 20
        }
      },
      worldStateImpacts: {
        'TownSuspicion': 40,
        'SheriffTrust': -5
      },
      storyArcImpacts: {},
      lastUpdated: Date.now() - 5000
    },
    narrativeBranches: {},
    pendingDecisions: [],
    decisionHistory: [
      {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now() - 50000,
        narrative: 'You decided to approach the sheriff directly.',
        impactDescription: 'The sheriff seems cautious but willing to talk.',
        tags: ['sheriff', 'direct-approach'],
        relevanceScore: 8
      },
      {
        decisionId: 'decision-2',
        selectedOptionId: 'option-3',
        timestamp: Date.now() - 30000,
        narrative: 'You asked the bartender about recent events.',
        impactDescription: 'The bartender appreciates your discretion.',
        tags: ['bartender', 'gathering-info'],
        relevanceScore: 9
      }
    ]
  },
  ...override
});

/**
 * Mock decision response for testing AIDecisionGenerator
 * Contains properly formatted options and metadata
 */
export const mockResponse: DecisionResponse = {
  decisionId: 'decision-123',
  prompt: 'How do you proceed?',
  options: [
    {
      id: 'option-1',
      text: 'Confront the sheriff about the rumors',
      confidence: 0.8,
      traits: ['brave', 'direct'],
      potentialOutcomes: ['Gain sheriff\'s respect', 'Might provoke hostility'],
      impact: 'Direct approach could clarify situation but risks confrontation'
    },
    {
      id: 'option-2',
      text: 'Continue gathering information discreetly',
      confidence: 0.9,
      traits: ['cautious', 'observant'],
      potentialOutcomes: ['Learn more details', 'Maintain low profile'],
      impact: 'Safer approach but might take longer to get answers'
    }
  ],
  relevanceScore: 0.85,
  metadata: {
    narrativeImpact: 'Sets approach to investigation',
    themeAlignment: 'Classic western mystery',
    pacing: 'medium',
    importance: 'significant'
  }
};