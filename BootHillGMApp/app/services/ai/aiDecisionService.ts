/**
 * AI Decision Service
 * 
 * Enhances the existing decision system with AI-driven contextual decisions
 * that analyze narrative content and game state to present decisions at
 * appropriate moments.
 * 
 * This service:
 * 1. Detects decision points in narrative content
 * 2. Communicates with external AI services
 * 3. Generates high-quality narrative decisions
 * 4. Formats them for the existing PlayerDecisionCard component
 */

import { DecisionDetectionResult } from '../../types/ai-service.types';
import { NarrativeState, PlayerDecision } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { GameState } from '../../types/gameState';

// Import constants
import { 
  DEFAULT_DECISION_THRESHOLD,
  MIN_DECISION_INTERVAL,
  DEFAULT_MAX_OPTIONS,
  MAX_DECISION_HISTORY
} from './utils/aiDecisionConstants';

// Import types
import { 
  AIDecisionServiceConfig, 
  DecisionHistoryEntry,
  ApiRateLimitData
} from './types/aiDecisionTypes';

// Import utilities
import { detectDecisionPoint } from './utils/aiDecisionDetector';
import { 
  buildDecisionPrompt, 
  aiResponseToPlayerDecision, 
  generateFallbackDecision 
} from './utils/aiDecisionGenerator';

// Import API client
import { callAIService } from './clients/aiServiceClient';

/**
 * Service for AI-driven contextual decision generation
 * 
 * Enhances the existing decision system with sophisticated
 * AI-powered decision detection and generation.
 */
export class AIDecisionService {
  private config: AIDecisionServiceConfig;
  private lastDecisionTime: number = 0;
  private rateLimitData: ApiRateLimitData = {
    remaining: 100,
    resetTime: 0
  };
  
  // Cache the most recent decisions for context
  private decisionsHistory: DecisionHistoryEntry[] = [];
  
  /**
   * Initialize the AI decision service
   * 
   * @param config Service configuration options
   */
  constructor(config?: Partial<AIDecisionServiceConfig>) {
    // Merge provided config with defaults
    this.config = {
      minDecisionInterval: MIN_DECISION_INTERVAL,
      relevanceThreshold: DEFAULT_DECISION_THRESHOLD,
      maxOptionsPerDecision: DEFAULT_MAX_OPTIONS,
      apiConfig: {
        apiKey: process.env.AI_SERVICE_API_KEY || '',
        endpoint: process.env.AI_SERVICE_ENDPOINT || '',
        modelName: process.env.AI_SERVICE_MODEL || 'gpt-4',
        maxRetries: 3,
        timeout: 15000,
        rateLimit: 10
      },
      ...config
    };
    
    // Validate configuration
    this.validateConfig();
  }
  
  /**
   * Validate the service configuration
   * 
   * @throws Error if configuration is invalid
   */
  private validateConfig(): void {
    if (!this.config.apiConfig.apiKey) {
      console.warn('AI_SERVICE_API_KEY is not set. Decision service will fall back to templates.');
    }
    
    if (!this.config.apiConfig.endpoint) {
      console.warn('AI_SERVICE_ENDPOINT is not set. Decision service will fall back to templates.');
    }
  }
  
  /**
   * Detect if the current narrative context should trigger a decision point
   * 
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @param gameState Current game state (optional)
   * @returns Detection result with score and reasoning
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: GameState
  ): DecisionDetectionResult {
    return detectDecisionPoint(
      narrativeState, 
      character, 
      this.config, 
      this.lastDecisionTime, 
      gameState
    );
  }
  
  /**
   * Generate a decision using the AI service
   * 
   * @param narrativeState Current narrative state
   * @param character Player character
   * @param gameState Optional game state for additional context
   * @returns Promise resolving to PlayerDecision
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character,
    gameState?: GameState
  ): Promise<PlayerDecision> {
    // Record this decision time
    this.lastDecisionTime = Date.now();
    
    try {
      // Check if we have API configuration
      if (!this.config.apiConfig.apiKey || !this.config.apiConfig.endpoint) {
        // Fall back to template-based generation
        return generateFallbackDecision(narrativeState, character, gameState);
      }
      
      // Build decision prompt
      const prompt = buildDecisionPrompt(narrativeState, character, this.decisionsHistory, gameState);
      
      // Call the AI service
      const aiResponse = await callAIService(prompt, this.config, this.rateLimitData);
      
      // Convert AI response to PlayerDecision
      return aiResponseToPlayerDecision(
        aiResponse, 
        this.config, 
        narrativeState.currentStoryPoint?.locationChange
      );
      
    } catch (error) {
      console.error('Error generating AI decision:', error);
      
      // Fall back to template-based generation on error
      return generateFallbackDecision(narrativeState, character, gameState);
    }
  }
  
  /**
   * Record a player's decision for future context
   * 
   * @param decisionId ID of the decision
   * @param optionId ID of the selected option
   * @param outcome Narrative outcome
   */
  public recordDecision(
    decisionId: string,
    optionId: string,
    outcome: string
  ): void {
    // Find the original decision prompt (in a real implementation, this would be cached)
    const prompt = "Decision prompt"; // Placeholder
    
    // Add to history
    this.decisionsHistory.push({
      prompt,
      choice: optionId,
      outcome,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.decisionsHistory.length > MAX_DECISION_HISTORY) {
      this.decisionsHistory.shift();
    }
  }
}

export default AIDecisionService;
