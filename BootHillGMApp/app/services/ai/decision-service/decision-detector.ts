/**
 * Decision Detector
 * 
 * Responsible for determining when to present decision points to the player.
 */

import { DEFAULT_DECISION_THRESHOLD } from '../../../constants/decision-service.constants';
import { DecisionDetectionResult } from '../../../types/ai-service.types';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { DecisionDetector } from '../../../types/decision-service/decision-service.types';

/**
 * Service for detecting appropriate moments to present decisions
 */
export class NarrativeDecisionDetector implements DecisionDetector {
  private threshold: number;
  private lastDecisionTime: number = 0;
  private minDecisionInterval: number;
  
  /**
   * Initialize the decision detector
   * @param threshold Relevance threshold for presenting decisions
   * @param minDecisionInterval Minimum time between decisions
   */
  constructor(
    threshold: number = DEFAULT_DECISION_THRESHOLD,
    minDecisionInterval: number
  ) {
    this.threshold = threshold;
    this.minDecisionInterval = minDecisionInterval;
  }
  
  /**
   * Detects if a decision point should be presented
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @returns Decision detection result
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    character: Character
  ): DecisionDetectionResult {
    // Don't present decisions too frequently
    if (Date.now() - this.lastDecisionTime < this.minDecisionInterval) {
      return {
        shouldPresent: false,
        score: 0,
        reason: 'Too soon since last decision'
      };
    }
    
    // Calculate decision score based on narrative state
    const score = this.calculateDecisionScore(narrativeState);
    
    // Determine if we should present a decision
    const shouldPresent = score >= this.threshold;
    
    return {
      shouldPresent,
      score,
      reason: shouldPresent 
        ? 'Narrative context indicates decision point'
        : 'Decision threshold not met'
    };
  }
  
  /**
   * Update the last decision time
   */
  public updateLastDecisionTime(): void {
    this.lastDecisionTime = Date.now();
  }
  
  /**
   * Calculates a score representing how appropriate it is to present a decision
   * @param narrativeState Current narrative state
   * @returns Score from 0-1 where higher values indicate a more appropriate decision point
   */
  private calculateDecisionScore(
    narrativeState: NarrativeState
  ): number {
    // Start with a base score
    let score = 0.4;
    
    // Get the current story point for analysis
    const currentPoint = narrativeState.currentStoryPoint;
    
    // Increase score for dialogue-heavy content
    // Look for quotation marks as a simple indicator of dialogue
    if (currentPoint?.content && (
      currentPoint.content.includes('"') || 
      currentPoint.content.includes('"') ||
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
    
    // Factor in time since last decision
    const timeFactor = Math.min(
      (Date.now() - this.lastDecisionTime) / (5 * this.minDecisionInterval),
      1.0
    );
    score += timeFactor * 0.25;
    
    // Ensure score is within 0-1 range
    return Math.max(0, Math.min(1, score));
  }
}

export default NarrativeDecisionDetector;
