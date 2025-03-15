/**
 * AI Service Types
 * 
 * Type definitions for the AI service integration, specifically for
 * the contextual decision system that presents narrative choices
 * at appropriate moments based on game state.
 */

import { LocationType } from '../services/locationService';
import { DecisionImportance, PlayerDecisionOption } from './narrative.types';

/**
 * Configuration for the AI service
 */
export interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  modelName: string;
  maxRetries: number;
  timeout: number;
  rateLimit: number;
}

/**
 * Structure of a decision prompt sent to the AI service
 */
export interface DecisionPrompt {
  /**
   * Recent narrative context (typically the last few paragraphs)
   */
  narrativeContext: string;
  
  /**
   * Information about the player character
   */
  characterInfo: {
    /** Character traits */
    traits: string[];
    /** Character background */
    history: string;
    /** Key relationships with NPCs */
    relationships: Record<string, string>;
  };
  
  /**
   * Current game state
   */
  gameState: {
    /** Current location */
    location: LocationType | string;
    /** Current scene identifier */
    currentScene: string;
    /** Recent events the player has experienced */
    recentEvents: string[];
  };
  
  /**
   * Previous decisions for context
   */
  previousDecisions: Array<{
    /** The decision prompt text */
    prompt: string;
    /** The option the player selected */
    choice: string;
    /** What happened as a result */
    outcome: string;
  }>;
}

/**
 * A single decision option returned by the AI service
 */
export interface DecisionOption extends PlayerDecisionOption {
  /** Unique identifier for this option */
  id: string;
  
  /** The text to display to the player */
  text: string;
  
  /** AI's confidence in this option (0-1) */
  confidence: number;
  
  /** Character traits this option aligns with */
  traits: string[];
  
  /** Potential narrative directions */
  potentialOutcomes: string[];
  
  /** Brief description of the impact this choice might have */
  impact: string;
}

/**
 * Complete decision response from the AI service
 */
export interface DecisionResponse {
  /** Unique identifier for this decision */
  decisionId: string;
  
  /** The decision prompt to show the player */
  prompt: string;
  
  /** Available options for the player to choose from */
  options: DecisionOption[];
  
  /** How relevant this decision is to the current narrative (0-1) */
  relevanceScore: number;
  
  /** Additional metadata about the decision */
  metadata: {
    /** Description of how this decision impacts the narrative */
    narrativeImpact: string;
    
    /** How well this decision aligns with the western theme */
    themeAlignment: string;
    
    /** Current narrative pacing */
    pacing: 'slow' | 'medium' | 'fast';
    
    /** The importance of this decision */
    importance: DecisionImportance;
  };
}

/**
 * Standardized AI service error
 */
export interface AIServiceError {
  /** Error code */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Whether this error can be retried */
  retryable: boolean;
}

/**
 * Result of the decision point detection process
 */
export interface DecisionDetectionResult {
  /** Should a decision be presented? */
  shouldPresent: boolean;
  
  /** Detection score (0-1) */
  score: number;
  
  /** Reason for the detection result */
  reason: string;
}
