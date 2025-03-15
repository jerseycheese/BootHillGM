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
  DecisionImportance,
} from '../../types/narrative.types';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { buildComprehensiveContextExtension } from '../../utils/decisionPromptBuilder';
import { LocationType } from '../locationService';
import { v4 as uuidv4 } from 'uuid';
import { evaluateDecisionQuality } from '../../utils/decisionQualityAssessment';
import { processDecisionQuality, generateFeedbackEnhancedPrompt } from '../../utils/decisionFeedbackSystem';

// Decision Detection Configuration
const DEFAULT_DECISION_THRESHOLD = 0.65;
const MIN_DECISION_INTERVAL = 30 * 1000; // 30 seconds minimum between decisions

// Decision service configuration
export interface ContextualDecisionServiceConfig {
  // Minimum time between automatic decisions (ms)
  minDecisionInterval: number;
  
  // Threshold score to present a decision (0-1)
  relevanceThreshold: number;
  
  // Maximum number of options per decision
  maxOptionsPerDecision: number;
  
  // Whether to use the feedback system for prompt enhancement
  useFeedbackSystem: boolean;
}

/**
 * Result from the decision point detection process
 */
export interface DecisionDetectionResult {
  /** Should a decision be presented? */
  shouldPresent: boolean;
  
  /** Detection score (0-1) */
  score: number;
  
  /** Reason for the detection result */
  reason: string;
}

/**
 * Extended GameState with predicted properties we use for decision scoring
 * This interface represents the expected game state structure used by the decision service
 */
interface ExtendedGameState extends GameState {
  combat?: {
    active: boolean;
  };
  activeEvent?: boolean;
}

/**
 * Service for AI-driven contextual decision generation
 */
export class ContextualDecisionService {
  private config: ContextualDecisionServiceConfig;
  private lastDecisionTime: number = 0;
  
  // Cache of recent decisions for context
  private decisionsHistory: Array<{
    prompt: string;
    choice: string;
    outcome: string;
    timestamp: number;
  }> = [];
  
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
    gameState?: GameState
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
    const score = this.calculateDecisionScore(narrativeState, character, gameState as ExtendedGameState);
    
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
        this.lastDecisionTime = Date.now();
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
      const processedResponse = this.processResponse(responseText);
      
      // Convert to PlayerDecision
      if (processedResponse) {
        const decision = this.toPlayerDecision(
          processedResponse,
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
        
        // Record quality metrics in the feedback system
        processDecisionQuality(decision, narrativeState.narrativeContext);
        
        // If quality is unacceptable and we're not forcing generation, try again or fall back
        if (!qualityEvaluation.acceptable && !forceGeneration) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Generated decision did not meet quality standards. Using fallback...');
          }
          
          // For simplicity, we'll use the fallback decision instead of recursive retries
          // In a full implementation, you might want to try generating again with an improved prompt
          return this.generateFallbackDecision(narrativeState, character);
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
      return this.generateFallbackDecision(narrativeState, character);
    }
  }
  
  /**
   * Build a decision prompt for the AI model
   * 
   * @param narrativeState Current narrative state
   * @param character Player character
   * @param _gameState Optional game state for additional context
   * @returns Formatted prompt string
   */
  private buildDecisionPrompt(
    narrativeState: NarrativeState,
    character: Character,
    _gameState?: GameState
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
    
    // Extract location information
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
    
    // Add decision history context if available
    const decisionsContext = narrativeState.narrativeContext
      ? buildComprehensiveContextExtension(narrativeState.narrativeContext)
      : '';
    
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
   * Process the AI response into a structured object
   * 
   * @param responseText Response text from the AI
   * @returns Processed decision object or null if parsing fails
   */
  private processResponse(responseText: string): Record<string, unknown> | null {
    try {
      // Remove any markdown code block delimiters
      const cleanedText = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Parse the JSON
      return JSON.parse(cleanedText) as Record<string, unknown>;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Only log the raw response in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Raw response:', responseText);
      }
      return null;
    }
  }
  
  /**
   * Generate a fallback decision when AI generation fails
   * 
   * @param narrativeState Current narrative state
   * @param _character Player character
   * @returns A simple default decision
   */
  private generateFallbackDecision(
    narrativeState: NarrativeState,
    _character: Character
  ): PlayerDecision {
    // Character param kept for future implementation
    
    return {
      id: `fallback-${uuidv4()}`,
      prompt: 'What would you like to do?',
      timestamp: Date.now(),
      location: narrativeState.currentStoryPoint?.locationChange,
      options: [
        {
          id: `option1-${uuidv4()}`,
          text: 'Proceed cautiously',
          impact: 'Taking a careful approach may reveal more information.',
          tags: ['cautious']
        },
        {
          id: `option2-${uuidv4()}`,
          text: 'Take immediate action',
          impact: 'Bold moves can yield faster results but may be riskier.',
          tags: ['brave']
        },
        {
          id: `option3-${uuidv4()}`,
          text: 'Look for another approach',
          impact: 'There might be a less obvious but advantageous solution.',
          tags: ['resourceful']
        }
      ],
      context: 'Based on the current situation',
      importance: 'moderate',
      characters: [],
      aiGenerated: true
    };
  }
  
  /**
   * Convert a raw response object to a PlayerDecision
   * 
   * @param response Processed response from AI
   * @param location Current location
   * @returns PlayerDecision object
   */
  private toPlayerDecision(
    response: Record<string, unknown>,
    location?: LocationType
  ): PlayerDecision {
    // Validate importance
    const validImportance = ['critical', 'significant', 'moderate', 'minor'];
    const importance: DecisionImportance = 
      (response.importance as string) && validImportance.includes(response.importance as string)
        ? response.importance as DecisionImportance
        : 'moderate';
    
    // Generate option IDs if missing
    const options = ((response.options as unknown[]) || []).map(option => ({
      id: uuidv4(),
      text: (option as Record<string, unknown>).text as string || 'Option',
      impact: (option as Record<string, unknown>).impact as string || 'Unknown impact',
      tags: Array.isArray((option as Record<string, unknown>).tags) 
        ? (option as Record<string, unknown>).tags as string[] 
        : []
    }));
    
    // Limit options based on config
    const limitedOptions = options.slice(0, this.config.maxOptionsPerDecision);
    
    // Ensure we have at least 2 options
    if (limitedOptions.length < 2) {
      limitedOptions.push({
        id: uuidv4(),
        text: 'Continue forward',
        impact: 'Proceed with the current course of action.',
        tags: ['default']
      });
    }
    
    return {
      id: `decision-${uuidv4()}`,
      prompt: (response.prompt as string) || 'What would you like to do?',
      timestamp: Date.now(),
      location,
      options: limitedOptions,
      context: (response.context as string) || 'Based on narrative context',
      importance,
      characters: [],
      aiGenerated: true
    };
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