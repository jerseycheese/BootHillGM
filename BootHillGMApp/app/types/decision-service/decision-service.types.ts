/**
 * Types for the AI Decision Service
 */

import { AIServiceConfig, DecisionPrompt, DecisionResponse, DecisionDetectionResult } from '../ai-service.types';
import { NarrativeState } from '../narrative.types';
import { Character } from '../character';

/**
 * Configuration for the decision service
 */
export interface DecisionServiceConfig {
  minDecisionInterval: number;
  relevanceThreshold: number;
  maxOptionsPerDecision: number;
  apiConfig: AIServiceConfig;
}

/**
 * Decision history entry
 */
export interface DecisionHistoryEntry {
  prompt: string;
  choice: string;
  outcome: string;
  timestamp: number;
}

/**
 * Base interface for decision-making components
 */
export interface DecisionDetector {
  detectDecisionPoint(narrativeState: NarrativeState, character: Character): DecisionDetectionResult;
}

/**
 * Interface for decision generators
 */
export interface DecisionGenerator {
  generateDecision(narrativeState: NarrativeState, character: Character): Promise<DecisionResponse>;
}

/**
 * Interface for decision history managers
 */
export interface DecisionHistoryManager {
  getDecisionHistory(): DecisionHistoryEntry[];
  recordDecision(decisionId: string, optionId: string, outcome: string): void;
}

/**
 * Interface for AI service clients
 */
export interface AIClient {
  makeRequest<T>(prompt: DecisionPrompt): Promise<T>;
  getRateLimitRemaining(): number;
  getRateLimitResetTime(): number;
}
