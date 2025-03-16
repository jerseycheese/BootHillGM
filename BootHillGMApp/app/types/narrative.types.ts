/**
 * Narrative Types System - Core Types
 * 
 * This file defines the essential type interfaces for the narrative management in BootHillGM.
 * More specialized types are imported from their respective modules.
 */

// Import all types directly from individual files to prevent circular references
import { NarrativeChoice, NarrativeDisplayMode } from './narrative/choice.types';
import { StoryPoint, StoryPointType, StorySignificance } from './narrative/story-point.types';
import { NarrativeErrorInfo, NarrativeErrorType } from './narrative/error.types';
import { NarrativeContext, ImpactState, WorldStateImpactValue } from './narrative/context.types';
import { NarrativeSegment } from './narrative/segment.types';
import { 
  PlayerDecision, 
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact,
  DecisionImportance,
  PlayerDecisionOption
} from './narrative/decision.types';
import { 
  StoryProgressionState, 
  StoryProgressionPoint,
  StoryProgressionData
} from './narrative/progression.types';
import { 
  NarrativeBranch, 
  NarrativeArc,
  DecisionImpact,
  DecisionImpactType,
  ImpactSeverity
} from './narrative/arc.types';
import {
  NarrativeActionType,
  NarrativeAction,
  StoryProgressionActionType,
  StoryProgressionAction
} from './narrative/actions.types';
import {
  UseNarrativeChoiceResult,
  UseNarrativeProcessorResult,
} from './narrative/hooks.types';
import { 
  isStoryPoint, 
  isNarrativeChoice,
  initialNarrativeState,
  initialStoryProgressionState
} from './narrative/utils';

// Re-export all types for backward compatibility - using 'export type' syntax
// for type-only exports as required by isolatedModules
export type { NarrativeChoice };
export type { StoryPoint };
export type { StoryPointType };
export type { StorySignificance };
export type { NarrativeDisplayMode };
export type { NarrativeErrorType };
export type { NarrativeErrorInfo };
export type { NarrativeSegment };
export type { ImpactState };
export type { NarrativeContext };
export type { PlayerDecision };
export type { PlayerDecisionRecord };
export type { PlayerDecisionRecordWithImpact };
export type { DecisionImportance };
export type { PlayerDecisionOption };
export type { StoryProgressionState };
export type { StoryProgressionPoint };
export type { StoryProgressionData };
export type { NarrativeBranch };
export type { NarrativeArc };
export type { DecisionImpact };
export type { DecisionImpactType };
export type { ImpactSeverity };
export type { WorldStateImpactValue };
export type { NarrativeActionType };
export type { NarrativeAction };
export type { StoryProgressionActionType };
export type { StoryProgressionAction };
export type { UseNarrativeChoiceResult };
export type { UseNarrativeProcessorResult };

// Export values (non-types)
export { 
  isStoryPoint,
  isNarrativeChoice,
  initialNarrativeState,
  initialStoryProgressionState
};

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
 * Defines utility type for narrative state updates
 */
export type NarrativeStateUpdate = Partial<NarrativeState>;