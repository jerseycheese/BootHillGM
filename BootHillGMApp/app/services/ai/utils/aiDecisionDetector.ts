// BootHillGMApp/app/services/ai/utils/aiDecisionDetector.ts (Reordered)
import { DecisionDetectionResult } from '../../../types/ai-service.types';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { ExtendedGameState, AIDecisionServiceConfig } from '../types/aiDecisionTypes';

/**
 * Calculate a score representing how appropriate it is to present a decision
 *
 * Higher scores mean a decision is more appropriate at this moment
 *
 * @param narrativeState Current narrative state
 * @param _character Player character data (currently unused, but kept for signature consistency)
 * @param lastDecisionTime Timestamp of the last decision
 * @param gameState Current game state (optional)
 * @returns Score from 0-1
 */
export function calculateDecisionScore(
  narrativeState: NarrativeState,
  _character: Character, // Marked as unused
  lastDecisionTime: number,
  gameState?: ExtendedGameState
): number {
  // Start with a base score
  let score = 0.4;

  // Get the current story point
  const currentPoint = narrativeState.currentStoryPoint;

  // Increase score for dialogue-heavy content
  if (currentPoint?.content && (
    currentPoint.content.includes('"') ||
    currentPoint.content.includes('"') || // Note: Duplicate quote check
    currentPoint.content.includes("'")
  )) {
    score += 0.15;
  }

  // Decrease score during action sequences
  const actionWords = ['shot', 'punch', 'run', 'fight', 'chase', 'attack', 'defend', 'dodge'];
  if (currentPoint?.content &&
      actionWords.some(word => currentPoint.content.toLowerCase().includes(word))) {
    score -= 0.2;
  }

  // Increase score for decision-type story points
  if (currentPoint?.type === 'decision') {
    score += 0.3;
  }

  // Increase score when entering new locations
  if (narrativeState.narrativeContext?.worldContext &&
      narrativeState.narrativeContext.worldContext.includes('new location')) {
    score += 0.2;
  }

  // If we have a game state, check for additional factors
  if (gameState) {
    // Increase score during downtime (not in combat)
    // Check both active and isActive for compatibility
    if (!gameState.combat?.active && !gameState.combat?.isActive) {
      score += 0.1;
    }

    // Decrease score during active gameplay sequences
    if (gameState.activeEvent) {
      score -= 0.15;
    }
  }

  // Factor in time since last decision
  const timeFactor = Math.min(
    (Date.now() - lastDecisionTime) / (5 * 30 * 1000), // Using 5× the standard minimum interval (assuming 30s)
    1.0
  );
  score += timeFactor * 0.25;

  // Ensure score is within 0-1 range
  return Math.max(0, Math.min(1, score));
}


/**
 * Detect if the current narrative context should trigger a decision point
 *
 * @param narrativeState Current narrative state
 * @param character Player character data
 * @param config Service configuration
 * @param lastDecisionTime Timestamp of the last decision (optional, defaults to 0)
 * @param gameState Current game state (optional)
 * @returns Detection result with score and reasoning
 */
export function detectDecisionPoint(
  narrativeState: NarrativeState,
  character: Character,
  config: AIDecisionServiceConfig,
  lastDecisionTime: number = 0,
  gameState?: ExtendedGameState
): DecisionDetectionResult {
  // Don't present decisions too frequently
  if (Date.now() - lastDecisionTime < config.minDecisionInterval) {
    return {
      shouldPresent: false,
      score: 0,
      reason: 'Too soon since last decision'
    };
  }

  // Calculate decision score
  const score = calculateDecisionScore(narrativeState, character, lastDecisionTime, gameState); // Now defined above

  // Determine if we should present a decision
  const shouldPresent = score >= config.relevanceThreshold;

  return {
    shouldPresent,
    score,
    reason: shouldPresent
      ? 'Narrative context indicates decision point'
      : 'Decision threshold not met'
  };
}
