/**
 * Narrative-related mock states for testing
 * Provides pre-configured narrative states for test scenarios
 */
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';
import { StoryPointType } from '../../../types/narrative/story-point.types';

/**
 * Creates a mock state with narrative context
 * 
 * @returns {BaseMockState} A state with narrative elements and story points for testing
 */
export function createNarrativeMockState(): BaseMockState {
  const baseState: BaseMockState = createBasicMockState();
  const currentTime: number = Date.now();
  
  return {
    ...baseState,
    narrative: {
      narrativeContext: {
        worldContext: 'Saloon, Evening, Tense',
        characterFocus: ['player', 'sheriff'],
        themes: ['revenge', 'justice'],
        importantEvents: ['Bank robbery'],
        storyPoints: {},
        narrativeArcs: {},
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: currentTime
        },
        narrativeBranches: {},
        pendingDecisions: [],
        decisionHistory: []
      },
      currentStoryPoint: {
        id: 'confrontation',
        title: 'Confrontation',
        content: 'A tense standoff',
        choices: [],
        type: 'action' as StoryPointType
      },
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [
        { id: 'dialogue1', speaker: 'NPC', text: 'Hello stranger', timestamp: 1615000000000 }
      ],
      displayMode: 'standard',
      error: null
    }
  };
}