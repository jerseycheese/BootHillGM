/**
 * Game Service Optimization Patch
 * 
 * This file provides a patch for the gameService to use optimized narrative context.
 * It's designed to be imported in the main application initialization code.
 */

import { getAIResponse as originalGetAIResponse } from './gameService';
import { getOptimizedContextForAI } from '../../utils/narrative';
import { InventoryItem, ItemCategory } from '../../types/item.types';
import { NarrativeContext, StoryProgressionData, PlayerDecision, NarrativeState, initialNarrativeState } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { LocationType } from '../locationService';
import { SuggestedAction } from '../../types/campaign';
import { NarrativeContextDebugTools } from '../../types/global.d';

// Keep track of whether we've already patched the service
let isPatchApplied = false;

/**
 * Type for complex item objects that might be in the AI response
 */
interface AIItemResponse {
  name: string;
  category?: ItemCategory;
  [key: string]: unknown;
}

/**
 * Updated type alias matching the return type that includes complex item structures
 */
type AIResponseResult = {
  narrative: string;
  location: LocationType;
  combatInitiated?: boolean;
  opponent?: Character | null;
  acquiredItems: (string | AIItemResponse)[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
  storyProgression?: StoryProgressionData;
  playerDecision?: PlayerDecision;
};

/**
 * Interface for metrics object with record function
 */
interface MetricsRecorder {
  record: (originalLength: number, optimizedLength: number, processingTime: number) => void;
}

/**
 * Create an optimized version of getAIResponse
 */
export const optimizedGetAIResponse = async function(
  prompt: string,
  journalContext: string,
  inventory: InventoryItem[],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext
): Promise<AIResponseResult> {
  try {
    // Build complete narrative state using initialNarrativeState as base
    const narrativeState: NarrativeState = {
      ...initialNarrativeState,
      narrativeHistory: journalContext.split('\n').filter(Boolean),
      // Only set narrativeContext if it's provided, otherwise keep it undefined
      ...(narrativeContext ? { narrativeContext } : {})
    };
    
    // Get optimized context
    const optimizedContext = getOptimizedContextForAI(
      prompt,
      journalContext,
      narrativeState
    );
    
    // Record optimization metrics instead of logging
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      // Safely access debug tools with proper type checking
      const debugContext = window.bhgmDebug?.narrativeContext;
      if (debugContext) {
        const contextTools = debugContext as NarrativeContextDebugTools;
        // Check if metrics object exists and has a record method
        const metricsObj = contextTools.metrics as unknown as MetricsRecorder | undefined;
        if (metricsObj?.record && typeof metricsObj.record === 'function') {
          metricsObj.record(
            journalContext.length,
            optimizedContext.length,
            0 // Processing time not available here
          );
        }
      }
    }
    
    // Call original method with optimized context
    const response = await originalGetAIResponse({
      prompt,
      journalContext: optimizedContext, // Replace journal context with optimized context
      inventory,
      storyProgressionContext,
      narrativeContext
    });
    
    // Convert response to expected AIResponseResult type
    return response as unknown as AIResponseResult;
  } catch (error) {
    // If optimization fails, fall back to original implementation with warning
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Context optimization failed, falling back to original context:', error);
    }
    
    const response = await originalGetAIResponse({
      prompt,
      journalContext,
      inventory,
      storyProgressionContext,
      narrativeContext
    });
    
    // Convert response to expected AIResponseResult type
    return response as unknown as AIResponseResult;
  }
};

/**
 * Get the AI response - either optimized or original based on whether patch is applied
 */
export const getAIResponse = (
  prompt: string,
  journalContext: string,
  inventory: InventoryItem[],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext
): Promise<AIResponseResult> => {
  // If patch is applied, use optimized version, otherwise use original
  if (isPatchApplied) {
    return optimizedGetAIResponse(prompt, journalContext, inventory, storyProgressionContext, narrativeContext);
  } else {
    const response = originalGetAIResponse({ 
      prompt, 
      journalContext, 
      inventory, 
      storyProgressionContext, 
      narrativeContext 
    });
    return response as unknown as Promise<AIResponseResult>;
  }
};

/**
 * Applies the narrative context optimization patch to the getAIResponse function
 * This should be called during application initialization
 */
export function applyGameServiceOptimization(): void {
  // Prevent double-patching
  if (isPatchApplied) {
    return;
  }
  
  // Update module exports (this is already done above in our getAIResponse export)
  
  // Mark as patched
  isPatchApplied = true;
  
  // Log success in development mode
  if (process.env.NODE_ENV !== 'production') {
  }
}
