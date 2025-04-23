/**
 * Test fixtures for AI decision responses used in decision-service tests.
 */
import { NarrativeState } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { LocationType } from '../../services/locationService';

/**
 * Create a test game state for decision service integration testing
 * @returns A mock game state for testing
 */
export const createTestGameState = (): { narrative: NarrativeState; character: Character } => {
  return {
    narrative: {
      currentStoryPoint: {
        id: 'saloon-entrance',
        content: 'You stand at the entrance of the Dusty Bottle Saloon. The piano music and chatter drift through the swinging doors.',
        type: 'transition', // Fixed: using valid StoryPointType
        title: 'Saloon Entrance', // Added required field
        locationChange: { type: 'landmark', name: 'SALOON_ENTRANCE' } as LocationType // Fixed: using proper LocationType
      },
      visitedPoints: ['town-street', 'saloon-entrance'],
      availableChoices: [],
      narrativeHistory: [
        'You arrived in Redemption on a dusty afternoon.',
        'The locals eyed you with suspicion as you made your way down the main street.',
        'You spotted the Dusty Bottle Saloon at the end of the road and decided to get a drink.'
      ],
      displayMode: 'standard',
      narrativeContext: {
        tone: 'serious',
        characterFocus: ['Sheriff', 'Bartender'],
        themes: ['frontier-justice', 'strangers-in-town'],
        worldContext: 'The town of Redemption has been plagued by a series of stagecoach robberies.',
        importantEvents: [],
        storyPoints: { /* Intentionally empty */ },
        narrativeArcs: { /* Intentionally empty */ },
        impactState: {
          reputationImpacts: { /* Intentionally empty */ },
          relationshipImpacts: { /* Intentionally empty */ },
          worldStateImpacts: {
            'TownSuspicion': 30
          },
          storyArcImpacts: { /* Intentionally empty */ },
          lastUpdated: Date.now()
        },
        narrativeBranches: { /* Intentionally empty */ },
        decisionHistory: [],
        pendingDecisions: []
      },
      context: "" // Add missing context property
    },
    character: {
      id: 'player-1',
      name: 'Hayes Cooper',
      isNPC: false,
      isPlayer: true,
      attributes: {
        bravery: 7,
        speed: 8,
        gunAccuracy: 6,
        throwingAccuracy: 5,
        strength: 70,
        baseStrength: 70,
        experience: 3
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 1,
        baseStrength: 1,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 100,
        baseStrength: 100,
        bravery: 20,
        experience: 10
      },
      wounds: [],
      isUnconscious: false,
      inventory: { items: [] }
    }
  };
};

/**
 * Create a mock API response based on prompt context
 * @param promptContext Context string to generate the response from
 * @returns A mock API response object
 */
export const createMockApiResponse = (promptContext: string) => {
  // Create a different response based on narrative context to test context awareness
  const mentionsSheriff = promptContext.toLowerCase().includes('sheriff');
  const mentionsBartender = promptContext.toLowerCase().includes('bartender');
  
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            decisionId: `decision-${Date.now()}`,
            prompt: mentionsSheriff 
              ? 'How do you respond to the sheriff?'
              : (mentionsBartender 
                  ? 'What do you say to the bartender?' 
                  : 'What do you want to do?'),
            options: [
              {
                id: 'option-1',
                text: mentionsSheriff 
                  ? 'Tip your hat respectfully' 
                  : 'Enter the saloon confidently',
                confidence: 0.9,
                traits: ['brave', 'direct'],
                potentialOutcomes: ['Establish presence', 'Might attract attention'],
                impact: 'Make a strong first impression'
              },
              {
                id: 'option-2',
                text: mentionsSheriff
                  ? 'Ask about the recent robberies'
                  : (mentionsBartender
                      ? 'Order a whiskey and ask for information'
                      : 'Peer through the window first'),
                confidence: 0.8,
                traits: ['cautious', 'observant'],
                potentialOutcomes: ['Gather information', 'Stay unnoticed'],
                impact: 'Learn about the environment before engaging'
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
};