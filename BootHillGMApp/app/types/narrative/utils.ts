/**
 * Utilities and type guards for narrative types
 */

import { StoryPoint } from './story-point.types';
import { NarrativeChoice } from './choice.types';
import { NarrativeState } from '../narrative.types';
import { StoryProgressionState } from './progression.types';
import { initialLoreState } from './lore.types'; // Import initialLoreState

/**
 * Type guard to check if an object is a StoryPoint
 */
export function isStoryPoint(obj: unknown): obj is StoryPoint {
  return (
    obj !== null && // Explicit null check
    typeof obj === 'object' &&
    obj !== null && // Redundant but safe null check
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
    'title' in obj && typeof (obj as Record<string, unknown>).title === 'string' &&
    'content' in obj && typeof (obj as Record<string, unknown>).content === 'string' &&
    'type' in obj && typeof (obj as Record<string, unknown>).type === 'string' // Add type check for 'type'
  );
}

/**
 * Type guard to check if an object is a NarrativeChoice
 */
export function isNarrativeChoice(obj: unknown): obj is NarrativeChoice {
  return (
    obj !== null && // Explicit null check
    typeof obj === 'object' &&
    // Check for property existence before type checking
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
    'text' in obj && typeof (obj as Record<string, unknown>).text === 'string' &&
    'leadsTo' in obj && typeof (obj as Record<string, unknown>).leadsTo === 'string'
  );
}

/**
 * Initial state for StoryProgressionState
 */
export const initialStoryProgressionState: StoryProgressionState = {
  currentPoint: null,
  progressionPoints: { /* Intentionally empty */ },
  mainStorylinePoints: [], // Initialize as empty array
  branchingPoints: { /* Intentionally empty */ },
  lastUpdated: Date.now() // Initialize with current time
};

/**
 * Initial state for narrative management
 * Provides default values for all required properties
 */
export const initialNarrativeState: NarrativeState = {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
  displayMode: 'standard',
  context: '',
  storyProgression: initialStoryProgressionState,
  currentDecision: undefined,
  error: null,
  needsInitialGeneration: false, // Add the flag for triggering AI narrative generation
  lore: initialLoreState // Add missing lore state
};
