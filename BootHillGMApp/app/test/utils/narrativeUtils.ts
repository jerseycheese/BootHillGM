/**
 * Utility functions specific to narrative reducer tests
 * 
 * This module provides test utilities that help set up and test the narrative reducer.
 * It includes state extraction, mock data creation, and test state initialization.
 */
import { NarrativeState } from '../../types/narrative.types';
import { GameState } from '../../types/gameState';
import { DecisionImportance } from '../../types/narrative.types';
import { PlayerDecision } from '../../types/narrative/decision.types';
import { StoryPoint, StoryPointType } from '../../types/narrative/story-point.types';
import { mockStates } from './stateTestUtils/mockStates';

/**
 * Extract narrative state from either GameState or NarrativeState
 * 
 * This utility handles both the nested state object used in GameState
 * and the direct NarrativeState object, allowing tests to work with either.
 *
 * @param state - Either a GameState with narrative property or a direct NarrativeState
 * @returns The extracted NarrativeState
 */
export const getNarrativeState = (state: NarrativeState | Partial<GameState>): NarrativeState => {
  return 'narrative' in state ? state.narrative as NarrativeState : state as NarrativeState;
};

/**
 * Creates a mock decision for testing decision-related actions
 * 
 * @param id - Optional ID for the decision, defaults to 'decision1'
 * @returns A mock PlayerDecision object with test values
 */
export const createMockDecision = (id: string = 'decision1'): PlayerDecision => ({
  id,
  prompt: 'Test prompt',
  timestamp: Date.now(),
  options: [
    { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
    { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
  ],
  context: 'Test context',
  importance: 'moderate' as DecisionImportance,
  aiGenerated: true
});

/**
 * Creates a test state with narrative context for testing narrative actions
 * 
 * This function builds on the project's existing mockStates.withNarrative()
 * but adds specific customizations needed for the narrative reducer tests.
 * It provides a consistent initial state for all narrative reducer tests.
 *
 * @returns A GameState object with narrative context configured for testing
 */
export const createNarrativeTestState = (): Partial<GameState> => {
  const baseState = mockStates.withNarrative();
  
  // We need to customize the narrative context for our specific tests
  return {
    ...baseState,
    narrative: {
      ...baseState.narrative,
      narrativeContext: {
        ...baseState.narrative.narrativeContext,
        tone: 'serious',
        characterFocus: ['player'],
        themes: ['western'],
        worldContext: 'Wild West town',
        importantEvents: [],
        activeDecision: undefined,
        pendingDecisions: [],
        decisionHistory: [],
        storyPoints: getMockStoryPoints(),
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: Date.now()
        },
        narrativeArcs: {
          'arc1': {
            id: 'arc1',
            title: 'Saloon Encounter',
            description: 'A tense encounter at the local saloon',
            branches: [],
            startingBranch: 'branch1',
            isCompleted: false
          }
        },
        narrativeBranches: {
          'branch1': {
            id: 'branch1',
            title: 'Bar Fight',
            startPoint: 'point1',
            endPoints: ['point4'],
            isActive: false
          }
        }
      }
    }
  };
};

/**
 * Returns mock story points for testing navigation and choice actions
 * 
 * These story points represent a simple narrative flow:
 * - point1: Entry point with two choices
 * - point2: Second story point that follows from the first choice
 *
 * @returns A record of StoryPoint objects keyed by their IDs
 */
export const getMockStoryPoints = (): Record<string, StoryPoint> => ({
  'point1': {
    id: 'point1',
    type: 'exposition' as StoryPointType,
    title: 'Introduction',
    content: 'You enter the saloon.',
    choices: [
      {
        id: 'choice1',
        text: 'Go to the bar',
        leadsTo: 'point2'
      },
      {
        id: 'choice2',
        text: 'Find a table',
        leadsTo: 'point3'
      }
    ]
  },
  'point2': {
    id: 'point2',
    type: 'decision' as StoryPointType,
    title: 'At the Bar',
    content: 'The bartender looks at you.',
    choices: [
      {
        id: 'choice3',
        text: 'Order a drink',
        leadsTo: 'point4'
      }
    ]
  }
});