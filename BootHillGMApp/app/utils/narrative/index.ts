/**
 * Narrative Context Module
 * 
 * Main export file for the narrative context module
 * 
 * This module provides utilities for building optimized narrative context
 * for AI interactions, with intelligent filtering, prioritization, and compression.
 */

// Main builder
export { buildNarrativeContext } from './narrativeContextBuilder';

// Utility exports
export { 
  compressNarrativeHistory,
  extractRelevantDecisions
} from './narrativeContextProcessors';

export {
  prioritizeContextElements
} from './narrativeContextPrioritization';

export {
  formatDecisionForContext,
  formatCharacterForContext,
  formatStoryProgressionForContext
} from './narrativeContextFormatters';

export {
  allocateTokensToElements,
  buildStructuredContext,
  getBlockPriority
} from './narrativeContextTokens';

// Default values
export {
  DEFAULT_CONTEXT_OPTIONS,
  DEFAULT_NARRATIVE_CONTEXT
} from './narrativeContextDefaults';

// Export compression utilities
export {
  compressNarrativeText,
  estimateTokenCount,
  createNarrativeSummaries,
  createConciseSummary
} from './narrativeCompression';

// Export integration utilities
export {
  useOptimizedNarrativeContext,
  useMemoizedNarrativeContext,
  getOptimizedContextForAI,
  enrichPromptWithContext,
  useNarrativeContextSynchronization
} from './narrativeContextIntegration';

// Export AI hook
export { useAIWithOptimizedContext } from './useAIWithOptimizedContext';

// Export debug tools
export { 
  registerNarrativeContextDebugTools,
  type NarrativeContextDebugTools 
} from './narrativeContextDebugTools';

// Types
export * from './narrativeContextTypes';