/**
 * Narrative Helper Functions
 * 
 * This file contains utility functions for working with narrative state.
 */

import {
  NarrativeContext,
  StoryPoint,
  NarrativeChoice,
} from '../types/narrative.types';

/**
 * Generates a default NarrativeContext object.
 * @returns {NarrativeContext} A default NarrativeContext object.
 */
export const defaultNarrativeContext = (): NarrativeContext => ({
    tone: undefined,
    characterFocus: [],
    themes: [],
    worldContext: '',
    importantEvents: [],
    storyPoints: {},
    narrativeArcs: {},
    narrativeBranches: {},
    currentArcId: undefined,
    currentBranchId: undefined,
    activeDecision: undefined,
    pendingDecisions: [],
    decisionHistory: [],
    impactState: { 
      reputationImpacts: {}, 
      relationshipImpacts: {}, 
      worldStateImpacts: {}, 
      storyArcImpacts: {}, 
      lastUpdated: Date.now() 
    },
});

/**
 * Validates that a story point exists in the current narrative.
 * @param {string} storyPointId - ID of the story point to validate.
 * @param {Record<string, StoryPoint>} storyPoints - Collection of available story points.
 * @returns {boolean} True if the story point exists, false otherwise.
 */
export const validateStoryPoint = (
  storyPointId: string,
  storyPoints: Record<string, StoryPoint>
): boolean => {
  return Boolean(storyPoints[storyPointId]);
};

/**
 * Validates that a choice is available and valid for the current story point.
 * @param choiceId - ID of the choice to validate.
 * @param availableChoices - Current available choices.
 * @returns True if the choice is valid, false otherwise.
 */
export const validateChoice = (
  choiceId: string,
  availableChoices: NarrativeChoice[]
): boolean => {
  return availableChoices.some((choice) => choice.id === choiceId);
};

/**
 * Updates the available choices based on the current story point.
 * @param storyPoint - Current story point.
 * @returns Array of available narrative choices.
 */
export const updateAvailableChoices = (
  storyPoint: StoryPoint | null
): NarrativeChoice[] => {
  if (!storyPoint || !storyPoint.choices) {
    return [];
  }
  return storyPoint.choices;
};
