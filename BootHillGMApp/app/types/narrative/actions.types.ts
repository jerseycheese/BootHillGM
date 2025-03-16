/**
 * Narrative Action Types
 * 
 * This file defines types related to actions for state management.
 */

import { NarrativeChoice, NarrativeDisplayMode } from './choice.types';
import { NarrativeErrorInfo } from './error.types';
import { NarrativeContext, ImpactState } from './context.types';
import { StoryProgressionPoint } from './progression.types';
import { PlayerDecision } from './decision.types';
import { StoryPoint } from './story-point.types';

/**
 * Internal interface for NarrativeState to avoid circular dependencies
 * This is only used within the actions file and matches the interface in narrative.types.ts
 */
interface NarrativeStateInternal {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  narrativeContext?: NarrativeContext;
  selectedChoice?: string;
  currentDecision?: PlayerDecision;
  error?: NarrativeErrorInfo | null;
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
  // Navigation and choice actions
  | { type: 'NAVIGATE_TO_POINT'; payload: string }
  | { type: 'SELECT_CHOICE'; payload: string }
  | { type: 'ADD_NARRATIVE_HISTORY'; payload: string }
  | { type: 'SET_DISPLAY_MODE'; payload: NarrativeDisplayMode }
  
  // Arc and branch management
  | { type: 'START_NARRATIVE_ARC'; payload: string }
  | { type: 'COMPLETE_NARRATIVE_ARC'; payload: string }
  | { type: 'ACTIVATE_BRANCH'; payload: string }
  | { type: 'COMPLETE_BRANCH'; payload: string }
  
  // General state updates
  | { type: 'UPDATE_NARRATIVE'; payload: Partial<NarrativeStateInternal> }
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