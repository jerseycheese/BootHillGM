/**
 * AI Decision Types
 * 
 * Type definitions for the AI decision system
 */

import { AIServiceConfig } from '../../../types/ai-service.types';
import { GameState } from '../../../types/gameState';

/**
 * Configuration for the AI decision service
 */
export interface AIDecisionServiceConfig {
  minDecisionInterval: number;
  relevanceThreshold: number;
  maxOptionsPerDecision: number;
  apiConfig: AIServiceConfig;
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
 * Decision history entry for tracking past decisions
 */
export interface DecisionHistoryEntry {
  prompt: string;
  choice: string;
  outcome: string;
  timestamp: number;
}

/**
 * API Response data for error tracking
 */
export interface ApiRateLimitData {
  remaining: number;
  resetTime: number;
}

/**
 * Represents a raw API response before processing
 */
export type RawApiResponse = Record<string, unknown>;
