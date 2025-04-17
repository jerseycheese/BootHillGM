/**
 * Narrative Context Utilities
 * 
 * Helpers for managing narrative context in decision generation.
 */

import { GameState } from '../types/gameState';
import { NarrativeContext } from '../types/narrative.types';
import { extractRecentNarrativeContext } from './narrativeContextExtractor';

/**
 * Helper to enhance narrative context with recent events
 */
export function enhanceNarrativeContext(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  recentEvents: string = ''
): NarrativeContext {
  if (narrativeContext) {
    narrativeContext.recentEvents = recentEvents;
    return narrativeContext;
  } 
  
  if (gameState.narrative.narrativeContext) {
    gameState.narrative.narrativeContext.recentEvents = recentEvents;
    return gameState.narrative.narrativeContext;
  } 
  
  // Create narrative context if it doesn't exist
  const newContext: NarrativeContext = {
    recentEvents: recentEvents,
    decisionHistory: []
  };
  
  // Update game state for future reference
  gameState.narrative.narrativeContext = newContext;
  
  return newContext;
}

/**
 * Extract and enhance narrative context from the game state
 */
export function getEnhancedNarrativeContext(
  gameState: GameState,
  narrativeContext?: NarrativeContext
): NarrativeContext {
  const recentContext = extractRecentNarrativeContext(gameState);
  return enhanceNarrativeContext(gameState, narrativeContext, recentContext);
}
