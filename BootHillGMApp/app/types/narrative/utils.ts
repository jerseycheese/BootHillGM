/**
 * Narrative Utility Functions and Initial States
 * 
 * This file contains utility functions and initial state objects for the narrative system.
 * It includes type guards for runtime type checking and default state initialization.
 */

import { StoryPoint } from './story-point.types';
import { NarrativeChoice } from './choice.types';
import { NarrativeState } from '../narrative.types';
import { StoryProgressionState } from './progression.types';

/**
 * Type guard to check if an object is a valid StoryPoint
 * 
 * This function verifies that an unknown object conforms to the StoryPoint interface
 * by checking for required properties and their types. It's useful for runtime validation
 * when receiving data from external sources like APIs or local storage.
 * 
 * @param obj - The object to check
 * @returns A boolean indicating if the object is a valid StoryPoint
 * @example
 * ```typescript
 * const maybeStoryPoint = JSON.parse(localStorage.getItem('currentStoryPoint'));
 * if (isStoryPoint(maybeStoryPoint)) {
 *   // TypeScript now knows this is a StoryPoint
 *   console.log(maybeStoryPoint.title);
 * }
 * ```
 */
export const isStoryPoint = (obj: unknown): obj is StoryPoint => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).title === 'string' &&
    typeof (obj as Record<string, unknown>).content === 'string' &&
    typeof (obj as Record<string, unknown>).type === 'string'
  );
};

/**
 * Type guard to check if an object is a valid NarrativeChoice
 * 
 * This function verifies that an unknown object conforms to the NarrativeChoice interface
 * by checking for required properties and their types. It's useful for validating choice
 * data when loading from storage or receiving from an API.
 * 
 * @param obj - The object to check
 * @returns A boolean indicating if the object is a valid NarrativeChoice
 * @example
 * ```typescript
 * const choices = JSON.parse(localStorage.getItem('availableChoices')) || [];
 * const validChoices = choices.filter(isNarrativeChoice);
 * ```
 */
export const isNarrativeChoice = (obj: unknown): obj is NarrativeChoice => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).text === 'string' &&
    typeof (obj as Record<string, unknown>).leadsTo === 'string'
  );
};

/**
 * Initialize a new empty narrative state
 * 
 * This provides a consistent starting point for the narrative system, ensuring
 * all required properties are initialized with sensible defaults.
 */
export const initialNarrativeState: NarrativeState = {
  currentStoryPoint: null,
  visitedPoints: [],
  availableChoices: [],
  narrativeHistory: [],
  displayMode: 'standard',
  narrativeContext: undefined, // Initialize narrativeContext to undefined
  error: null
};

/**
 * Initialize empty story progression state
 * 
 * This provides a consistent starting point for the story progression tracking system,
 * with empty collections and tracking fields properly initialized.
 */
export const initialStoryProgressionState: StoryProgressionState = {
  currentPoint: null,
  progressionPoints: {},
  mainStorylinePoints: [],
  branchingPoints: {},
  lastUpdated: Date.now()
};