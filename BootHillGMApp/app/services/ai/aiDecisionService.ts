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

import { AIServiceConfig, DecisionPrompt, DecisionResponse, DecisionDetectionResult, AIServiceError } from '../../types/ai-service.types';
import { NarrativeState, PlayerDecision, PlayerDecisionOption, DecisionImportance } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { LocationType } from '../locationService';
import { GameState } from '../../types/gameState';

// Default threshold for presenting a decision
const DEFAULT_DECISION_THRESHOLD = 0.65;

// Minimum time between decisions in milliseconds (30 seconds)
const MIN_DECISION_INTERVAL = 30 * 1000;

/**
 * Configuration for the AI decision service
 */
export interface AIDecisionServiceConfig {
  minDecisionInterval: number;
  relevanceThreshold: number;
  maxOptionsPerDecision: number;
  apiConfig: AIServiceConfig;
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
 * 
 * Enhances the existing decision system with sophisticated
 * AI-powered decision detection and generation.
 */
export class AIDecisionService {
  private config: AIDecisionServiceConfig;
  private lastDecisionTime: number = 0;
  private rateLimitRemaining: number = 100;
  private rateLimitResetTime: number = 0;
  
  // Cache the most recent decisions for context
  private decisionsHistory: Array<{
    prompt: string;
    choice: string;
    outcome: string;
    timestamp: number;
  }> = [];
  
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
      maxOptionsPerDecision: 4,
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
   * @param _gameState Current game state (optional, unused)
   * @returns Detection result with score and reasoning
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    character: Character,
    _gameState?: GameState
  ): DecisionDetectionResult {
    // Don't present decisions too frequently
    if (Date.now() - this.lastDecisionTime < this.config.minDecisionInterval) {
      return {
        shouldPresent: false,
        score: 0,
        reason: 'Too soon since last decision'
      };
    }
    
    // Calculate decision score
    const score = this.calculateDecisionScore(narrativeState, character, _gameState as ExtendedGameState);
    
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
   * Calculate a score representing how appropriate it is to present a decision
   * 
   * Higher scores mean a decision is more appropriate at this moment
   * 
   * @param narrativeState Current narrative state
   * @param character Player character data
   * @param _gameState Current game state (optional)
   * @returns Score from 0-1
   */
  private calculateDecisionScore(
    narrativeState: NarrativeState,
    character: Character,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _gameState?: ExtendedGameState
  ): number {
    // Start with a base score
    let score = 0.4;
    
    // Get the current story point
    const currentPoint = narrativeState.currentStoryPoint;
    
    // Increase score for dialogue-heavy content
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
    
    // If we have a game state, check for additional factors
    if (_gameState) {
      // Increase score during downtime (not in combat)
      if (!_gameState.combat?.active) {
        score += 0.1;
      }
      
      // Decrease score during active gameplay sequences
      if (_gameState.activeEvent) {
        score -= 0.15;
      }
    }
    
    // Factor in time since last decision
    const timeFactor = Math.min(
      (Date.now() - this.lastDecisionTime) / (5 * this.config.minDecisionInterval),
      1.0
    );
    score += timeFactor * 0.25;
    
    // Ensure score is within 0-1 range
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Generate a decision using the AI service
   * 
   * @param narrativeState Current narrative state
   * @param character Player character
   * @param _gameState Optional game state for additional context (unused)
   * @returns Promise resolving to PlayerDecision
   * @throws AIServiceError on failure
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character,
    _gameState?: GameState
  ): Promise<PlayerDecision> {
    // Record this decision time
    this.lastDecisionTime = Date.now();
    
    try {
      // Check if we have API configuration
      if (!this.config.apiConfig.apiKey || !this.config.apiConfig.endpoint) {
        // Fall back to template-based generation
        return this.generateFallbackDecision(narrativeState, character, _gameState);
      }
      
      // Build decision prompt - pass both character and _gameState as they're used in the method
      const prompt = this.buildDecisionPrompt(narrativeState, character, _gameState);
      
      // Call the AI service
      const aiResponse = await this.callAIService(prompt);
      
      // Convert AI response to PlayerDecision
      return this.aiResponseToPlayerDecision(aiResponse, narrativeState.currentStoryPoint?.locationChange);
      
    } catch (error) {
      console.error('Error generating AI decision:', error);
      
      // Fall back to template-based generation on error
      return this.generateFallbackDecision(narrativeState, character, _gameState);
    }
  }
  
  /**
   * Call the AI service with the formatted prompt
   * 
   * @param prompt Formatted decision prompt
   * @returns Promise resolving to DecisionResponse
   * @throws AIServiceError on failure
   */
  private async callAIService(prompt: DecisionPrompt): Promise<DecisionResponse> {
    // Check rate limits
    if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitResetTime) {
      throw this.createError('RATE_LIMITED', 'Rate limit exceeded', true);
    }
    
    try {
      // Make the API request
      const response = await this.makeAPIRequest(prompt);
      
      // Process and return the response
      return this.processResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(
          'AI_SERVICE_ERROR', 
          error.message, 
          this.isRetryableError(error)
        );
      }
      
      throw this.createError(
        'UNKNOWN_ERROR', 
        'An unknown error occurred', 
        false
      );
    }
  }
  
  /**
   * Build a decision prompt for the AI service
   * 
   * @param narrativeState Current narrative state
   * @param character Player character
   * @param _gameState Optional game state for additional context (unused)
   * @returns Formatted decision prompt
   */
  private buildDecisionPrompt(
    narrativeState: NarrativeState,
    character: Character,
    _gameState?: GameState
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
    
    // Map relationships (simplified)
    const relationships: Record<string, string> = {};
    
    // Get recent events
    const recentEvents = narrativeState.narrativeHistory
      .slice(-5)
      .map(entry => entry.substring(0, 100) + '...'); // Truncate for brevity
    
    // Extract recent decisions for context
    const previousDecisions = this.decisionsHistory.slice(-3).map(decision => ({
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
  
  /**
   * Make the API request to the AI service
   * 
   * @param prompt Formatted decision prompt
   * @returns Raw API response
   */
  private async makeAPIRequest(prompt: DecisionPrompt): Promise<Record<string, unknown>> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < this.config.apiConfig.maxRetries) {
      try {
        // Create the API request
        const response = await fetch(this.config.apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.apiConfig.modelName,
            messages: [
              {
                role: "system",
                content: `You are the game master for a western-themed RPG called Boot Hill. Your job is to generate contextually 
                          appropriate decision points for the player based on the narrative context. Each decision should:
                          1. Feel natural within the western setting
                          2. Have 3-4 distinct and meaningful options
                          3. Connect to the character's traits and history
                          4. Consider the current narrative context
                          
                          Respond in JSON format with the following structure:
                          {
                            "decisionId": "unique-id",
                            "prompt": "The decision prompt text to show the player",
                            "options": [
                              {
                                "id": "option-1",
                                "text": "Option text to display",
                                "confidence": 0.8,
                                "traits": ["brave", "quick"],
                                "potentialOutcomes": ["Might lead to a gunfight", "Could earn respect"],
                                "impact": "Brief description of impact"
                              }
                            ],
                            "relevanceScore": 0.9,
                            "metadata": {
                              "narrativeImpact": "Description of narrative impact",
                              "themeAlignment": "How well it fits the western theme",
                              "pacing": "slow|medium|fast",
                              "importance": "critical|significant|moderate|minor"
                            }
                          }`
              },
              {
                role: "user",
                content: `Generate a contextually appropriate decision point based on the following information:
                          
                          NARRATIVE CONTEXT:
                          ${prompt.narrativeContext}
                          
                          CHARACTER INFORMATION:
                          Traits: ${prompt.characterInfo.traits.join(', ')}
                          History: ${prompt.characterInfo.history}
                          
                          GAME STATE:
                          Location: ${typeof prompt.gameState.location === 'string' 
                                      ? prompt.gameState.location 
                                      : prompt.gameState.location.type}
                          Current Scene: ${prompt.gameState.currentScene}
                          Recent Events: ${prompt.gameState.recentEvents.join('; ')}
                          
                          PREVIOUS DECISIONS:
                          ${prompt.previousDecisions.map(d => 
                            `Prompt: ${d.prompt}\nChoice: ${d.choice}\nOutcome: ${d.outcome}`
                          ).join('\n\n')}
                          
                          Remember to maintain the western theme and appropriate tone.`
              }
            ]
          }),
          signal: AbortSignal.timeout(this.config.apiConfig.timeout)
        });
        
        // Update rate limit tracking
        this.updateRateLimits(response.headers);
        
        // Handle error responses
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }
        
        // Parse and return the response
        return await response.json();
      } catch (error) {
        // Track the error for potential retry
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;
        
        // Check if we should retry
        if (!this.isRetryableError(lastError) || attempts >= this.config.apiConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff before retry
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
        );
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to make API request after multiple attempts');
  }
  
  /**
   * Process the AI response into a structured decision response
   * 
   * @param response Raw API response
   * @returns Structured decision response
   */
  private processResponse(response: Record<string, unknown>): DecisionResponse {
    let parsedResponse: Record<string, unknown>;
    
    try {
      // If the API returns a content field with JSON string
      if (response.choices && Array.isArray(response.choices) && response.choices[0] && response.choices[0].message) {
        const content = (response.choices[0].message as Record<string, unknown>).content as string;
        parsedResponse = JSON.parse(content);
      } 
      // If the API directly returns structured JSON
      else if (response.decision) {
        parsedResponse = response.decision as Record<string, unknown>;
      }
      // Fallback for unknown formats
      else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI service response');
    }
    
    // Get metadata with typechecking
    const metadata = (parsedResponse.metadata as Record<string, unknown>) || {};
    
    // Cast pacing to the correct type
    const rawPacing = metadata.pacing as string || 'medium';
    const pacing: 'slow' | 'medium' | 'fast' = 
      (rawPacing === 'slow' || rawPacing === 'medium' || rawPacing === 'fast') 
        ? rawPacing 
        : 'medium';
    
    // Cast importance to the correct type
    const rawImportance = metadata.importance as string || 'moderate';
    const importance: DecisionImportance = 
      (rawImportance === 'critical' || rawImportance === 'significant' || 
       rawImportance === 'moderate' || rawImportance === 'minor')
        ? rawImportance as DecisionImportance
        : 'moderate';
    
    // Validate and standardize the response
    const processedResponse: DecisionResponse = {
      decisionId: parsedResponse.decisionId as string || `decision-${Date.now()}`,
      prompt: parsedResponse.prompt as string || 'What do you want to do?',
      options: (parsedResponse.options as [] || []).map((option: Record<string, unknown>) => ({
        id: option.id as string || `option-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: option.text as string || 'Undefined option',
        confidence: option.confidence as number || 0.5,
        traits: option.traits as string[] || [],
        potentialOutcomes: option.potentialOutcomes as string[] || [],
        impact: option.impact as string || 'Unknown impact'
      })),
      relevanceScore: parsedResponse.relevanceScore as number || 0.5,
      metadata: {
        narrativeImpact: metadata.narrativeImpact as string || '',
        themeAlignment: metadata.themeAlignment as string || '',
        pacing,
        importance
      }
    };
    
    // Ensure we have at least 2 options
    if (processedResponse.options.length < 2) {
      // Add fallback options if needed
      if (processedResponse.options.length === 0) {
        processedResponse.options.push({
          id: `fallback-1-${Date.now()}`,
          text: 'Continue forward cautiously',
          confidence: 0.7,
          traits: ['cautious'],
          potentialOutcomes: ['Might avoid danger'],
          impact: 'Slow but safe approach'
        });
      }
      
      if (processedResponse.options.length === 1) {
        processedResponse.options.push({
          id: `fallback-2-${Date.now()}`,
          text: 'Take decisive action',
          confidence: 0.7,
          traits: ['brave'],
          potentialOutcomes: ['Could lead to confrontation'],
          impact: 'Bold but potentially risky'
        });
      }
    }
    
    // Limit the number of options
    if (processedResponse.options.length > this.config.maxOptionsPerDecision) {
      processedResponse.options = processedResponse.options
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.config.maxOptionsPerDecision);
    }
    
    return processedResponse;
  }
  
  /**
   * Convert an AI response to a PlayerDecision for use with the existing system
   * 
   * @param aiResponse Decision response from the AI service
   * @param location Current location (optional)
   * @returns PlayerDecision compatible with the existing system
   */
  private aiResponseToPlayerDecision(
    aiResponse: DecisionResponse,
    location?: LocationType
  ): PlayerDecision {
    // Map AI response options to PlayerDecisionOption format
    const playerOptions: PlayerDecisionOption[] = aiResponse.options.map(option => ({
      id: option.id,
      text: option.text,
      impact: option.impact,
      tags: option.traits // Use the traits as tags
    }));
    
    // Create the PlayerDecision object
    return {
      id: aiResponse.decisionId,
      prompt: aiResponse.prompt,
      timestamp: Date.now(),
      location,
      options: playerOptions,
      context: 'AI-generated based on narrative context',
      importance: aiResponse.metadata.importance,
      characters: [], // This could be populated if AI returns character data
      aiGenerated: true
    };
  }
  
  /**
   * Generate a fallback decision when AI service is unavailable
   * 
   * @param narrativeState Current narrative state
   * @param _character Player character (unused)
   * @param _gameState Optional game state (unused)
   * @returns PlayerDecision using templates instead of AI
   */
  private generateFallbackDecision(
    narrativeState: NarrativeState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _character: Character,
    _gameState?: GameState
  ): PlayerDecision {
    // In a real implementation, this would use your existing template system
    // For now, create a simple fallback decision
    
    const decisionOptions: PlayerDecisionOption[] = [
      {
        id: `fallback-1-${Date.now()}`,
        text: 'Proceed with caution',
        impact: 'Taking a careful approach could reveal more information but might take longer.',
        tags: ['cautious']
      },
      {
        id: `fallback-2-${Date.now()}`,
        text: 'Take immediate action',
        impact: 'Being decisive could lead to quick resolution but might be risky.',
        tags: ['brave']
      },
      {
        id: `fallback-3-${Date.now()}`,
        text: 'Look for an alternative approach',
        impact: 'Seeking another way might reveal unexpected opportunities.',
        tags: ['resourceful']
      }
    ];
    
    return {
      id: `fallback-decision-${Date.now()}`,
      prompt: 'How do you want to proceed?',
      timestamp: Date.now(),
      location: narrativeState.currentStoryPoint?.locationChange,
      options: decisionOptions,
      context: 'Based on the current situation',
      importance: 'moderate',
      characters: [],
      aiGenerated: true
    };
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
    if (this.decisionsHistory.length > 10) {
      this.decisionsHistory.shift();
    }
  }
  
  /**
   * Create a standardized error object
   * 
   * @param code Error code
   * @param message Human-readable error message
   * @param retryable Whether this error can be retried
   * @returns Standardized error object
   */
  private createError(
    code: string,
    message: string,
    retryable: boolean
  ): AIServiceError {
    return { code, message, retryable };
  }
  
  /**
   * Determine if an error is retryable
   * 
   * @param error The error to check
   * @returns True if the error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('abort')
    ) {
      return true;
    }
    
    // Server errors
    if (message.includes('500') || message.includes('server error')) {
      return true;
    }
    
    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return true;
    }
    
    // Default to non-retryable
    return false;
  }
  
  /**
   * Update rate limit tracking based on response headers
   * 
   * @param headers Response headers
   */
  private updateRateLimits(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const resetTime = headers.get('X-RateLimit-Reset');
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    if (resetTime) {
      this.rateLimitResetTime = parseInt(resetTime, 10) * 1000; // Convert to milliseconds
    }
  }
}

export default AIDecisionService;