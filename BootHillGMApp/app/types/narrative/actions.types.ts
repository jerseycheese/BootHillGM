/**
 * Narrative Action Types
 * 
 * This file defines types related to actions for state management.
 */

import { NarrativeChoice, NarrativeDisplayMode } from './choice.types';
import { NarrativeErrorInfo } from './error.types';
import { NarrativeContext, ImpactState } from './context.types';
import { StoryProgressionPoint } from './progression.types';
import { PlayerDecision, PlayerDecisionRecord } from './decision.types';
import { StoryPoint } from './story-point.types';
import { DecisionImpact } from './arc.types';
import { LoreAction } from './lore.types';
import { ActionTypes } from '../actionTypes';

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

// For updates to the narrative state
type NarrativeStateUpdate = Partial<NarrativeStateInternal>;

/**
 * Defines the narrative action for the reducer using ActionTypes
 */
export type NarrativeAction =
  // Navigation and choice actions
  | { type: typeof ActionTypes.NAVIGATE_TO_POINT; payload: string }
  | { type: typeof ActionTypes.SELECT_CHOICE; payload: string }
  | { type: typeof ActionTypes.ADD_NARRATIVE_HISTORY; payload: string }
  | { type: typeof ActionTypes.SET_DISPLAY_MODE; payload: NarrativeDisplayMode }
  
  // Arc and branch management
  | { type: typeof ActionTypes.START_NARRATIVE_ARC; payload: string }
  | { type: typeof ActionTypes.COMPLETE_NARRATIVE_ARC; payload: string }
  | { type: typeof ActionTypes.ACTIVATE_BRANCH; payload: string }
  | { type: typeof ActionTypes.COMPLETE_BRANCH; payload: string }
  
  // General state updates
  | { type: typeof ActionTypes.UPDATE_NARRATIVE; payload: NarrativeStateUpdate }
  | { type: typeof ActionTypes.SET_NARRATIVE_CONTEXT; payload: Partial<NarrativeContext> }
  | { type: typeof ActionTypes.RESET_NARRATIVE }

  // Decision tracking actions
  | { type: typeof ActionTypes.PRESENT_DECISION; payload: PlayerDecision }
  | { type: typeof ActionTypes.RECORD_DECISION; payload: PlayerDecisionRecord }
  | { type: typeof ActionTypes.CLEAR_CURRENT_DECISION }
  | { type: typeof ActionTypes.PROCESS_DECISION_IMPACTS; payload: DecisionImpact[] }
  | { type: typeof ActionTypes.UPDATE_IMPACT_STATE; payload: Partial<ImpactState> }
  | { type: typeof ActionTypes.EVOLVE_IMPACTS }
  
  // Error handling actions
  | { type: typeof ActionTypes.NARRATIVE_ERROR; payload: NarrativeErrorInfo }
  | { type: typeof ActionTypes.CLEAR_ERROR }
  
  // Include lore actions
  | LoreAction;

/**
 * Defines the story progression actions for the reducer using ActionTypes
 */
export type StoryProgressionAction =
  | { type: typeof ActionTypes.ADD_STORY_POINT; payload: StoryProgressionPoint }
  | { type: typeof ActionTypes.UPDATE_CURRENT_POINT; payload: string }
  | { type: typeof ActionTypes.MARK_BRANCHING_POINT_TAKEN; payload: string }
  | { type: typeof ActionTypes.RESET_STORY_PROGRESSION };