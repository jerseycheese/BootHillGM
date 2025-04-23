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
        storyPoints: { /* Intentionally empty */ },
        narrativeArcs: { /* Intentionally empty */ },
        impactState: {
          reputationImpacts: { /* Intentionally empty */ },
          relationshipImpacts: { /* Intentionally empty */ },
          worldStateImpacts: { /* Intentionally empty */ },
          storyArcImpacts: { /* Intentionally empty */ },
          lastUpdated: currentTime
        },
        narrativeBranches: { /* Intentionally empty */ },
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
      // Update narrativeHistory to be an array of strings
      narrativeHistory: [
        'NPC: Hello stranger'
      ],
      displayMode: 'standard',
      error: null
    }
  };
}