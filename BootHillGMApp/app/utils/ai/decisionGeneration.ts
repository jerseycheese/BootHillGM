/**
 * AI Decision Generation
 * 
 * Handles AI-powered decision generation functionality.
 */

import { GameState } from '../../types/gameState';
import { NarrativeContext, PlayerDecision } from '../../types/narrative.types';
import { LocationType } from '../../services/locationService';
import { getContextualDecisionService } from '../../services/ai/contextualDecisionService';
import { getSafePlayerCharacter } from '../decisionGeneratorHelpers';
import { generateContextualDecision } from '../contextualDecisionGenerator';

/**
 * Generate an AI-powered decision using the contextual decision service
 */
export async function generateAIDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  const service = getContextualDecisionService();
  const playerCharacter = getSafePlayerCharacter(gameState);
  
  return await service.generateDecision(
    gameState.narrative,
    playerCharacter,
    gameState,
    forceGeneration
  );
}

/**
 * Generate a decision using hybrid approach (AI with template fallback)
 */
export async function generateHybridDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  const service = getContextualDecisionService();
  const playerCharacter = getSafePlayerCharacter(gameState);
  
  // Skip detection check if force generation is enabled
  if (forceGeneration) {
    return await service.generateDecision(
      gameState.narrative,
      playerCharacter,
      gameState,
      true
    );
  }
  
  // Check if we should present a decision
  const detectionResult = service.detectDecisionPoint(
    gameState.narrative,
    playerCharacter,
    gameState
  );
  
  // Store detection score in debug object for visualization
  if (typeof window !== 'undefined' && window.bhgmDebug?.decisions) {
    window.bhgmDebug.decisions.lastDetectionScore = detectionResult.score;
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`Decision detection score: ${detectionResult.score} - ${detectionResult.reason}`);
  }
  
  if (detectionResult.shouldPresent) {
    // Generate AI-driven decision
    const aiDecision = await service.generateDecision(
      gameState.narrative,
      playerCharacter,
      gameState
    );
    
    if (aiDecision) {
      return aiDecision;
    }
  }
  
  // Fall back to template-based generation
  return generateContextualDecision(
    gameState,
    narrativeContext,
    locationType
  );
}
