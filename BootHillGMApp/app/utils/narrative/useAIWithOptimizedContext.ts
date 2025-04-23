/**
 * Use AI With Optimized Context Hook
 * 
 * This hook integrates the optimized narrative context with the AI service.
 * It provides a streamlined API for making AI requests with proper context
 * management, ensuring fresh context and optimal token usage.
 */

import { useState, useCallback } from 'react';
import { getAIResponse } from '../../services/ai/gameService';
import { InventoryItem } from '../../types/item.types';
import { useOptimizedNarrativeContext, useNarrativeContextSynchronization } from './narrativeContextIntegration';
import { NarrativeContextOptions } from '../../types/narrative/context.types';
import { estimateTokenCount } from './narrativeCompression';
import { AIRequestResult, Opponent } from '../../types/ai.types';

/**
 * Hook that provides AI integration with optimized narrative context
 * 
 * @returns Functions and state for AI interaction
 */
export function useAIWithOptimizedContext() {
  const { ensureFreshContext } = useNarrativeContextSynchronization();
  const { 
    buildOptimizedContext, 
    getDefaultContext
  } = useOptimizedNarrativeContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  
  /**
   * Makes an AI request with optimized context
   * 
   * @param prompt User input prompt
   * @param inventory Current inventory items
   * @param contextOptions Options for context building
   * @returns AI response with metadata
   */
  const makeAIRequest = useCallback(async (
    prompt: string,
    inventory: InventoryItem[],
    contextOptions?: NarrativeContextOptions
  ): Promise<AIRequestResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ensureFreshContext();
      const startTime = performance.now();
      const context = contextOptions 
        ? buildOptimizedContext(contextOptions)
        : getDefaultContext();
      const contextBuildTime = performance.now() - startTime;
      
      // Create context metadata for tracking quality metrics
      const contextMetadata = {
        optimized: true,
        compressionLevel: contextOptions?.compressionLevel || 'medium',
        tokensUsed: estimateTokenCount(context),
        buildTimeMs: contextBuildTime
      };
      
      // Use the positional parameters for backward compatibility with tests
      const aiResponse = await getAIResponse(
        prompt,
        context,
        inventory,
        undefined,
        undefined // Don't pass the metadata as the narrative context parameter
      );
      
      const storyProgression = aiResponse.storyProgression 
        ? { ...aiResponse.storyProgression, description: aiResponse.storyProgression.description || '' }
        : undefined;

      let normalizedOpponent: Opponent | undefined = undefined;
      if (aiResponse.opponent) {
        const rawOpponent = aiResponse.opponent; 
        const opponentStrength = rawOpponent.attributes?.strength ?? 10; 
        
        normalizedOpponent = { 
          name: rawOpponent.name || 'Unknown Opponent', 
          strength: opponentStrength, 
          health: opponentStrength 
        };
      }

      return {
        ...aiResponse,
        opponent: normalizedOpponent, 
        storyProgression,
        contextQuality: contextMetadata
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error in AI request');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    ensureFreshContext, 
    buildOptimizedContext, 
    getDefaultContext
  ]);
  
  /**
   * Makes an AI request with focus on specific tags
   * 
   * @param prompt User input prompt
   * @param inventory Current inventory items
   * @returns AI response
   */
  const makeAIRequestWithFocus = useCallback(async (
    prompt: string, inventory: InventoryItem[], focusTags: string[]
  ): Promise<AIRequestResult> => {
    // Pass focusTags to contextOptions
    return makeAIRequest(prompt, inventory, {
      compressionLevel: 'medium',
      maxTokens: 1500,
      prioritizeRecentEvents: true,
      relevanceThreshold: 6,
      includedContextSections: [
        'narrative_history', 'decision_history', 'character_relationships',
        'world_state', 'story_progression'
      ],
      // Include focusTags in the options passed to buildOptimizedContext via makeAIRequest
      // Note: NarrativeContextOptions might need updating if it doesn't support focusTags directly
      // For now, assuming makeAIRequest/buildOptimizedContext can handle extra options or ignore them.
      // A better approach might be to explicitly add focusTags to NarrativeContextOptions type.
      focusTags: focusTags // Pass the tags here
    });
  }, [makeAIRequest]);
  
  /**
   * Makes an AI request with compact context for faster responses
   * 
   * @param prompt User input prompt
   * @param inventory Current inventory items
   * @returns AI response
   */
  const makeAIRequestWithCompactContext = useCallback(async (
    prompt: string, inventory: InventoryItem[]
  ): Promise<AIRequestResult> => {
    return makeAIRequest(prompt, inventory, {
      compressionLevel: 'high', 
      maxTokens: 1000, 
      maxHistoryEntries: 5,
      maxDecisionHistory: 3,
      includedContextSections: [
        'narrative_history', 'decision_history', 'story_progression'
      ]
    });
  }, [makeAIRequest]);
  
  return {
    makeAIRequest, 
    makeAIRequestWithFocus, 
    makeAIRequestWithCompactContext,
    isLoading, 
    error,
    clearError: () => setError(null) // Add function to clear error
  };
}