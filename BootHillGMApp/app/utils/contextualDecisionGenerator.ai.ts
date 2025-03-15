/**
 * AI-Enhanced Contextual Decision Generator
 * 
 * This file extends the existing contextual decision generator with AI-driven
 * capabilities while maintaining compatibility with the existing system.
 */

import { AIDecisionService } from '../services/ai/aiDecisionService';
import { generateContextualDecision as generateTemplateDecision } from './contextualDecisionGenerator';
import { PlayerDecision, NarrativeContext } from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { LocationType } from '../services/locationService';
import { Character } from '../types/character';
// Import the global type definitions
import '../types/global.d';

// Create singleton instance of AIDecisionService
let aiDecisionServiceInstance: AIDecisionService | null = null;

/**
 * Get the AIDecisionService instance, creating it if necessary
 */
export function getAIDecisionService(): AIDecisionService {
  if (!aiDecisionServiceInstance) {
    aiDecisionServiceInstance = new AIDecisionService();
  }
  return aiDecisionServiceInstance;
}

/**
 * Generate an AI-driven contextual decision
 * 
 * This function uses the AI service when available, falling back to
 * template-based generation when AI is unavailable or when errors occur.
 * 
 * @param gameState Current game state
 * @param narrativeContext Optional narrative context
 * @param locationType Optional location type
 * @param character Optional player character data
 * @returns A PlayerDecision object or null if none could be generated
 */
export async function generateAIContextualDecision(
  gameState: GameState,
  narrativeContext?: Partial<NarrativeContext>,
  locationType?: LocationType,
  character?: Character
): Promise<PlayerDecision | null> {
  try {
    // Get the AI decision service
    const aiService = getAIDecisionService();
    
    // If no character data is provided, use the character from game state
    console.log('gameState:', gameState, 'character:', character);
    const playerCharacter = character || gameState.character;
    
    if (!playerCharacter) {
      console.error('Cannot generate AI decision: No player character data available');
      return null;
    }
    
    // Check if we should present a decision based on context
    const detectionResult = aiService.detectDecisionPoint(
      gameState.narrative,
      playerCharacter,
      gameState
    );
    
    // If we shouldn't present a decision, return null
    if (!detectionResult.shouldPresent) {
      console.log(`Decision detection score: ${detectionResult.score} - ${detectionResult.reason}`);
      return null;
    }
    
    // Generate decision with AI service
    try {
      const aiDecision = await aiService.generateDecision(
        gameState.narrative,
        playerCharacter,
        gameState
      );
      
      console.log('Successfully generated AI decision', aiDecision.id);
      return aiDecision;
    } catch (error) {
      console.error('Error generating AI decision:', error);
      
      // Fall back to template-based generation
      console.log('Falling back to template-based decision generation');
      return generateTemplateDecision(gameState, narrativeContext, locationType);
    }
  } catch (error) {
    console.error('Error in generateAIContextualDecision:', error);
    return null;
  }
}

/**
 * Enhanced contextual decision generator
 * 
 * This function provides a seamless API that matches the existing
 * generateContextualDecision function but enhances it with AI capabilities.
 * 
 * @param gameState Current game state
 * @param narrativeContext Optional narrative context
 * @param locationType Optional location type
 * @returns A PlayerDecision object or null if none could be generated
 */
export function generateEnhancedContextualDecision(
  gameState: GameState,
  narrativeContext?: Partial<NarrativeContext>,
  locationType?: LocationType
): PlayerDecision | null {
  try {
    // Try the template-based approach first for immediate response
    const templateDecision = generateTemplateDecision(
      gameState,
      narrativeContext,
      locationType
    );
    
    // Initiate AI-based generation in the background
    generateAIContextualDecision(gameState, narrativeContext, locationType)
      .then(aiDecision => {
        if (aiDecision) {
          // If AI generation was successful, store it for next retrieval
          // This approach avoids the async nature disrupting the existing flow
          console.log('AI decision generated and will be used for next request');
          
          // Use the centralized type for bhgmDebug
          if (window.bhgmDebug) {
            window.bhgmDebug.pendingAIDecision = aiDecision;
          }
        }
      })
      .catch(error => {
        console.error('Background AI decision generation failed:', error);
      });
    
    // Check if we have a pending AI decision from a previous call
    if (window.bhgmDebug?.pendingAIDecision) {
      const aiDecision = window.bhgmDebug.pendingAIDecision;
      // Clear the pending decision
      window.bhgmDebug.pendingAIDecision = null;
      return aiDecision;
    }
    
    // Return the template decision as fallback
    return templateDecision;
  } catch (error) {
    console.error('Error in generateEnhancedContextualDecision:', error);
    // Fall back to template-based generation
    return generateTemplateDecision(gameState, narrativeContext, locationType);
  }
}