/**
 * Contextual Decision Types
 * 
 * Type definitions for the contextual decision service and related components.
 */

import { GameState } from '../../types/gameState';
import { 
  DecisionImportance
} from '../../types/narrative.types';

/**
 * Decision service configuration
 */
export interface ContextualDecisionServiceConfig {
  // Minimum time between automatic decisions (ms)
  minDecisionInterval: number;
  
  // Threshold score to present a decision (0-1)
  relevanceThreshold: number;
  
  // Maximum number of options per decision
  maxOptionsPerDecision: number;
  
  // Whether to use the feedback system for prompt enhancement
  useFeedbackSystem: boolean;
}

/**
 * Result from the decision point detection process
 */
export interface DecisionDetectionResult {
  /** Should a decision be presented? */
  shouldPresent: boolean;
  
  /** Detection score (0-1) */
  score: number;
  
  /** Reason for the detection result */
  reason: string;
}

/**
 * Extended GameState with predicted properties we use for decision scoring
 * This interface represents the expected game state structure used by the decision service
 */
export interface ExtendedGameState extends GameState {
  combat?: {
    active: boolean;
  };
  activeEvent?: boolean;
}

/**
 * Decision history entry for context tracking
 */
export interface DecisionHistoryEntry {
  prompt: string;
  choice: string;
  outcome: string;
  timestamp: number;
}

/**
 * Raw decision structure returned from AI
 */
export interface RawDecisionResponse {
  prompt?: string;
  options?: Array<{
    text?: string;
    impact?: string;
    tags?: string[];
  }>;
  importance?: DecisionImportance;
  context?: string;
}

// Constants for decision service
export const DEFAULT_DECISION_THRESHOLD = 0.65;
export const MIN_DECISION_INTERVAL = 30 * 1000; // 30 seconds minimum between decisions