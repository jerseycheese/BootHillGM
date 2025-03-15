/**
 * Type definitions for browser extensions specific to Boot Hill GM
 */

import { PlayerDecision } from './narrative.types';
import { DecisionGenerationMode } from '../utils/enhancedDecisionGenerator';
import { GameState } from './gameState';
import { LocationType } from '../services/locationService';

/**
 * Boot Hill GM Debug tools interface
 */
interface BHGMDebug {
  /** The current game state getter function */
  getGameState?: () => GameState;
  
  /** Function to trigger a contextual decision */
  triggerDecision?: (locationType?: LocationType) => void;
  
  /** Function to clear the current decision */
  clearDecision?: () => void;
  
  /** Function to list available locations */
  listLocations?: () => string[];
  
  /** Function to process raw decision data */
  processRawDecision?: () => PlayerDecision | null;
  
  /** Current active decision for inspection */
  currentDecision?: PlayerDecision | null;
  
  /** Cached AI-generated decision waiting for next retrieval */
  cachedDecision?: PlayerDecision | null;
  
  /** Pending AI decision from async generation */
  pendingAIDecision?: PlayerDecision | null;
  
  /** Promise for a pending decision */
  pendingDecisionPromise?: Promise<PlayerDecision | null>;
  
  /** Version information */
  version?: string;
  
  /** Decision generator utilities */
  decisionGenerators?: {
    /** Get the current decision generation mode */
    getMode: () => DecisionGenerationMode;
    
    /** Set the decision generation mode */
    setMode: (mode: DecisionGenerationMode) => void;
    
    /** Generate an enhanced decision */
    generateDecision: (
      gameState: GameState,
      locationType?: LocationType,
      forceGeneration?: boolean
    ) => Promise<PlayerDecision | null>;
  };
}

/**
 * Extend the Window interface to include Boot Hill GM debug tools
 */
declare global {
  interface Window {
    /** Boot Hill GM Debug namespace */
    bhgmDebug?: BHGMDebug;
    
    /** Reference to the original generateContextualDecision function */
    generateContextualDecision?: typeof import('../utils/contextualDecisionGenerator').generateContextualDecision;
  }
}

export {};