/**
 * Use AI With Optimized Context Hook
 * 
 * This hook integrates the optimized narrative context with the AI service.
 * It provides a streamlined API for making AI requests with proper context
 * management, ensuring fresh context and optimal token usage.
 */

import { useState, useCallback } from 'react';
import { useNarrative } from '../../context/NarrativeContext';
import { getAIResponse } from '../../services/ai/gameService';
import { InventoryItem } from '../../types/item.types';
import { useOptimizedNarrativeContext, useNarrativeContextSynchronization } from './narrativeContextIntegration';
import { NarrativeContextOptions } from '../../types/narrative/context.types';
import { estimateTokenCount } from './narrativeCompression';
import { AIRequestResult, Opponent } from '../../types/ai.types';
import { Character } from '../../types/character';

/**
 * Hook that provides AI integration with optimized narrative context
 * 
 * @returns Functions and state for AI interaction
 */
export function useAIWithOptimizedContext() {
  const { state: narrativeState } = useNarrative();
  const { ensureFreshContext } = useNarrativeContextSynchronization();
  const { 
    buildOptimizedContext, 
    getDefaultContext
  } = useOptimizedNarrativeContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Extracts health from an opponent or character object
   * @param opponent The opponent or character to extract health from
   * @returns The extracted health value or default
   */
  const extractHealthValue = (opponent: Character | Opponent | null | undefined): number => {
    if (!opponent) return 100;
    
    // Check if it's an Opponent type (from AI types) with direct health property
    if ('health' in opponent && typeof opponent.health === 'number') {
      return opponent.health;
    }
    
    // Check if it has attributes 
    if (opponent.attributes) {
      // Need to check the structure of attributes to avoid type errors
      const attrs = opponent.attributes;
      
      // First ensure attributes is an object with proper shape
      if (typeof attrs === 'object' && attrs !== null) {
        // Try to access health property if it exists
        if ('health' in attrs && typeof attrs.health === 'number') {
          return attrs.health;
        }
        
        // Fall back to strength if available
        if ('strength' in attrs && typeof attrs.strength === 'number') {
          return attrs.strength;
        }
      }
    }
    
    // Default value
    return 100;
  };
  
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
      // Ensure narrative state is fresh before making request
      await ensureFreshContext();
      
      // Record start time for performance measurement
      const startTime = performance.now();
      
      // Build custom context based on options or use default
      const context = contextOptions 
        ? buildOptimizedContext(contextOptions)
        : getDefaultContext();
      
      // Calculate context build time
      const contextBuildTime = performance.now() - startTime;
      
      // Make the actual AI request
      const aiResponse = await getAIResponse(
        prompt,
        context, // Use our optimized context instead of raw journal context
        inventory,
        undefined, // Story progression context (not needed with our optimized context)
        narrativeState.narrativeContext
      );
      
      // Log AI response in development only
      if (process.env.NODE_ENV !== 'production') {
        const debugResponse = { ...aiResponse };
        // Truncate narrative for readability in logs
        if (debugResponse.narrative && debugResponse.narrative.length > 100) {
          debugResponse.narrative = debugResponse.narrative.substring(0, 100) + '...';
        }
        console.debug('AI Response (debug):', debugResponse);
      }
      
      // Create a valid storyProgression with non-nullable description
      const storyProgression = aiResponse.storyProgression 
        ? {
            ...aiResponse.storyProgression,
            description: aiResponse.storyProgression.description || '' // Ensure description is a string
          }
        : undefined;

      // Normalize opponent data regardless of structure
      const opponent = aiResponse.opponent ? { 
        name: aiResponse.opponent.name, 
        strength: typeof aiResponse.opponent.attributes === 'object' && 
                 aiResponse.opponent.attributes !== null && 
                 'strength' in aiResponse.opponent.attributes ? 
                 aiResponse.opponent.attributes.strength : undefined,
        health: extractHealthValue(aiResponse.opponent)
      } : undefined;

      // Return the response with added context metadata
      return {
        ...aiResponse,
        opponent,
        storyProgression,
        contextQuality: {
          optimized: true,
          compressionLevel: contextOptions?.compressionLevel || 'medium',
          tokensUsed: estimateTokenCount(context),
          buildTimeMs: contextBuildTime
        }
      };
    } catch (err) {
      // Handle errors
      const error = err instanceof Error ? err : new Error('Unknown error in AI request');
      setError(error);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    narrativeState, 
    ensureFreshContext, 
    buildOptimizedContext, 
    getDefaultContext
  ]);
  
  /**
   * Makes an AI request with context focused on specific themes or characters
   * 
   * @param prompt User input prompt
   * @param inventory Current inventory items
   * @param _focusTags Tags to focus the context on (characters, themes, etc.)
   * @returns AI response with metadata
   */
  const makeAIRequestWithFocus = useCallback(async (
    prompt: string,
    inventory: InventoryItem[],
    _focusTags: string[]
  ): Promise<AIRequestResult> => {
    // We'll use the focus tags in the future, but for now we just pass standard options
    // The parameter is prefixed with underscore to indicate it's not currently used
    return makeAIRequest(prompt, inventory, {
      compressionLevel: 'medium',
      maxTokens: 1500,
      prioritizeRecentEvents: true,
      relevanceThreshold: 6, // Higher threshold for more focused results
      includedContextSections: [
        'narrative_history',
        'decision_history',
        'character_relationships',
        'world_state',
        'story_progression'
      ]
    });
  }, [makeAIRequest]);
  
  /**
   * Makes an AI request with minimal context for when token space is limited
   * 
   * @param prompt User input prompt
   * @param inventory Current inventory items
   * @returns AI response with metadata
   */
  const makeAIRequestWithCompactContext = useCallback(async (
    prompt: string,
    inventory: InventoryItem[]
  ): Promise<AIRequestResult> => {
    return makeAIRequest(prompt, inventory, {
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
  }, [makeAIRequest]);
  
  return {
    makeAIRequest,
    makeAIRequestWithFocus,
    makeAIRequestWithCompactContext,
    isLoading,
    error
  };
}
