/**
 * AI Client for making API requests to AI services
 */

import { AIServiceConfig, DecisionPrompt } from '../../../types/ai-service.types';
import { AIClient } from '../../../types/decision-service/decision-service.types';
import { createError, isRetryableError } from '../../../utils/error-utils';
import { formatPromptForAPI, processResponse } from '../../../utils/prompt-utils';
import { RETRY_BASE_DELAY } from '../../../constants/decision-service.constants';

/**
 * Client for interacting with AI services
 */
export class AIServiceClient implements AIClient {
  private config: AIServiceConfig;
  private rateLimitRemaining: number = 100;
  private rateLimitResetTime: number = 0;
  private isDevEnvironment: boolean;
  
  /**
   * Initialize the AI client
   * @param config Service configuration
   */
  constructor(config: AIServiceConfig) {
    this.config = config;
    this.isDevEnvironment = process.env.NODE_ENV === 'development';
    this.validateConfig();
  }
  
  /**
   * Validate the API configuration
   * Suppresses warnings in development environment
   */
  private validateConfig(): void {
    if (!this.config.apiKey && !this.isDevEnvironment) {
      console.warn('AI_SERVICE_API_KEY is not set. AI service will not function.');
    }
    
    if (!this.config.endpoint && !this.isDevEnvironment) {
      console.warn('AI_SERVICE_ENDPOINT is not set. AI service will not function.');
    }
  }
  
  /**
   * Get current rate limit remaining
   */
  public getRateLimitRemaining(): number {
    return this.rateLimitRemaining;
  }
  
  /**
   * Get rate limit reset time
   */
  public getRateLimitResetTime(): number {
    return this.rateLimitResetTime;
  }
  
  /**
   * Make an API request to the AI service
   * @param prompt Formatted decision prompt
   * @returns Processed API response
   */
  public async makeRequest<T>(prompt: DecisionPrompt): Promise<T> {
    // Check if we're in development mode with missing credentials
    if (this.isDevEnvironment && (!this.config.apiKey || !this.config.endpoint)) {
      // Generate mock data for development
      return this.generateMockResponse<T>(prompt);
    }
    
    // Check rate limiting
    if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitResetTime) {
      throw createError(
        'RATE_LIMITED', 
        'Rate limit exceeded. Try again later.', 
        true
      );
    }
    
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < this.config.maxRetries) {
      try {
        // Format the prompt for the API
        const formattedPrompt = formatPromptForAPI(prompt);
        
        // Create the API request
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.modelName,
            ...formattedPrompt,
            max_tokens: 1000,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(this.config.timeout)
        });
        
        // Update rate limit tracking from headers
        this.updateRateLimits(response.headers);
        
        // Handle error responses
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Process the response
        return processResponse(responseData) as T;
      } catch (error) {
        // Track the error for potential retry
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;
        
        // Check if we should retry
        if (!isRetryableError(lastError) || attempts >= this.config.maxRetries) {
          break;
        }
        
        // Exponential backoff before retry
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_BASE_DELAY * Math.pow(2, attempts - 1))
        );
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to make API request after multiple attempts');
  }
  
  /**
   * Generate a mock response for development environment
   */
  private generateMockResponse<T>(prompt: DecisionPrompt): T {
    // Extract key context from the prompt for better mock responses
    const narrativeContext = prompt.narrativeContext.slice(0, 100);
    
    // Create a contextually relevant mock decision
    const mockDecision = {
      decisionId: `decision-${Date.now()}`,
      prompt: "The situation demands a choice...",
      options: [
        {
          id: "option-1",
          text: "Take the cautious approach",
          confidence: 0.8,
          traits: ["cautious", "thoughtful"],
          potentialOutcomes: ["Safer, but might miss opportunities"],
          impact: "A measured response that minimizes risk"
        },
        {
          id: "option-2",
          text: "Act boldly and decisively",
          confidence: 0.7,
          traits: ["brave", "impulsive"],
          potentialOutcomes: ["Higher risk, higher reward"],
          impact: "A bold move that could change the situation dramatically"
        }
      ],
      relevanceScore: 0.9,
      metadata: {
        narrativeImpact: `Based on: ${narrativeContext}...`,
        themeAlignment: "Classic western decision point",
        pacing: "medium" as const,
        importance: "significant" as const
      }
    };
    
    return mockDecision as unknown as T;
  }
  
  /**
   * Update rate limit tracking based on response headers
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

export default AIServiceClient;
