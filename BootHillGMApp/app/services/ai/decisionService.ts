/**
 * AI Decision Service
 * 
 * Responsible for:
 * 1. Detecting potential decision points in the narrative
 * 2. Generating contextually appropriate decisions
 * 3. Scoring and ranking decision options
 * 4. Managing decision frequency and pacing
 */

import { AIServiceConfig, DecisionPrompt, DecisionResponse, DecisionDetectionResult, AIServiceError } from '../../types/ai-service.types';
import { NarrativeState, PlayerDecision } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { LocationType } from '../locationService';

// Default threshold for presenting a decision
const DEFAULT_DECISION_THRESHOLD = 0.65;

// Minimum time between decisions in milliseconds (30 seconds)
const MIN_DECISION_INTERVAL = 30 * 1000;

// Configuration for the decision service
export interface DecisionServiceConfig {
  minDecisionInterval: number;
  relevanceThreshold: number;
  maxOptionsPerDecision: number;
  apiConfig: AIServiceConfig;
}

/**
 * Service for AI-driven contextual decision generation
 */
export class DecisionService {
  private config: DecisionServiceConfig;
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
   * Initialize the decision service
   * @param config Service configuration
   */
  constructor(config?: Partial<DecisionServiceConfig>) {
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
    
    // Validate that we have the required API configuration
    this.validateConfig();
  }
  
  /**
   * Validate the service configuration
   * @throws Error if configuration is invalid
   */
  private validateConfig(): void {
    if (!this.config.apiConfig.apiKey) {
      console.warn('AI_SERVICE_API_KEY is not set. Decision service will not function.');
    }
    
    if (!this.config.apiConfig.endpoint) {
      console.warn('AI_SERVICE_ENDPOINT is not set. Decision service will not function.');
    }
  }
  
  /**
   * Detects if a decision point should be presented
   * @param narrativeState Current narrative state
   * @param character Player character data (included for interface compatibility)
   * @returns Decision detection result
   */
  public detectDecisionPoint(
    narrativeState: NarrativeState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    character: Character
  ): DecisionDetectionResult {
    // Don't present decisions too frequently
    if (Date.now() - this.lastDecisionTime < this.config.minDecisionInterval) {
      return {
        shouldPresent: false,
        score: 0,
        reason: 'Too soon since last decision'
      };
    }
    
    // Calculate decision score based on narrative state
    const score = this.calculateDecisionScore(narrativeState);
    
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
   * @param narrativeState Current narrative state
   * @returns Score from 0-1 where higher values indicate a more appropriate decision point
   */
  private calculateDecisionScore(
    narrativeState: NarrativeState
  ): number {
    // This implements a sophisticated scoring algorithm based on:
    // 1. Text analysis of recent narrative (dialogue vs. action)
    // 2. Time since last decision
    // 3. Narrative pacing detection
    // 4. Important narrative markers (new characters, locations)
    
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
      (Date.now() - this.lastDecisionTime) / (5 * this.config.minDecisionInterval),
      1.0
    );
    score += timeFactor * 0.25;
    
    // Ensure score is within 0-1 range
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Generates a decision based on the current narrative state
   * @param narrativeState Current narrative state
   * @param character Player character information
   * @returns Promise resolving to a decision response
   * @throws AIServiceError on failure
   */
  public async generateDecision(
    narrativeState: NarrativeState,
    character: Character
  ): Promise<DecisionResponse> {
    // Check rate limiting
    if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitResetTime) {
      throw this.createError(
        'RATE_LIMITED', 
        'Rate limit exceeded. Try again later.', 
        true
      );
    }
    
    // Record this decision time
    this.lastDecisionTime = Date.now();
    
    try {
      // Build the decision prompt from narrative state and character
      const prompt = this.buildDecisionPrompt(narrativeState, character);
      
      // Make the API request to the AI service
      const response = await this.makeAPIRequest(prompt);
      
      // Process the AI response
      const decision = this.processResponse(response);
      
      // Post-process and validate the decision
      return this.validateDecision(decision);
    } catch (error) {
      // Handle and standardize errors
      if (error instanceof Error) {
        throw this.createError(
          'AI_SERVICE_ERROR', 
          error.message, 
          this.isRetryableError(error)
        );
      }
      
      throw this.createError(
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
    // In a real implementation, you would have a more sophisticated way to extract these
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
   * Makes the API request to the AI service
   * @param prompt Formatted decision prompt
   * @returns Raw API response
   */
  private async makeAPIRequest(prompt: DecisionPrompt): Promise<Record<string, unknown>> {
    // This would be implemented to call your specific AI provider
    // Here's a placeholder implementation
    
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < this.config.apiConfig.maxRetries) {
      try {
        // Create the API request with proper formatting for your AI provider
        const response = await fetch(this.config.apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.apiConfig.modelName,
            prompt: this.formatPromptForAPI(prompt),
            max_tokens: 1000,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(this.config.apiConfig.timeout)
        });
        
        // Update rate limit tracking from headers
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
        
        // Exponential backoff before retry (1s, 2s, 4s, etc.)
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
        );
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to make API request after multiple attempts');
  }
  
  /**
   * Format the decision prompt for the specific AI provider
   * @param prompt Decision prompt object
   * @returns Formatted prompt string or object based on API requirements
   */
  private formatPromptForAPI(prompt: DecisionPrompt): Record<string, unknown> {
    // This would be customized for your specific AI provider
    // Here's a simple example that converts the prompt to a formatted string
    
    return {
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
                    Location: ${prompt.gameState.location}
                    Current Scene: ${prompt.gameState.currentScene}
                    Recent Events: ${prompt.gameState.recentEvents.join('; ')}
                    
                    PREVIOUS DECISIONS:
                    ${prompt.previousDecisions.map(d => 
                      `Prompt: ${d.prompt}\nChoice: ${d.choice}\nOutcome: ${d.outcome}`
                    ).join('\n\n')}
                    
                    Remember to maintain the western theme and appropriate tone.`
        }
      ]
    };
  }
  
  /**
   * Process the AI service response into a structured decision
   * @param response Raw API response
   * @returns Structured decision response
   */
  private processResponse(response: Record<string, unknown>): DecisionResponse {
    // This would be customized for your specific AI provider's response format
    // Here's a simplified example
    
    // Parse the response content - this assumes your AI returns a JSON string
    // In reality, you'd need to handle different response formats
    
    let parsedResponse: Record<string, unknown>;
    
    try {
      // If the API returns content field with JSON string
      if (response.choices && Array.isArray(response.choices) && response.choices[0] && 
          typeof response.choices[0] === 'object' && response.choices[0] !== null) {
        const choiceObj = response.choices[0] as Record<string, unknown>;
        if (choiceObj.message && typeof choiceObj.message === 'object' && choiceObj.message !== null) {
          const messageObj = choiceObj.message as Record<string, unknown>;
          if (typeof messageObj.content === 'string') {
            parsedResponse = JSON.parse(messageObj.content);
          } else {
            throw new Error('Message content is not a string');
          }
        } else {
          throw new Error('Choice does not contain a message object');
        }
      } 
      // If the API directly returns a structured JSON object
      else if (response.decision && typeof response.decision === 'object' && response.decision !== null) {
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
    
    // Validate and standardize the response
    return {
      decisionId: typeof parsedResponse.decisionId === 'string' ? parsedResponse.decisionId : `decision-${Date.now()}`,
      prompt: typeof parsedResponse.prompt === 'string' ? parsedResponse.prompt : 'What do you want to do?',
      options: (Array.isArray(parsedResponse.options) ? parsedResponse.options : []).map((option: unknown) => {
        const opt = option as Record<string, unknown>;
        return {
          id: typeof opt.id === 'string' ? opt.id : `option-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          text: typeof opt.text === 'string' ? opt.text : 'Undefined option',
          confidence: typeof opt.confidence === 'number' ? opt.confidence : 0.5,
          traits: Array.isArray(opt.traits) ? opt.traits.map(t => String(t)) : [],
          potentialOutcomes: Array.isArray(opt.potentialOutcomes) ? opt.potentialOutcomes.map(o => String(o)) : [],
          impact: typeof opt.impact === 'string' ? opt.impact : 'Unknown impact'
        };
      }),
      relevanceScore: typeof parsedResponse.relevanceScore === 'number' ? parsedResponse.relevanceScore : 0.5,
      metadata: {
        narrativeImpact:
          typeof (parsedResponse.metadata as Record<string, unknown>)
            ?.narrativeImpact === 'string'
            ? (parsedResponse.metadata as Record<string, unknown>)
                .narrativeImpact as string
            : '',
        themeAlignment:
          typeof (parsedResponse.metadata as Record<string, unknown>)
            ?.themeAlignment === 'string'
            ? (parsedResponse.metadata as Record<string, unknown>)
                .themeAlignment as string
            : '',
        pacing:
          (parsedResponse.metadata as Record<string, unknown>)?.pacing as
            | 'slow'
            | 'medium'
            | 'fast',
        importance:
          (parsedResponse.metadata as Record<string, unknown>)?.importance as
            | 'critical'
            | 'significant'
            | 'moderate'
            | 'minor',
      },
    };
  }
  
  /**
   * Validate and enhance the generated decision
   * @param decision Generated decision response
   * @returns Validated and enhanced decision
   */
  private validateDecision(decision: DecisionResponse): DecisionResponse {
    // Validate that we have at least 2 options
    if (!decision.options || decision.options.length < 2) {
      // Add some fallback options
      decision.options = decision.options || [];
      
      if (decision.options.length === 0) {
        decision.options.push({
          id: `fallback-1-${Date.now()}`,
          text: 'Continue forward cautiously',
          confidence: 0.7,
          traits: ['cautious'],
          potentialOutcomes: ['Might avoid danger'],
          impact: 'Slow but safe approach'
        });
      }
      
      if (decision.options.length === 1) {
        decision.options.push({
          id: `fallback-2-${Date.now()}`,
          text: 'Take decisive action',
          confidence: 0.7,
          traits: ['brave'],
          potentialOutcomes: ['Could lead to confrontation'],
          impact: 'Bold but potentially risky'
        });
      }
    }
    
    // Limit number of options based on config
    if (decision.options.length > this.config.maxOptionsPerDecision) {
      // Sort by confidence and take the top options
      decision.options = decision.options
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.config.maxOptionsPerDecision);
    }
    
    return decision;
  }
  
  /**
   * Record a player's decision for future context
   * @param decisionId ID of the decision
   * @param optionId ID of the selected option
   * @param outcome Narrative outcome of the decision
   */
  public recordDecision(
    decisionId: string,
    optionId: string,
    outcome: string
  ): void {
    // Find the original decision prompt
    // In a real implementation, you might store these in a cache
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
   * @param error The error to check
   * @returns True if the error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Network errors and server errors (5xx) are typically retryable
    // Client errors (4xx) except rate limiting (429) are not
    
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
   * @param headers Response headers
   */
  private updateRateLimits(headers: Headers): void {
    // Update rate limit tracking from headers
    // Header names will vary based on your AI provider
    
    const remaining = headers.get('X-RateLimit-Remaining');
    const resetTime = headers.get('X-RateLimit-Reset');
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    if (resetTime) {
      this.rateLimitResetTime = parseInt(resetTime, 10) * 1000; // Convert to milliseconds
    }
  }
  
  /**
   * Convert a decision response to a player decision format
   * @param decision The decision response
   * @param location Current location
   * @returns Player decision format for the narrative context
   */
  public toPlayerDecision(
    decision: DecisionResponse, 
    location?: LocationType
  ): PlayerDecision {
    return {
      id: decision.decisionId,
      prompt: decision.prompt,
      timestamp: Date.now(),
      location,
      options: decision.options.map(option => ({
        id: option.id,
        text: option.text,
        impact: option.impact,
        tags: option.traits // Use traits as tags
      })),
      context: 'Generated based on narrative context',
      importance: decision.metadata.importance,
      aiGenerated: true
    };
  }
}

export default DecisionService;