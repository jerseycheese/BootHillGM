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
 * Types of errors that can occur in narrative operations
 */
export type NarrativeErrorType =
  | 'invalid_navigation'       // Invalid story point 
  | 'invalid_choice'           // Invalid choice selection
  | 'arc_not_found'            // Narrative arc not found
  | 'branch_not_found'         // Narrative branch not found
  | 'decision_not_found'       // Player decision not found
  | 'decision_mismatch'        // Decision ID mismatch
  | 'validation_failed'        // General validation failure
  | 'state_corruption'         // Corrupted state
  | 'system_error';            // System-level error

/**
 * Error information for narrative operations
 */
export interface NarrativeErrorInfo {
  code: NarrativeErrorType;
  message: string;
  context?: Record<string, unknown>;  // Changed from 'any' to 'unknown'
  timestamp: number;
}

/**
 * Defines the current narrative state within the game
 * 
 * @property currentStoryPoint - Current active story point
 * @property visitedPoints - Array of previously visited story point IDs
 * @property availableChoices - Currently available narrative choices
 * @property narrativeHistory - Complete narrative text history
 * @property displayMode - How the narrative should be presented
 * @property narrativeContext - Additional context for AI generation
 * @property storyProgression - Story progression tracking state
 * @property error - Current error state, if any
 */
export interface NarrativeState {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  narrativeContext?: NarrativeContext;
  selectedChoice?: string;
  storyProgression?: StoryProgressionState;
  currentDecision?: PlayerDecision;
  error?: NarrativeErrorInfo | null;
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
  isCompleted?: boolean;
}

/**
 * Defines a complete narrative arc made up of multiple branches, potentially spanning multiple locations
 * 
 * @property id - Unique identifier for this arc
 * @property title - Title of the narrative arc
 * @property description - Short description
 * @property branches - Array of branches in this arc or references to branch IDs
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
 * Defines the importance level of a player decision
 */
export type DecisionImportance =
  | 'critical'    // Major story-affecting decision
  | 'significant' // Important but not story-changing decision
  | 'moderate'    // Medium-impact decision
  | 'minor';      // Small or flavor decision

/**
 * Defines a single option in a player decision
 */
export interface PlayerDecisionOption {
  id: string;
  text: string;
  impact: string;
  tags?: string[];
}

/**
 * Defines a decision point presented to the player
 * 
 * @property id - Unique identifier for the decision
 * @property prompt - Text prompt describing the decision
 * @property timestamp - When the decision was presented
 * @property location - Where the decision took place
 * @property options - Available options for this decision
 * @property context - The narrative context when this decision was presented
 * @property importance - How significant this decision is
 * @property characters - Characters involved in this decision
 * @property aiGenerated - Whether this was generated by AI or predefined
 */
export interface PlayerDecision {
  id: string;
  prompt: string;
  timestamp: number;
  location?: LocationType;
  options: PlayerDecisionOption[];
  context: string;
  importance: DecisionImportance;
  characters?: string[];
  aiGenerated: boolean;
}

/**
 * Defines a record of a player's decision
 * 
 * @property decisionId - Reference to the original decision
 * @property selectedOptionId - ID of the option that was chosen
 * @property timestamp - When the decision was made
 * @property narrative - The narrative response after the decision
 * @property impactDescription - Description of the impact
 * @property tags - Tags for categorization and filtering
 * @property relevanceScore - Dynamically calculated score (0-10)
 * @property expirationTimestamp - Optional timestamp when this decision becomes less relevant
 */
export interface PlayerDecisionRecord {
  decisionId: string;
  selectedOptionId: string;
  timestamp: number;
  narrative: string;
  impactDescription: string;
  tags: string[];
  relevanceScore: number;
  expirationTimestamp?: number;
}
/**
 * Defines the type of impact a decision has on the game world
 */
export type DecisionImpactType =
  | 'reputation'    // Impact on character's reputation
  | 'relationship'  // Impact on relationship with NPCs
  | 'story-arc'     // Impact on story progression
  | 'world-state'   // Impact on the game world state
  | 'character'     // Impact on character development
  | 'inventory';    // Impact on items/resources

/**
 * Defines the severity of a decision impact
 */
export type ImpactSeverity =
  | 'major'     // Significant, long-lasting impact
  | 'moderate'  // Medium-level impact
  | 'minor';    // Small, possibly temporary impact

/**
 * Defines a single impact of a player decision
 */
export interface DecisionImpact {
  id: string;
  type: DecisionImpactType;
  target: string;           // Entity affected (character name, location, etc.)
  severity: ImpactSeverity;
  description: string;      // Human-readable description
  value: number;            // Numeric value/magnitude (-10 to +10)
  duration?: number;        // Duration in milliseconds, undefined = permanent
  conditions?: string[];    // Conditions that might modify this impact
  relatedDecisionIds?: string[]; // IDs of related decisions
}

/**
 * Extended PlayerDecisionRecord with impact metadata
 */
export interface PlayerDecisionRecordWithImpact extends PlayerDecisionRecord {
  impacts: DecisionImpact[];
  processedForImpact: boolean; // Flag to track if impact processing has occurred
  lastImpactUpdate: number;    // Timestamp of last impact update
}

/**
 * Represents the accumulated state of decision impacts
 */
export type WorldStateImpactValue = number;

export interface ImpactState {
  reputationImpacts: Record<string, number>; // Character -> reputation value
  relationshipImpacts: Record<string, Record<string, number>>; // Character -> Target -> value
  worldStateImpacts: Record<string, WorldStateImpactValue>; // Key -> value for world state changes
  storyArcImpacts: Record<string, number>; // Story arc ID -> progression value
  lastUpdated: number; // Timestamp of last update
}

export interface NarrativeContext {
  tone?: 'serious' | 'lighthearted' | 'tense' | 'mysterious';
  characterFocus: string[];
  themes: string[];
  worldContext: string;
  importantEvents: string[];
  storyPoints: Record<string, StoryPoint>;
  narrativeArcs: Record<string, NarrativeArc>;
  impactState: ImpactState;
  narrativeBranches: Record<string, NarrativeBranch>;
  currentArcId?: string;
  currentBranchId?: string;

  // New properties for decision tracking
  activeDecision?: PlayerDecision;
  pendingDecisions: PlayerDecision[];
  decisionHistory: PlayerDecisionRecord[]; // Replaces playerChoices
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
  | 'RESET_NARRATIVE'
  | 'PRESENT_DECISION'         
  | 'RECORD_DECISION'          
  | 'CLEAR_CURRENT_DECISION'
  | 'PROCESS_DECISION_IMPACTS'
  | 'UPDATE_IMPACT_STATE'
  | 'EVOLVE_IMPACTS'
  | 'NARRATIVE_ERROR'          // New action for error handling
  | 'CLEAR_ERROR';             // New action for clearing errors

/**
 * Defines the narrative action for the reducer
 */
export type NarrativeAction =
  // Existing actions...
  | { type: 'NAVIGATE_TO_POINT'; payload: string }
  | { type: 'SELECT_CHOICE'; payload: string }
  | { type: 'ADD_NARRATIVE_HISTORY'; payload: string }
  | { type: 'SET_DISPLAY_MODE'; payload: NarrativeDisplayMode }
  | { type: 'START_NARRATIVE_ARC'; payload: string }
  | { type: 'COMPLETE_NARRATIVE_ARC'; payload: string }
  | { type: 'ACTIVATE_BRANCH'; payload: string }
  | { type: 'COMPLETE_BRANCH'; payload: string }
  | { type: 'UPDATE_NARRATIVE'; payload: Partial<NarrativeState> }
  | { type: 'UPDATE_NARRATIVE_CONTEXT'; payload: Partial<NarrativeContext> }
  | { type: 'RESET_NARRATIVE' }

  // Decision tracking actions
  | { type: 'PRESENT_DECISION'; payload: PlayerDecision }
  | { type: 'RECORD_DECISION'; payload: { decisionId: string; selectedOptionId: string; narrative: string } }
  | { type: 'CLEAR_CURRENT_DECISION' }
  | { type: 'PROCESS_DECISION_IMPACTS'; payload: string } // decisionId
  | { type: 'UPDATE_IMPACT_STATE'; payload: Partial<ImpactState> }
  | { type: 'EVOLVE_IMPACTS' }
  
  // Error handling actions
  | { type: 'NARRATIVE_ERROR'; payload: NarrativeErrorInfo }
  | { type: 'CLEAR_ERROR' };

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
 * Represents the significance level of a story point in the narrative
 */
export type StorySignificance =
  | 'major'         // A critical point in the main storyline
  | 'minor'         // A less significant but still noteworthy story point
  | 'background'    // Background information or world-building
  | 'character'     // Character development moment
  | 'milestone';    // Achievement or significant accomplishment

/**
 * Represents a point in the story progression that has been recognized and tracked
 *
 * @property id - Unique identifier for the story progression point
 * @property title - Brief title describing the story point
 * @property description - Detailed description of the story point
 * @property significance - How significant this point is to the overall narrative
 * @property characters - Characters involved in this story point
 * @property timestamp - When this story point occurred
 * @property location - Where this story point took place
 * @property aiGenerated - Whether this was generated by AI or predefined
 * @property relatedItems - Items relevant to this story point
 * @property tags - Custom tags for categorization
 * @property previousPoint - Optional ID of the story point that preceded this one
 */
export interface StoryProgressionPoint {
  id: string;
  title: string;
  description: string;
  significance: StorySignificance;
  characters: string[];
  timestamp: number;
  location?: LocationType;
  aiGenerated: boolean;
  relatedItems?: string[];
  tags?: string[];
  previousPoint?: string;
}

/**
 * Represents the state of story progression in the game
 *
 * @property currentPoint - The current active story point
 * @property progressionPoints - Record of all story points by ID
 * @property mainStorylinePoints - Ordered array of story point IDs representing the main storyline
 * @property branchingPoints - Record of branching story points and their conditions
 * @property lastUpdated - Timestamp of when the progression was last updated
 */
export interface StoryProgressionState {
  currentPoint: string | null;
  progressionPoints: Record<string, StoryProgressionPoint>;
  mainStorylinePoints: string[];
  branchingPoints: Record<string, {
    pointId: string;
    condition: string;
    taken: boolean;
  }>;
  lastUpdated: number;
}

/**
 * Extension to AI response to include story progression information
 */
export interface StoryProgressionData {
  currentPoint?: string;
  title?: string;
  description?: string;
  significance?: StorySignificance;
  characters?: string[];
  isMilestone?: boolean;
}

/**
 * Defines story progression actions for the reducer
 */
export type StoryProgressionActionType =
  | 'ADD_STORY_POINT'
  | 'UPDATE_CURRENT_POINT'
  | 'MARK_BRANCHING_POINT_TAKEN'
  | 'RESET_STORY_PROGRESSION';

/**
 * Defines the story progression actions for the reducer
 */
export type StoryProgressionAction =
  | { type: 'ADD_STORY_POINT'; payload: StoryProgressionPoint }
  | { type: 'UPDATE_CURRENT_POINT'; payload: string }
  | { type: 'MARK_BRANCHING_POINT_TAKEN'; payload: string }
  | { type: 'RESET_STORY_PROGRESSION' };

/**
 * Defines a hook for processing narrative segments
 */
export interface UseNarrativeProcessorResult {
  processedSegments: NarrativeSegment[];
  addPlayerAction: (action: string) => void;
  addGMResponse: (response: string, location?: LocationType) => void;
  addNarrativeSegment: (segment: NarrativeSegment) => void;
  clearSegments: () => void;
  processNarrative: (narrative: string, location?: LocationType) => void;
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
  displayMode: 'standard',
  error: null
};

/**
 * Initialize empty story progression state
 */
export const initialStoryProgressionState: StoryProgressionState = {
  currentPoint: null,
  progressionPoints: {},
  mainStorylinePoints: [],
  branchingPoints: {},
  lastUpdated: Date.now()
};
