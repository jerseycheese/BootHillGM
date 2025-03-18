/**
 * Narrative Context Integration
 * 
 * Integrates the optimized narrative context builder with the AI service.
 * This module provides the hooks and utility functions needed to connect
 * the narrative context optimization with the existing game services.
 */

import { NarrativeState, NarrativeContext as _NarrativeContext } from '../../types/narrative.types';
import { NarrativeContextOptions } from '../../types/narrative/context.types';
import { buildNarrativeContext } from './narrativeContextBuilder';
import { useNarrative } from '../../context/NarrativeContext';
import { useMemo, useCallback, useRef } from 'react';
// Importing for type info only, won't add to bundle size
import { NarrativeContextDebugTools } from '../../types/global.d';

/**
 * Interface for metrics object with record function
 */
interface MetricsRecorder {
  record: (originalLength: number, optimizedLength: number, processingTime: number) => void;
}

/**
 * Hook that provides optimized narrative context for AI prompts
 * 
 * @returns Functions for accessing and building optimized context
 */
export function useOptimizedNarrativeContext() {
  const { state } = useNarrative();
  const contextCacheRef = useRef<{
    state: NarrativeState;
    optimizedContext: string;
    timestamp: number;
  } | null>(null);
  
  /**
   * Builds optimized narrative context with customizable options
   */
  const buildOptimizedContext = useCallback((options?: NarrativeContextOptions) => {
    // Check if we have a valid cached context that's recent enough
    const now = Date.now();
    if (
      contextCacheRef.current &&
      contextCacheRef.current.state === state &&
      now - contextCacheRef.current.timestamp < 5000 // Cache valid for 5 seconds
    ) {
      return contextCacheRef.current.optimizedContext;
    }
    
    // Build fresh context
    const result = buildNarrativeContext(state, options);
    
    // Cache the result
    contextCacheRef.current = {
      state,
      optimizedContext: result.formattedContext,
      timestamp: now
    };
    
    return result.formattedContext;
  }, [state]);
  
  /**
   * Gets default optimized context for regular AI prompts
   */
  const getDefaultContext = useCallback(() => {
    return buildOptimizedContext({
      compressionLevel: 'medium',
      maxTokens: 2000
    });
  }, [buildOptimizedContext]);
  
  /**
   * Gets focused context optimized for a specific situation
   * This version prioritizes decisions and story elements related to current tags
   * 
   * @param _focusTags Tags to focus on (currently unused but kept for future implementation)
   */
  const getFocusedContext = useCallback((_focusTags: string[]) => {
    return buildOptimizedContext({
      compressionLevel: 'high',
      maxTokens: 1500,
      prioritizeRecentEvents: true,
      includedContextSections: [
        'narrative_history',
        'decision_history',
        'world_state',
        'story_progression'
      ],
      // Filter for decisions relevant to these tags
      relevanceThreshold: 5
    });
  }, [buildOptimizedContext]);
  
  /**
   * Gets compact context for when token space is limited
   * Heavily compressed with only essential information
   */
  const getCompactContext = useCallback(() => {
    return buildOptimizedContext({
      compressionLevel: 'high',
      maxTokens: 1000,
      maxHistoryEntries: 5,
      maxDecisionHistory: 3,
      includedContextSections: [
        'narrative_history',
        'decision_history',
        'story_progression'
      ]
    });
  }, [buildOptimizedContext]);
  
  return {
    buildOptimizedContext,
    getDefaultContext,
    getFocusedContext,
    getCompactContext
  };
}

/**
 * Hook that provides memoized context for AI integration
 * 
 * @returns Memoized optimized context
 */
export function useMemoizedNarrativeContext() {
  const { buildOptimizedContext } = useOptimizedNarrativeContext();
  
  // Memoize the context to prevent unnecessary rebuilds
  const optimizedContext = useMemo(() => {
    return buildOptimizedContext();
  }, [buildOptimizedContext]);
  
  return optimizedContext;
}

/**
 * Enriches an AI prompt with optimized narrative context
 * 
 * @param basePrompt The original prompt
 * @param narrativeState Current narrative state
 * @param options Context building options
 * @returns Enriched prompt with optimized context
 */
export function enrichPromptWithContext(
  basePrompt: string,
  narrativeState: NarrativeState,
  options?: NarrativeContextOptions
): string {
  const context = buildNarrativeContext(narrativeState, options).formattedContext;
  
  return `
## Context:
${context}

## Prompt:
${basePrompt}
  `.trim();
}

/**
 * Optimizes the narrative context within the getAIResponse function
 * 
 * @param prompt User prompt
 * @param journalContext Journal context
 * @param narrativeState Full narrative state
 * @returns Optimized context string
 */
export function getOptimizedContextForAI(
  prompt: string,
  journalContext: string,
  narrativeState: NarrativeState
): string {
  try {
    // Determine compression level based on narrative history size
    const compressionLevel: 'low' | 'medium' | 'high' = 
      narrativeState.narrativeHistory.length > 20 ? 'high' :
      narrativeState.narrativeHistory.length > 10 ? 'medium' : 'low';
    
    // Build context with appropriate options
    const result = buildNarrativeContext(narrativeState, {
      compressionLevel,
      maxTokens: 2000,
      prioritizeRecentEvents: true,
      relevanceThreshold: 4
    });
    
    // Record metrics with safer type checking using our interface
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      const debugContext = window.bhgmDebug?.narrativeContext;
      if (debugContext) {
        const contextTools = debugContext as NarrativeContextDebugTools;
        // Use our interface for type-safe property access
        const metricsObj = contextTools.metrics as unknown as MetricsRecorder | undefined;
        if (metricsObj?.record && typeof metricsObj.record === 'function') {
          metricsObj.record(
            narrativeState.narrativeHistory.join(' ').length,
            result.formattedContext.length,
            result.metadata.buildTime
          );
        }
      }
    }
    
    return result.formattedContext;
  } catch (error) {
    // If optimization fails, fall back to original journal context
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Error optimizing context, falling back to original:', error);
    }
    return journalContext;
  }
}

/**
 * Custom hook to ensure narrative context is fresh before AI requests
 * 
 * @returns Function to ensure context freshness
 */
export function useNarrativeContextSynchronization() {
  const { state, dispatch } = useNarrative();
  
  // Function to ensure context is fresh before making AI requests
  const ensureFreshContext = useCallback(async () => {
    // Force a state update to ensure we have the freshest state
    // This addresses the stale context issue (#210)
    await new Promise<void>(resolve => {
      // Dispatch a minimal update to trigger state refresh
      dispatch({ type: 'UPDATE_NARRATIVE', payload: {} });
      
      // Wait for next frame to ensure state is updated
      requestAnimationFrame(() => {
        resolve();
      });
    });
    
    return state;
  }, [state, dispatch]);
  
  return { ensureFreshContext };
}
