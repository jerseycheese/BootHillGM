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
import { CompressionLevel } from './narrative/context.types';
import { EstimatorComparisonResult, CompressionBenchmarkResult } from './optimization.types';

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
 * Interface for Decision Feedback System Debug Tools
 */
export interface FeedbackSystemDebugTools {
  patterns: Array<{
    pattern: string;
    weight: number;
  }>;
  updateWeights: (appliedPatterns: string[], success: boolean) => void;
  reset: () => void;
}

/**
 * Interface for Narrative Context Debug Tools
 */
export interface NarrativeContextDebugTools {
  // Show optimized context and return the result
  showOptimizedContext: () => {
    formattedContext: string;
    tokenEstimate: number;
    metadata: {
      compressionRatio: number;
      buildTime: number;
    };
    includedElements: {
      historyEntries: number;
      decisions: number;
      characters: string[];
    };
  } | undefined;
  
  // Test different compression levels
  testCompression: (text: string) => Array<{
    level: CompressionLevel;
    compressed: string;
    originalLength: number;
  }> | undefined;
  
  // Compare token estimation methods
  compareTokenEstimation: (text: string) => EstimatorComparisonResult | { message: string };
  
  // Benchmark different compression approaches
  benchmarkCompressionEfficiency: (sampleSize?: number) => CompressionBenchmarkResult[] | { message: string } | undefined;
  
  // Get optimal compression level for current state
  getOptimalCompression: () => CompressionLevel;
  
  // Feedback system debug tools
  feedbackSystem?: FeedbackSystemDebugTools;
  
  // Allow additional properties
  [key: string]: unknown;
}

/**
 * Core BHGM debug interface
 */
export interface BHGMDebug {
  version: string;
  triggerDecision: (locationType?: LocationType) => void;
  clearDecision: () => void;
  listLocations: () => unknown[];
  getState?: () => GameState;  // Updated from getGameState to getState to match usage
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
  
  // Narrative context debug tools
  narrativeContext?: NarrativeContextDebugTools;
  
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
 * Interface for narrative generation debug helpers
 */
export interface NarrativeGenerationDebug {
  generateNarrativeResponse: (option: string, decisionPrompt: string) => Promise<{
    narrative: string;
    acquiredItems: unknown[];
    removedItems: unknown[];
  }>;
  addNarrativeHistory: (text: string) => void;
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
    // Debug narrative generation
    __debugNarrativeGeneration?: NarrativeGenerationDebug;
  }
}