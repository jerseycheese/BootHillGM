import { getAIModel } from '../../utils/ai/aiConfig';
import { AIResponseParams, GameServiceResponse } from './types/gameService.types';
import { generateFallbackResponse, AI_RESPONSE_TIMEOUT_MS } from './fallback/fallbackService';
import { fetchWithTimeout, cleanResponseText } from './utils/responseHelper';
import { buildAIPrompt } from './utils/promptBuilder';
import { validateAndEnhanceResponse } from './utils/responseValidator'; // Removed unused validateAndProcessResponse
import { InventoryItem } from '../../types/item.types';
import { NarrativeContext, LoreStore } from '../../types/narrative.types';

/**
 * Retrieves a response from the AI Game Master based on player input and game context.
 * This function orchestrates the AI response process, including prompt construction,
 * request handling, response parsing, and fallback mechanisms when the AI is unavailable.
 * 
 * Supports both object-based and parameter-based calling styles for backward compatibility:
 * - Object style: getAIResponse({ prompt, journalContext, inventory, ... })
 * - Parameter style: getAIResponse(prompt, journalContext, inventory, ...)
 *
 * @param promptOrParams - Either a string prompt or an AIResponseParams object
 * @param journalContext - Optional journal context (used when first param is a string)
 * @param inventory - Optional inventory items (used when first param is a string)
 * @param storyProgressionContext - Optional story progression context (used when first param is a string)
 * @param narrativeContext - Optional narrative context (used when first param is a string)
 * @param loreStore - Optional lore store (used when first param is a string)
 * @returns A Promise that resolves to a GameServiceResponse object
 */
export async function getAIResponse(
  promptOrParams: string | AIResponseParams,
  journalContext?: string,
  inventory?: InventoryItem[],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext,
  loreStore?: LoreStore
): Promise<GameServiceResponse> {
  
  // Handle both function signature styles
  let prompt: string;
  let actualJournalContext: string;
  let actualInventory: InventoryItem[];
  let actualStoryProgressionContext: string | undefined;
  let actualNarrativeContext: NarrativeContext | undefined;
  let actualLoreStore: LoreStore | undefined;
  
  // Check if we're using the new params object or the old individual parameters
  if (typeof promptOrParams === 'string') {
    // Old style: individual parameters
    prompt = promptOrParams;
    actualJournalContext = journalContext || '';
    actualInventory = inventory || [];
    actualStoryProgressionContext = storyProgressionContext;
    actualNarrativeContext = narrativeContext;
    actualLoreStore = loreStore;
  } else {
    // New style: params object
    prompt = promptOrParams.prompt;
    actualJournalContext = promptOrParams.journalContext;
    actualInventory = promptOrParams.inventory;
    actualStoryProgressionContext = promptOrParams.storyProgressionContext;
    actualNarrativeContext = promptOrParams.narrativeContext;
    actualLoreStore = promptOrParams.loreStore;
  }
  
  // Extract character name from context for fallback responses (if needed)
  const characterName = "the player";
  
  // Set up a controller for the fetch operation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, AI_RESPONSE_TIMEOUT_MS + 1000); // Add 1 second buffer to the timeout
  
  try {
    // Get the AI model
    const model = getAIModel();
    
    // Build the full AI prompt with all context
    const fullPrompt = buildAIPrompt(
      prompt,
      actualJournalContext,
      actualInventory,
      actualStoryProgressionContext,
      actualNarrativeContext,
      actualLoreStore
    );

    // Race between AI response and timeout
    let result;
    try {
      result = await fetchWithTimeout(
        model, 
        fullPrompt, 
        AI_RESPONSE_TIMEOUT_MS
      );
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("[AI Service] Request failed or timed out:", error);
      
      // Make sure we clear the timeout
      clearTimeout(timeoutId);
      
      // Return fallback response
      return generateFallbackResponse(prompt, characterName, actualInventory);
    }

    // Get and clean the response text
    let text = await result.response.text();
    text = cleanResponseText(text);

    // Parse and validate the JSON response
    try {
      // Attempt to parse the entire response as JSON
      const jsonResponse = JSON.parse(text);
      
      // Check for invalid location formats
      if (jsonResponse.location && typeof jsonResponse.location === 'string') {
        // Invalid location format detected - use fallback response
        return generateFallbackResponse(prompt, characterName, actualInventory);
      }
      
      // Check for invalid location types
      if (jsonResponse.location && jsonResponse.location.type && 
          !['town', 'wilderness', 'landmark', 'unknown'].includes(jsonResponse.location.type)) {
        // Invalid location type detected - use fallback response
        return generateFallbackResponse(prompt, characterName, actualInventory);
      }
      // Validate AND enhance the response data (context no longer needed)
      return validateAndEnhanceResponse(jsonResponse);
    } catch (error) {
      console.error('[AI Service] Failed to parse AI response:', error);
      console.error('[AI Service] Raw response text:', text);

      if (error instanceof SyntaxError) {
        console.error('[AI Service] SyntaxError details:', error.message);
      }
      
      // Return fallback response on parsing error
      return generateFallbackResponse(prompt, characterName, actualInventory);
    }
  } catch (error) {
    console.error("[AI Service] Critical error:", error);
    
    // Make sure the timeout is cleared
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (
        error.message.includes('API key expired') ||
        error.message.includes('API_KEY_INVALID')
      ) {
        console.error("[AI Service] API key error detected");
      }
    }
    
    // Return fallback response for any error
    return generateFallbackResponse(prompt, characterName, actualInventory);
  }
}
