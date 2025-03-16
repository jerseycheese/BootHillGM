/**
 * Decision Detector Module
 * 
 * Handles detection of appropriate moments to present decisions to the player
 * by analyzing narrative context and game state.
 */

import { Character } from '../../types/character';
import { NarrativeState } from '../../types/narrative.types';
import { 
  DecisionDetectionResult, 
  ExtendedGameState,
  ContextualDecisionServiceConfig
} from './contextualDecision.types';

/**
 * Handles detection of appropriate moments to present decisions to the player
 */
export class DecisionDetector {
  private config: ContextualDecisionServiceConfig;
  private lastDecisionTime: number = 0;

  /**
   * Initialize the decision detector
   * @param config Service configuration
   */
  constructor(config: ContextualDecisionServiceConfig) {
    this.config = config;
  }

  /**
   * Update the timestamp of the last decision
   * @param time Timestamp to set (defaults to current time)
   */
  public updateLastDecisionTime(time: number = Date.now()): void {
    this.lastDecisionTime = time;
  }

  /**
   * Get the timestamp of the last decision
   * @returns Last decision timestamp
   */
  public getLastDecisionTime(): number {
    return this.lastDecisionTime;
  }

  /**
   * Detects if a decision point should be presented
   * 
   * This function analyzes the narrative context to determine if this
   * is an appropriate moment to present a decision to the player.
   * 
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @param gameState Additional game state for context
   * @returns Decision detection result
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: ExtendedGameState
  ): DecisionDetectionResult {
    // Don't present decisions too frequently
    if (Date.now() - this.lastDecisionTime < this.config.minDecisionInterval) {
      return {
        shouldPresent: false,
        score: 0,
        reason: 'Too soon since last decision'
      };
    }
    
    // Calculate decision score based on narrative context
    const score = this.calculateDecisionScore(narrativeState, character, gameState);
    
    // Determine if we should present a decision
    const shouldPresent = score >= this.config.relevanceThreshold;
    
    return {
      shouldPresent,
      score,
      reason: shouldPresent 
        ? 'Narrative context indicates decision point'
        : 'Decision threshold not met'
    };
  }
  
  /**
   * Calculates a score representing how appropriate it is to present a decision
   * 
   * Higher scores mean a decision is more appropriate at this moment
   * 
   * @param narrativeState Current narrative state
   * @param _character Player character data
   * @param _gameState Additional game state for context
   * @returns Score from 0-1
   */
  private calculateDecisionScore(
    narrativeState: NarrativeState,
    _character: Character,
    _gameState?: ExtendedGameState
  ): number {
    // Start with a base score
    let score = 0.4;
    
    // Get the current story point for analysis
    const currentPoint = narrativeState.currentStoryPoint;
    
    // Analyze narrative content
    if (currentPoint?.content) {
      const content = currentPoint.content.toLowerCase();
      
      // Increase score for dialogue-heavy content
      const dialogueMarkers = ['"', "'", '"', '"', "said", "asked", "replied", "shouted"];
      
      if (dialogueMarkers.some(marker => content.includes(marker))) {
        score += 0.15;
        
        // Additional boost for interactive dialogue
        if (content.includes("?") || /\b(what|where|when|why|who|how)\b/i.test(content)) {
          score += 0.05;
        }
      }
      
      // Decrease score during action sequences
      const actionWords = ['shot', 'punch', 'run', 'fight', 'chase', 'attack', 
                        'defend', 'dodge', 'fire', 'flee', 'strike', 'hit'];
      
      if (actionWords.some(word => content.includes(word))) {
        score -= 0.2;
        
        // But increase slightly for action conclusion
        if (content.includes("stopped") || 
            content.includes("ended") || 
            content.includes("finally") ||
            content.includes("after")) {
          score += 0.1;
        }
      }
      
      // Increase score for explicit decision points
      if (content.includes("decide") || 
          content.includes("choice") || 
          content.includes("option") ||
          content.includes("what will you do") ||
          content.includes("what do you do")) {
        score += 0.25;
      }
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
    
    // Factor in time since last decision (gradually increasing importance)
    const timeFactor = Math.min(
      (Date.now() - this.lastDecisionTime) / (5 * this.config.minDecisionInterval),
      1.0
    );
    score += timeFactor * 0.25;
    
    // Ensure score is within 0-1 range
    return Math.max(0, Math.min(1, score));
  }
}