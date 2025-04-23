/**
 * Narrative Types System - Central Export Point
 * 
 * This file centralizes all narrative type exports to prevent circular dependencies.
 */

// Re-export all type definitions using 'export type' for compatibility with isolatedModules
export type { 
  // From choice.types.ts
  NarrativeChoice, 
  NarrativeDisplayMode 
} from './choice.types';

export type { 
  // From story-point.types.ts
  StoryPoint, 
  StoryPointType, 
  StorySignificance 
} from './story-point.types';

export type { 
  // From error.types.ts
  NarrativeErrorInfo, 
  NarrativeErrorType 
} from './error.types';

export type { 
  // From context.types.ts
  NarrativeContext, 
  ImpactState,
  WorldStateImpactValue
} from './context.types';

export type { 
  // From segment.types.ts
  NarrativeSegment 
} from './segment.types';

export type { 
  // From decision.types.ts
  PlayerDecision, 
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact,
  DecisionImportance,
  PlayerDecisionOption
} from './decision.types';

export type { 
  // From progression.types.ts
  StoryProgressionState, 
  StoryProgressionPoint,
  StoryProgressionData,
  StoryPointSignificance
} from './progression.types';

export type { 
  // From arc.types.ts
  NarrativeBranch, 
  NarrativeArc,
  DecisionImpact,
  DecisionImpactType,
  ImpactSeverity
} from './arc.types';

export type {
  // From actions.types.ts
  NarrativeAction,
  StoryProgressionAction
} from './actions.types';

export type { 
  // From hooks.types.ts
  UseNarrativeChoiceResult,
  UseNarrativeProcessorResult
} from './hooks.types';

// Re-export utility functions and values (non-types) using regular export
export {
  isStoryPoint,
  isNarrativeChoice,
  initialNarrativeState,
  initialStoryProgressionState
} from './utils';