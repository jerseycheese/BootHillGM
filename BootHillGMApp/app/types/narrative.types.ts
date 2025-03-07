/**
 * Narrative Types System
 * 
 * This file defines the type system for the narrative management in BootHillGM.
 * It includes interfaces for StoryPoint, NarrativeState, and other narrative-related elements.
 */

import { Character } from './character';
import { JournalEntry } from './journal';
import { LocationType } from '../services/locationService';

/**
 * Defines a narrative choice option that can be presented to the player
 * 
 * @property id - Unique identifier for the choice
 * @property text - Display text for the choice
 * @property consequence - Optional description of the consequence
 * @property requiresItem - Optional item requirement to enable this choice
 * @property requiresAttribute - Optional character attribute requirement
 * @property leadsTo - ID of the StoryPoint this choice leads to
 */
export interface NarrativeChoice {
  id: string;
  text: string;
  consequence?: string;
  requiresItem?: string;
  requiresAttribute?: {
    attribute: keyof Character['attributes'];
    minValue: number;
  };
  leadsTo: string;
}

/**
 * Represents the type of a story point
 */
export type StoryPointType = 
  | 'exposition'     // Background information and scene-setting
  | 'decision'       // Player needs to make a choice
  | 'action'         // Requires player to take an action
  | 'revelation'     // Key information is revealed
  | 'transition'     // Moving between scenes/areas
  | 'combat-intro'   // Leads into combat
  | 'resolution';    // Concludes a narrative arc

/**
 * Defines a single point in the narrative structure
 * 
 * @property id - Unique identifier for this story point
 * @property type - The type of story point
 * @property title - Short descriptive title
 * @property content - The narrative text content
 * @property choices - Available choices (if type is 'decision')
 * @property aiPrompt - Optional prompt for AI narrative generation
 * @property locationChange - Optional location to transition to
 * @property itemsGranted - Optional items given at this point
 * @property itemsRemoved - Optional items taken at this point
 * @property journalEntry - Optional journal entry to add
 * @property tags - Optional tags for categorization and filtering
 */
export interface StoryPoint {
  id: string;
  type: StoryPointType;
  title: string;
  content: string;
  choices?: NarrativeChoice[];
  aiPrompt?: string;
  locationChange?: LocationType;
  itemsGranted?: string[];
  itemsRemoved?: string[];
  journalEntry?: Omit<JournalEntry, 'timestamp'>;
  tags?: string[];
}

/**
 * Defines how narrative should be presented
 */
export type NarrativeDisplayMode = 
  | 'standard'       // Normal narrative display
  | 'flashback'      // Presented as a memory or past event
  | 'dream'          // Presented as a dream sequence
  | 'letter'         // Presented as written correspondence
  | 'journal'        // Presented as a journal entry
  | 'dialogue';      // Focus on character dialogue

/**
 * Defines the current narrative state within the game
 * 
 * @property currentStoryPoint - Current active story point
 * @property visitedPoints - Array of previously visited story point IDs
 * @property availableChoices - Currently available narrative choices
 * @property narrativeHistory - Complete narrative text history
 * @property displayMode - How the narrative should be presented
 * @property narrativeContext - Additional context for AI generation
 */
export interface NarrativeState {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  narrativeContext?: NarrativeContext;
}

/**
 * Defines a narrative segment that can be processed and displayed
 */
export interface NarrativeSegment {
  type: 'player-action' | 'gm-response' | 'narrative' | 'item-update';
  content: string;
  metadata?: {
    items?: string[];
    updateType?: 'acquired' | 'used';
    timestamp?: number;
    isEmpty?: boolean;
  };
}

/**
 * Defines a narrative branch that can be taken based on player choices
 * 
 * @property id - Unique identifier for this branch
 * @property startPoint - Starting StoryPoint ID
 * @property endPoints - Possible ending StoryPoint IDs
 * @property requirements - Optional requirements to access this branch
 * @property isActive - Whether this branch is currently active
 */
export interface NarrativeBranch {
  id: string;
  title: string;
  startPoint: string;
  endPoints: string[];
  requirements?: {
    items?: string[];
    attributes?: Array<{
      attribute: keyof Character['attributes'];
      minValue: number;
    }>;
    visitedPoints?: string[];
  };
  isActive: boolean;
}

/**
 * Defines a complete narrative arc made up of multiple branches
 * 
 * @property id - Unique identifier for this arc
 * @property title - Title of the narrative arc
 * @property description - Short description
 * @property branches - Array of branches in this arc
 * @property startingBranch - ID of the first branch
 * @property isCompleted - Whether this arc has been completed
 */
export interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  branches: NarrativeBranch[];
  startingBranch: string;
  isCompleted: boolean;
}

/**
 * Defines context for AI-driven narrative generation
 */
export interface NarrativeContext {
  tone: 'serious' | 'lighthearted' | 'tense' | 'mysterious';
  characterFocus: string[];
  themes: string[];
  worldContext: string;
  importantEvents: string[];
  playerChoices: Array<{
    choice: string;
    consequence: string;
    timestamp: number;
  }>;
}

/**
 * Defines a narrative action type for state management
 */
export type NarrativeActionType =
  | 'NAVIGATE_TO_POINT'
  | 'SELECT_CHOICE'
  | 'ADD_NARRATIVE_HISTORY'
  | 'SET_DISPLAY_MODE'
  | 'START_NARRATIVE_ARC'
  | 'COMPLETE_NARRATIVE_ARC'
  | 'ACTIVATE_BRANCH'
  | 'COMPLETE_BRANCH'
  | 'UPDATE_NARRATIVE_CONTEXT'
  | 'RESET_NARRATIVE';

/**
 * Defines the narrative action for the reducer
 */
export type NarrativeAction =
  | { type: 'NAVIGATE_TO_POINT'; payload: string }
  | { type: 'SELECT_CHOICE'; payload: string }
  | { type: 'ADD_NARRATIVE_HISTORY'; payload: string }
  | { type: 'SET_DISPLAY_MODE'; payload: NarrativeDisplayMode }
  | { type: 'START_NARRATIVE_ARC'; payload: string }
  | { type: 'COMPLETE_NARRATIVE_ARC'; payload: string }
  | { type: 'ACTIVATE_BRANCH'; payload: string }
  | { type: 'COMPLETE_BRANCH'; payload: string }
  | { type: 'UPDATE_NARRATIVE_CONTEXT'; payload: Partial<NarrativeContext> }
  | { type: 'RESET_NARRATIVE' };

/**
 * Defines utility type for narrative state updates
 */
export type NarrativeStateUpdate = Partial<NarrativeState>;

/**
 * Defines a hook for handling player choices
 */
export interface UseNarrativeChoiceResult {
  availableChoices: NarrativeChoice[];
  selectChoice: (choiceId: string) => void;
  canSelectChoice: (choiceId: string) => boolean;
}

/**
 * Defines a hook for processing narrative segments
 */
export interface UseNarrativeProcessorResult {
  processedSegments: NarrativeSegment[];
  addPlayerAction: (action: string) => void;
  addGMResponse: (response: string) => void;
  addNarrativeSegment: (segment: NarrativeSegment) => void;
  clearSegments: () => void;
}

/**
 * Type guard to check if an object is a valid StoryPoint
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
 */
export const initialNarrativeState: NarrativeState = {
  currentStoryPoint: null,
  visitedPoints: [],
  availableChoices: [],
  narrativeHistory: [],
  displayMode: 'standard'
};