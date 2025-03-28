/**
 * AI-Driven Contextual Decision Service
 * 
 * This service analyzes narrative context to intelligently generate
 * contextually appropriate decision points for players, replacing
 * the keyword-based approach with sophisticated AI analysis.
 */

import { getAIModel } from '../../utils/ai/aiConfig';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { 
  NarrativeState,
  PlayerDecision,
} from '../../types/narrative.types';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { buildComprehensiveContextExtension } from '../../utils/decisionPromptBuilder';
import { generateFeedbackEnhancedPrompt } from '../../utils/decisionFeedbackSystem';
import { evaluateDecisionQuality } from '../../utils/decisionQualityAssessment';

// Import the separated components
import { 
  ContextualDecisionServiceConfig,
  DecisionDetectionResult,
  DEFAULT_DECISION_THRESHOLD,
  MIN_DECISION_INTERVAL,
  DecisionHistoryEntry
} from './contextualDecision.types';
import { DecisionDetector } from './decisionDetector';
import { processResponse, toPlayerDecision } from './decisionResponseProcessor';
import { generateFallbackDecision } from './fallbackDecisionGenerator';
import { extendGameStateForContextual } from './utils/stateExtender';
import { hasNarrativeState } from './utils/stateTypeGuards';

/**
 * Service for AI-driven contextual decision generation
 */
export class ContextualDecisionService {
  private config: ContextualDecisionServiceConfig;
  private detector: DecisionDetector;
  
  // Cache of recent decisions for context
  private decisionsHistory: DecisionHistoryEntry[] = [];
  
  /**
   * Initialize the contextual decision service
   * @param config Optional service configuration
   */
  constructor(config?: Partial<ContextualDecisionServiceConfig>) {
    // Default configuration values
    this.config = {
      minDecisionInterval: MIN_DECISION_INTERVAL,
      relevanceThreshold: DEFAULT_DECISION_THRESHOLD,
      maxOptionsPerDecision: 4,
      useFeedbackSystem: true,
      ...config
    };
    
    // Initialize the decision detector
    this.detector = new DecisionDetector(this.config);
  }
  
  /**
   * Detects if a decision point should be presented
   * 
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @param gameState Additional game state for context
   * @returns Decision detection result
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: GameState
  ): DecisionDetectionResult {
    // Use the contextual-specific extender with type safety
    const extendedState = extendGameStateForContextual(gameState);
    
    // Cast the extended state to the expected type in contextualDecision.types.ts
    const compatibleExtendedState = {
      ...extendedState,
      combat: {
        ...extendedState.combat,
        active: extendedState.combat.isActive // Add the 'active' property expected by the detector
      }
    };
    
    return this.detector.detectDecisionPoint(narrativeState, character, compatibleExtendedState);
  }
  
  /**
   * Generate a contextually appropriate decision
   * 
   * @param narrativeState Current narrative state
   * @param character Player character information
   * @param gameState Optional game state for additional context
   * @param forceGeneration Whether to skip decision detection
   * @returns Promise resolving to a PlayerDecision
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: GameState,
    forceGeneration: boolean = false
  ): Promise<PlayerDecision | null> {
    try {
      // Only update the decision time if not forced
      if (!forceGeneration) {
        this.detector.updateLastDecisionTime();
      }
      
      // Build decision prompt
      let prompt = this.buildDecisionPrompt(narrativeState, character, gameState);
      
      // If using feedback system, enhance the prompt with feedback
      if (this.config.useFeedbackSystem) {
        prompt = generateFeedbackEnhancedPrompt(prompt);
      }
      
      // Call the AI model
      const model = getAIModel();
      const result = await retryWithExponentialBackoff(() =>
        model.generateContent(prompt)
      );
      
      // Process the result
      const responseText = result.response.text();
      const processedResponse = processResponse(responseText);
      
      // Convert to PlayerDecision
      if (processedResponse) {
        const decision = toPlayerDecision(
          processedResponse,
          this.config,
          narrativeState.currentStoryPoint?.locationChange
        );
        
        // Assess the quality of the generated decision
        const qualityEvaluation = evaluateDecisionQuality(
          decision, 
          narrativeState.narrativeContext
        );
        
        // Log quality information for development
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`Decision quality score: ${qualityEvaluation.score}`);
          if (qualityEvaluation.suggestions.length > 0) {
            console.debug('Improvement suggestions:', qualityEvaluation.suggestions);
          }
        }
        
        // Quality metrics are recorded as part of the evaluation
        
        // If quality is unacceptable and we're not forcing generation, try again or fall back
        if (!qualityEvaluation.acceptable && !forceGeneration) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Generated decision did not meet quality standards. Using fallback...');
          }
          
          // For simplicity, we'll use the fallback decision instead of recursive retries
          return generateFallbackDecision(narrativeState, character);
        }
        
        // Add quality metadata to the decision
        const decisionWithMeta = decision as PlayerDecision & { 
          qualityScore: number; 
          qualityIssues?: string[];
        };
        decisionWithMeta.qualityScore = qualityEvaluation.score;
        if (qualityEvaluation.suggestions.length > 0) {
          decisionWithMeta.qualityIssues = qualityEvaluation.suggestions;
        }
        
        return decision;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating AI decision:', error);
      return generateFallbackDecision(narrativeState, character);
    }
  }
  
  /**
   * Build a decision prompt for the AI model
   * 
   * @param narrativeState Current narrative state
   * @param character Player character
   * @param gameState Optional game state for additional context
   * @returns Formatted prompt string
   */
  private buildDecisionPrompt(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: GameState
  ): string {
    // Extract recent narrative content
    let narrativeContext = '';
    
    if (narrativeState.currentStoryPoint) {
      narrativeContext = narrativeState.currentStoryPoint.content;
    } else if (narrativeState.narrativeHistory.length > 0) {
      // Get the last few narrative entries
      const recentHistory = narrativeState.narrativeHistory.slice(-3);
      narrativeContext = recentHistory.join('\n\n');
    }
    
    // Extract location information with safe type checking
    const location = narrativeState.currentStoryPoint?.locationChange 
      ? narrativeState.currentStoryPoint.locationChange
      : { type: 'unknown' as const };
    
    // Extract character traits
    const traits: string[] = [];
    
    // Add traits based on character attributes
    if (character.attributes.bravery >= 8) traits.push('brave');
    if (character.attributes.bravery <= 3) traits.push('cautious');
    if (character.attributes.speed >= 8) traits.push('quick');
    if (character.attributes.gunAccuracy >= 8) traits.push('sharpshooter');
    
    // Extract recent decisions for context
    const previousDecisions = this.decisionsHistory.slice(-3).map(decision => (
      `Prompt: ${decision.prompt}\nChoice: ${decision.choice}\nOutcome: ${decision.outcome}`
    )).join('\n\n');
    
    // Add decision history context if available with proper type checking
    const decisionsContext = narrativeState.narrativeContext
      ? buildComprehensiveContextExtension(narrativeState.narrativeContext)
      : '';
    
    // Merge in game state context if available
    let gameStateContext = '';
    if (gameState && hasNarrativeState(gameState)) {
      const extendedState = extendGameStateForContextual(gameState);
      // Highlight important game state elements
      gameStateContext = `
Current player status: ${extendedState.combat.isActive ? 'In Combat' : 'Exploring'}
Location: ${extendedState.location?.type || 'Unknown'}
Game progress: ${extendedState.gameProgress}%
`;
    }
    
    // Combine into a single prompt
    return `
You are an AI Game Master for a Western-themed RPG called Boot Hill. Your job is to generate contextually appropriate decision points for the player based on the narrative context.

Generate a decision point that:
1. Feels natural given the current narrative flow
2. Includes 3-4 distinct and meaningful options
3. Connects to the character's traits and history
4. Maintains the western theme and setting
5. Has appropriate importance and impact

Current narrative context:
${narrativeContext}

Character information:
Traits: ${traits.join(', ')}
Attributes: Speed ${character.attributes.speed}, Gun Accuracy ${character.attributes.gunAccuracy}, Bravery ${character.attributes.bravery}

Location type: ${typeof location === 'string' ? location : location.type}
${location.type === 'town' && 'name' in location ? `Town: ${location.name}` : ''}
${location.type === 'landmark' && 'name' in location ? `Landmark: ${location.name}` : ''}
${location.type === 'wilderness' && 'description' in location ? `Description: ${location.description}` : ''}

${gameStateContext}
${previousDecisions ? `Previous decisions:\n${previousDecisions}` : ''}
${decisionsContext}

Respond with a player decision in JSON format:
{
  "prompt": "The decision prompt text to show the player",
  "options": [
    {
      "text": "Option 1 text to display",
      "impact": "Brief description of potential impact",
      "tags": ["tag1", "tag2"]
    },
    {
      "text": "Option 2 text to display",
      "impact": "Brief description of potential impact",
      "tags": ["tag1", "tag3"]
    }
  ],
  "importance": "critical|significant|moderate|minor"
}

Only include the JSON in your response and make sure it is valid.
`;
  }
  
  /**
   * Record a player's decision for future context
   * 
   * @param decisionPrompt Decision prompt text
   * @param optionText Selected option text
   * @param outcome Narrative outcome
   */
  public recordDecision(
    decisionPrompt: string,
    optionText: string,
    outcome: string
  ): void {
    // Add to history
    this.decisionsHistory.push({
      prompt: decisionPrompt,
      choice: optionText,
      outcome,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.decisionsHistory.length > 10) {
      this.decisionsHistory.shift();
    }
  }
  
  /**
   * Returns the decision history for testing purposes
   * @internal This method should only be used for testing
   */
  public getDecisionsHistoryForTesting(): DecisionHistoryEntry[] {
    return [...this.decisionsHistory];
  }
}

// Create singleton instance
let contextualDecisionServiceInstance: ContextualDecisionService | null = null;

/**
 * Get the singleton instance of the contextual decision service
 * @param config Optional service configuration
 * @returns ContextualDecisionService instance
 */
export function getContextualDecisionService(
  config?: Partial<ContextualDecisionServiceConfig>
): ContextualDecisionService {
  if (!contextualDecisionServiceInstance) {
    contextualDecisionServiceInstance = new ContextualDecisionService(config);
  }
  return contextualDecisionServiceInstance;
}

export default ContextualDecisionService;
