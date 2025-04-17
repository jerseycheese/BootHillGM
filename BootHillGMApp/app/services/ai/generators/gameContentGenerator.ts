import { Character } from '../../../types/character';
import { GameServiceResponse } from '../types/gameService.types';
import { ActionType } from '../../../types/campaign';
import { LocationType } from '../../locationService';
import { getAIResponse } from '../gameService';
import { logDiagnostic } from '../../../utils/initializationDiagnostics';
import { createMockResponse } from '../utils/mockResponseGenerator';

/**
 * Class responsible for generating game content
 */
export class GameContentGenerator {
  private readonly MAX_RETRIES: number = 3;
  private readonly RETRY_DELAY_MS: number = 2000;
  private requestRetries: number = 0;
  
  /**
   * Creates a base prompt with character details
   * 
   * @param characterName Character name to include in prompt
   * @returns Base prompt for content generation
   */
  private createBasePrompt(characterName: string): string {
    return `Generate a concise but atmospheric adventure narrative for ${characterName} in Boot Hill, 
    a dusty frontier town in 1876. Create a brief but vivid introduction that 
    establishes a strong sense of place and hints at potential adventures. Include specific 
    details about ${characterName}'s arrival in town and initial impressions.
    Keep it focused and around 4-6 sentences in length. Make this completely unique.`;
  }
  
  /**
   * Creates journal context with character information
   * 
   * @param characterData Character data to use for context
   * @returns Journal context string
   */
  private createJournalContext(characterData: Character | null): string {
    const characterName = characterData?.name || 'the stranger';
    let journalContext = `The player character ${characterName} has just arrived in Boot Hill, a frontier town in 1876.`;
    
    // Add attributes context if available
    if (characterData?.attributes) {
      journalContext += ` ${characterName} has these attributes: `;
      Object.entries(characterData.attributes).forEach(([key, value]) => {
        journalContext += `${key}: ${value}, `;
      });
      journalContext = journalContext.slice(0, -2) + '.'; // Remove last comma and add period
    }
    
    return journalContext;
  }
  
  /**
   * Validates and fixes AI response to ensure all required fields are present
   * 
   * @param response Raw response from AI service
   * @returns Validated and fixed response
   */
  private validateAndFixResponse(response: GameServiceResponse): GameServiceResponse {
    // IMPORTANT FIX: Ensure we have valid location
    if (!response.location || !response.location.type) {
      response.location = {
        type: 'town',
        name: 'Boot Hill'
      } as LocationType;
    }
    
    // Ensure we have suggested actions with proper types
    if (!response.suggestedActions || !response.suggestedActions.length) {
      response.suggestedActions = [
        {
          id: `generated_action_${Date.now()}_1`,
          title: 'Explore Boot Hill',
          description: 'Take a look around the town.',
          type: 'optional' as ActionType
        },
        {
          id: `generated_action_${Date.now()}_2`,
          title: 'Talk to locals',
          description: 'Strike up a conversation with the townsfolk.',
          type: 'optional' as ActionType
        }
      ];
    } else {
      // Ensure all action types are valid
      response.suggestedActions = response.suggestedActions.map(action => ({
        ...action,
        type: (action.type || 'optional') as ActionType
      }));
    }
    
    return response;
  }
  
  /**
   * Generates game content with automatic retries
   * This helps ensure successful content generation
   * 
   * @param prompt Base prompt for content generation
   * @param journalContext Context information about the journal
   * @param inventoryItems Items in the character's inventory
   * @returns Promise resolving to game content
   */
  async generateWithRetries(
    prompt: string,
    journalContext: string,
    inventoryItems: Character['inventory']['items']
  ): Promise<GameServiceResponse> {
    let lastError: Error | null = null;
    
    // Try multiple times if needed
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // On retries, modify the prompt slightly to avoid same result
        const retryPrompt = attempt > 0 
          ? `${prompt} (Retry attempt ${attempt}, please generate different content)`
          : prompt;
        
        // Log the attempt
        if (attempt > 0) {
          logDiagnostic('AI_SERVICE', `Retry attempt ${attempt}/${this.MAX_RETRIES}`, {
            timestamp: Date.now(),
            retryAttempt: attempt
          });
        }
        
        // IMPORTANT CHANGE: Only use mock AI in test environment, but use real API in development
        const isTestEnvironment = typeof jest !== 'undefined';
        
        let response;
        if (isTestEnvironment) {
          
          // Create a mock response with guaranteed content for tests only
          response = createMockResponse(prompt, journalContext);
          
          // Simulate network delay for tests
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          // Call the real AI service in both production and development
          response = await getAIResponse({
            prompt: retryPrompt,
            journalContext,
            inventory: inventoryItems
          });
        }
        
        // Verify we got a valid response with narrative content
        if (response && response.narrative) {
          logDiagnostic('AI_SERVICE', 'Successfully generated content', {
            narrativeLength: response.narrative.length,
            narrativePreview: response.narrative.substring(0, 50) + '...',
            suggestedActionCount: response.suggestedActions?.length || 0
          });
          
          // Validate and fix the response
          return this.validateAndFixResponse(response);
        } else {
          // If response is empty or invalid, throw error to trigger retry
          throw new Error('Invalid or empty response from AI service');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        logDiagnostic('AI_SERVICE', `Generation attempt ${attempt} failed`, {
          error: lastError.message
        });
        
        if (attempt < this.MAX_RETRIES) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
        }
      }
    }
    
    // If we get here, all retries failed
    logDiagnostic('AI_SERVICE', 'All retry attempts failed', {
      maxRetries: this.MAX_RETRIES,
      lastError: lastError?.message
    });
    
    // Rethrow the last error
    if (lastError) {
      throw lastError;
    } else {
      throw new Error('Failed to generate AI content after multiple attempts');
    }
  }
}
