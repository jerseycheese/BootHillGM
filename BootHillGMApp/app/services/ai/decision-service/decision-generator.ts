/**
 * Decision Generator
 * 
 * Responsible for generating contextually appropriate decisions.
 */

import { DecisionPrompt, DecisionResponse } from '../../../types/ai-service.types';
import { DecisionGenerator, DecisionHistoryManager } from '../../../types/decision-service/decision-service.types';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { LocationType } from '../../locationService';
import { AIClient } from '../../../types/decision-service/decision-service.types';
import { validateDecision } from '../../../utils/prompt-utils';
import { createError } from '../../../utils/error-utils';

/**
 * Service for generating AI-driven contextual decisions
 */
export class AIDecisionGenerator implements DecisionGenerator {
  private aiClient: AIClient;
  private historyManager: DecisionHistoryManager;
  private maxOptionsPerDecision: number;
  
  /**
   * Initialize the decision generator
   * @param aiClient AI service client
   * @param historyManager Decision history manager
   * @param maxOptionsPerDecision Maximum number of options per decision
   */
  constructor(
    aiClient: AIClient,
    historyManager: DecisionHistoryManager,
    maxOptionsPerDecision: number
  ) {
    this.aiClient = aiClient;
    this.historyManager = historyManager;
    this.maxOptionsPerDecision = maxOptionsPerDecision;
  }
  
  /**
   * Generates a decision based on the current narrative state
   * @param narrativeState Current narrative state
   * @param character Player character information
   * @returns Promise resolving to a decision response
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character
  ): Promise<DecisionResponse> {
    // Check rate limiting
    if (
      this.aiClient.getRateLimitRemaining() <= 0 && 
      Date.now() < this.aiClient.getRateLimitResetTime()
    ) {
      throw createError(
        'RATE_LIMITED', 
        'Rate limit exceeded. Try again later.', 
        true
      );
    }
    
    try {
      // Build the decision prompt from narrative state and character
      const prompt = this.buildDecisionPrompt(narrativeState, character);
      
      // Make the API request
      const response = await this.aiClient.makeRequest<DecisionResponse>(prompt);
      
      // Validate and return the decision
      return validateDecision(response, this.maxOptionsPerDecision);
    } catch (error) {
      // Handle and standardize errors
      if (error instanceof Error) {
        throw createError(
          'AI_SERVICE_ERROR', 
          error.message, 
          error.name !== 'AIServiceError' // Only retry if not already a handled error
        );
      }
      
      throw createError(
        'UNKNOWN_ERROR', 
        'An unknown error occurred while generating a decision', 
        false
      );
    }
  }
  
  /**
   * Builds a decision prompt for the AI service
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @returns Formatted decision prompt
   */
  private buildDecisionPrompt(
    narrativeState: NarrativeState,
    character: Character
  ): DecisionPrompt {
    // Extract recent narrative content
    let narrativeContext = '';
    
    if (narrativeState.currentStoryPoint) {
      narrativeContext = narrativeState.currentStoryPoint.content;
    } else if (narrativeState.narrativeHistory.length > 0) {
      // Get the last few narrative entries
      const recentHistory = narrativeState.narrativeHistory.slice(-3);
      narrativeContext = recentHistory.join('\n\n');
    }
    
    // Extract location information
    const location: LocationType | string = narrativeState.currentStoryPoint?.locationChange || 'Unknown';
    
    // Extract character traits
    const traits: string[] = [];
    
    // Add traits based on character attributes
    if (character.attributes.bravery >= 8) traits.push('brave');
    if (character.attributes.bravery <= 3) traits.push('cautious');
    if (character.attributes.speed >= 8) traits.push('quick');
    if (character.attributes.gunAccuracy >= 8) traits.push('sharpshooter');
    
    // Map relationships (simplified for now)
    const relationships: Record<string, string> = {};
    
    // Get recent events from narrative history
    const recentEvents = narrativeState.narrativeHistory
      .slice(-5)
      .map(entry => entry.substring(0, 100) + '...'); // Truncate for brevity
    
    // Extract recent decisions for context
    const previousDecisions = this.historyManager.getDecisionHistory().slice(-3).map(decision => ({
      prompt: decision.prompt,
      choice: decision.choice,
      outcome: decision.outcome
    }));
    
    // Combine everything into the decision prompt
    return {
      narrativeContext,
      characterInfo: {
        traits,
        history: character.isNPC ? 'NPC Character' : 'Player Character',
        relationships
      },
      gameState: {
        location,
        currentScene: narrativeState.currentStoryPoint?.id || 'unknown',
        recentEvents
      },
      previousDecisions
    };
  }
}

export default AIDecisionGenerator;
