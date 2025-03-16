/**
 * AI Service Client
 * 
 * Handles communication with external AI services for decision generation
 */

import { DecisionPrompt, DecisionResponse, AIServiceError } from '../../../types/ai-service.types';
import { AIDecisionServiceConfig, RawApiResponse, ApiRateLimitData } from '../types/aiDecisionTypes';

/**
 * Call the AI service with the formatted prompt
 * 
 * @param prompt Formatted decision prompt
 * @param config Service configuration
 * @param rateLimitData Current rate limit information
 * @returns Promise resolving to DecisionResponse
 * @throws AIServiceError on failure
 */
export async function callAIService(
  prompt: DecisionPrompt,
  config: AIDecisionServiceConfig,
  rateLimitData: ApiRateLimitData
): Promise<DecisionResponse> {
  // Check rate limits
  if (rateLimitData.remaining <= 0 && Date.now() < rateLimitData.resetTime) {
    throw createError('RATE_LIMITED', 'Rate limit exceeded', true);
  }
  
  try {
    // Make the API request
    const response = await makeAPIRequest(prompt, config);
    
    // Process and return the response
    return processResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw createError(
        'AI_SERVICE_ERROR', 
        error.message, 
        isRetryableError(error)
      );
    }
    
    throw createError(
      'UNKNOWN_ERROR', 
      'An unknown error occurred', 
      false
    );
  }
}

/**
 * Make the API request to the AI service
 * 
 * @param prompt Formatted decision prompt
 * @param config Service configuration
 * @returns Raw API response
 */
async function makeAPIRequest(
  prompt: DecisionPrompt,
  config: AIDecisionServiceConfig
): Promise<RawApiResponse> {
  let attempts = 0;
  let lastError: Error | null = null;
  
  while (attempts < config.apiConfig.maxRetries) {
    try {
      // Create the API request
      const response = await fetch(config.apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: config.apiConfig.modelName,
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
        signal: AbortSignal.timeout(config.apiConfig.timeout)
      });
      
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
      if (!isRetryableError(lastError) || attempts >= config.apiConfig.maxRetries) {
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
function processResponse(response: RawApiResponse): DecisionResponse {
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
  const importance: 'critical' | 'significant' | 'moderate' | 'minor' = 
    (rawImportance === 'critical' || rawImportance === 'significant' || 
     rawImportance === 'moderate' || rawImportance === 'minor')
      ? rawImportance
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
  
  return processedResponse;
}

/**
 * Update rate limit tracking based on response headers
 * 
 * @param headers Response headers
 * @param currentData Current rate limit data
 * @returns Updated rate limit data
 */
export function updateRateLimits(
  headers: Headers, 
  currentData: ApiRateLimitData
): ApiRateLimitData {
  const updatedData = { ...currentData };
  
  const remaining = headers.get('X-RateLimit-Remaining');
  const resetTime = headers.get('X-RateLimit-Reset');
  
  if (remaining) {
    updatedData.remaining = parseInt(remaining, 10);
  }
  
  if (resetTime) {
    updatedData.resetTime = parseInt(resetTime, 10) * 1000; // Convert to milliseconds
  }
  
  return updatedData;
}

/**
 * Create a standardized error object
 * 
 * @param code Error code
 * @param message Human-readable error message
 * @param retryable Whether this error can be retried
 * @returns Standardized error object
 */
export function createError(
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
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('abort') ||
    message.includes('timed out')
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
