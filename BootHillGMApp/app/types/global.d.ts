/**
 * Global type definitions for Boot Hill GM App
 * 
 * This file contains TypeScript declarations for extending global objects
 * like Window with application-specific properties.
 */

import { LocationType } from '../services/locationService';
import { PlayerDecision, NarrativeContext } from './narrative.types';
import { GameState } from './gameState';
import { DecisionGenerationMode } from '../utils/contextualDecisionGenerator.enhanced';
import { ContextualDecisionService } from '../services/ai/contextualDecisionService';

/**
 * Debug command data interface
 */
export interface DebugCommandData {
  locationType?: LocationType;
  [key: string]: unknown;
}

/**
 * Decision quality evaluation result
 */
export interface DecisionQualityResult {
  score: number;
  suggestions: string[];
  acceptable: boolean;
}

/**
 * Core BHGM debug interface
 */
export interface BHGMDebug {
  version: string;
  triggerDecision: (locationType?: LocationType) => void;
  clearDecision: () => void;
  listLocations: () => unknown[];
  getGameState?: () => GameState;
  currentDecision?: PlayerDecision | null;
  sendCommand: (commandType: string, data?: unknown) => void;
  
  // AI Decision extensions
  triggerAIDecision?: (locationType?: LocationType) => Promise<void>;
  checkAIStatus?: () => {
    available: boolean;
    apiKey: string;
    endpoint: string;
    mode: string;
  };
  
  // Enhanced decision generator extensions
  decisions?: {
    getMode: () => DecisionGenerationMode;
    setMode: (mode: DecisionGenerationMode) => void;
    generateDecision: (
      gameState: GameState,
      narrativeContext?: NarrativeContext,
      locationType?: LocationType,
      forceGeneration?: boolean
    ) => Promise<PlayerDecision | null>;
    pendingDecision: PlayerDecision | null;
    service: ContextualDecisionService;
    lastDetectionScore: number;
    isGenerating: () => boolean;
  };
  
  // Quality evaluation tools
  quality?: {
    evaluateLastDecision: () => boolean;
    evaluateDecision: (decision: PlayerDecision, context?: NarrativeContext) => DecisionQualityResult;
  };
  
  // Legacy enhanced decision generator properties 
  pendingAIDecision?: PlayerDecision | null;
  decisionGenerators?: {
    getMode: () => DecisionGenerationMode;
    setMode: (mode: DecisionGenerationMode) => void;
    generateDecision: (
      gameState: GameState,
      locationType?: LocationType,
      forceGeneration?: boolean
    ) => Promise<PlayerDecision | null>;
  };
  
  // Additional temporary properties added at runtime
  pendingDecisionPromise?: Promise<PlayerDecision | null>;
  cachedDecision?: PlayerDecision | null;
}

/**
 * Extending the global Window interface
 */
declare global {
  interface Window {
    bhgmDebug?: BHGMDebug;
    // For compatibility with legacy code
    generateContextualDecision?: (
      gameState: GameState,
      narrativeContext?: Record<string, unknown>,
      locationType?: LocationType
    ) => PlayerDecision | null;
  }
}
