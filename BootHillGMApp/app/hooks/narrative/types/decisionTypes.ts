/**
 * Types related to decision triggering and generation
 */
import { MutableRefObject } from 'react';
import { DecisionImportance, PlayerDecision } from '../../../types/narrative.types';
import { NarrativeState } from '../../../types/narrative.types';

/**
 * Context extracted from narrative for decision generation
 */
export interface DecisionContext {
  playerName: string;
  recentText: string;
  timestamp: number;
}

/**
 * Props for useDecisionGeneration hook
 */
export interface DecisionGenerationProps {
  narrativeState: NarrativeState;
  playerNameRef: MutableRefObject<string | null>;
}

/**
 * Return type for useDecisionGeneration hook
 */
export interface DecisionGenerationReturn {
  extractDecisionContext: (recentHistory: string[]) => DecisionContext;
  generateContextualDecision: () => PlayerDecision;
  generateEnhancedDecision: (context?: string, importance?: DecisionImportance) => Promise<PlayerDecision | null>;
  verifyDecisionContext: (decision: PlayerDecision) => boolean;
}
