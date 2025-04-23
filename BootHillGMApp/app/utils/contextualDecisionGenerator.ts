/**
 * Contextual Decision Generator
 * 
 * This utility provides decision generation based on game context.
 * It supports template-based and AI-powered contextual analysis.
 */

import { GameState } from '../types/gameState';
import { NarrativeContext, PlayerDecision } from '../types/narrative.types';
import { LocationType } from '../services/locationService';
import '../types/global.d';

// Import utility functions
import { 
  isGameStateReadyForDecisions, 
  getRefreshedGameState
} from './decisionGeneratorHelpers';

// Import type definitions
import { 
  DecisionGenerationMode,
  templateToDecision,
  extractContextFromGameState,
  findBestTemplateMatch 
} from './decisionGeneratorTypes';

// Import template and narrative helpers
import { getTemplatesForLocation } from './decisionTemplates';
import { extractRecentNarrativeContext } from './narrativeContextExtractor';
import { enhanceNarrativeContext, getEnhancedNarrativeContext } from './narrativeContextUtils';

// Import AI decision generation
import { generateAIDecision, generateHybridDecision } from './ai/decisionGeneration';

// Import fallback decision generator
import { createFallbackDecision } from './fallbackDecisionGenerator';

// Import debug tools
import { initializeDecisionDebugTools } from './decisionDebugTools';

// Export types for backward compatibility
export type { DecisionGenerationMode } from './decisionGeneratorTypes';

// Internal state management
let currentGenerationMode: DecisionGenerationMode = 'ai';
let pendingDecision: PlayerDecision | null = null;
let isGeneratingDecision = false;

/**
 * Set the decision generation mode.
 */
export function setDecisionGenerationMode(mode: DecisionGenerationMode): void {
  currentGenerationMode = mode;
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`Decision generation mode set to: ${mode}`);
  }
}

/**
 * Get the current decision generation mode.
 */
export function getDecisionGenerationMode(): DecisionGenerationMode {
  return currentGenerationMode;
}

/**
 * Generate a template-based contextual decision
 */
export const generateContextualDecision = (
  gameState: GameState,
  narrativeContext?: Partial<NarrativeContext>,
  forcedLocationType?: LocationType
): PlayerDecision | null => {
  try {
    const extractedContext = extractContextFromGameState(gameState);
    const locationType = forcedLocationType || extractedContext.locationType;
    
    const templates = getTemplatesForLocation(locationType);
    if (templates.length === 0) {
      console.error(`No decision templates for location type: ${locationType}`);
      return null;
    }

    const bestTemplate = findBestTemplateMatch(
      templates,
      extractedContext.characters,
      extractedContext.themes
    );

    if (!bestTemplate) return null;
    return templateToDecision(bestTemplate, narrativeContext);
  } catch (error) {
    console.error('Error generating contextual decision:', error);
    return null;
  }
};

/**
 * Generate a decision based on the currently selected generation mode
 */
async function generateDecisionByMode(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  switch (currentGenerationMode) {
    case 'ai': 
      return await generateAIDecision(gameState, narrativeContext, forceGeneration);
    
    case 'template':
      return generateContextualDecision(gameState, narrativeContext, locationType);
    
    case 'hybrid':
    default:
      return await generateHybridDecision(
        gameState, narrativeContext, locationType, forceGeneration
      );
  }
}

/**
 * Generate an enhanced decision using the current generation mode
 */
export async function generateEnhancedDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  try {
    // Prevent multiple concurrent generations
    if (isGeneratingDecision) return null;
    isGeneratingDecision = true;
    
    // Get fresh game state and context
    const freshGameState = getRefreshedGameState(gameState);
    const recentContext = extractRecentNarrativeContext(freshGameState);
    
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Generating decision with narrative history length:', 
        freshGameState.narrative.narrativeHistory.length);
      
      if (freshGameState.narrative.narrativeHistory.length > 0) {
        console.debug('Latest narrative entry:', 
          freshGameState.narrative.narrativeHistory[freshGameState.narrative.narrativeHistory.length - 1]);
      }
    }
    
    // Check if ready for decisions
    if (!forceGeneration && !isGameStateReadyForDecisions(freshGameState)) {
      isGeneratingDecision = false;
      return null;
    }
    
    // Check for pending decision from previous generation
    if (pendingDecision) {
      const decision = pendingDecision;
      pendingDecision = null;
      isGeneratingDecision = false;
      return decision;
    }
    
    try {
      // Enhance narrative context with recent entries
      const enhancedContext = enhanceNarrativeContext(
        freshGameState, 
        narrativeContext, 
        recentContext
      );
      
      // Generate decision using selected mode
      const result = await generateDecisionByMode( // Now defined before call
        freshGameState, 
        enhancedContext, 
        locationType, 
        forceGeneration
      );
      
      isGeneratingDecision = false;
      return result;
    } catch {
      isGeneratingDecision = false;
      return createFallbackDecision(freshGameState, locationType);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in generateEnhancedDecision:', error);
    }
    isGeneratingDecision = false;
    return createFallbackDecision(gameState, locationType);
  }
}


/**
 * Enhanced contextual decision with background AI generation
 */
export function generateEnhancedContextualDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType
): PlayerDecision | null {
  // Get fresh state first
  const freshGameState = getRefreshedGameState(gameState);
  
  // Don't generate decisions for empty game states
  if (!isGameStateReadyForDecisions(freshGameState)) {
    return null;
  }
  
  // Create enhanced context with recent narrative
  const enhancedContext = getEnhancedNarrativeContext(freshGameState, narrativeContext);
  
  // First, try template-based generation for immediate result
  const templateDecision = generateContextualDecision(
    freshGameState,
    enhancedContext,
    locationType
  );
  
  // Start async AI generation in the background
  if (!isGeneratingDecision) {
    generateEnhancedDecision(freshGameState, enhancedContext, locationType)
      .then(decision => {
        if (decision) {
          // Cache the decision for next call
          pendingDecision = decision;
          if (process.env.NODE_ENV !== 'production') {
            console.debug('AI decision cached for next retrieval:', decision.id);
          }
        }
      })
      .catch(error => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Background AI decision generation failed:', error);
        }
      });
  }
  
  return templateDecision;
}

// Export debug tools
export { initializeDecisionDebugTools };
