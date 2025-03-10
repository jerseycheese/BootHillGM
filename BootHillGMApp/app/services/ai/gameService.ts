import { Character } from '../../types/character';
import { InventoryItem } from '../../types/item.types';
import { LocationType } from '../locationService';
import { SuggestedAction } from '../../types/campaign';
import { getAIModel } from '../../utils/ai/aiConfig';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { GenerateContentResult } from '@google/generative-ai';
import { StoryProgressionData } from '../../types/narrative.types';
import { buildStoryPointPromptExtension } from '../../utils/storyUtils';

/**
 * Retrieves a response from the AI Game Master based on player input and game context.
 * Extended to include story progression tracking.
 *
 * @param prompt - The player's input action
 * @param journalContext - Recent important story events
 * @param inventory - The player's current inventory
 * @param storyProgressionContext - Optional context about the story progression
 * @returns A Promise that resolves to an object containing the narrative, location, combat status,
 *          opponent, acquired items, removed items, suggested actions, and story progression data
 */
export async function getAIResponse(
  prompt: string,
  journalContext: string,
  inventory: InventoryItem[],
  storyProgressionContext?: string
): Promise<{
  narrative: string;
  location: LocationType;
  combatInitiated?: boolean;
  opponent?: Character | null;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
  storyProgression?: StoryProgressionData;
}> {
  try {
    const model = getAIModel();

    // Define the expected JSON structure as a JavaScript object
    const expectedJsonResponse = {
      narrative: '[Your response as the Game Master, describing the results of the player\'s action and advancing the story]',
      location: {
        type: '[town, wilderness, or landmark]',
        name: '[Name of the town or landmark, if applicable]',
        description: '[Description of the wilderness, if applicable]',
      },
      combatInitiated: false, // Must be a boolean, not a string
      opponent: null, // Only include if combatInitiated is true
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [
        { text: 'action description', type: 'basic, combat, interaction, or chaotic', context: 'tooltip explanation' },
        { text: 'action description', type: 'basic, combat, interaction, or chaotic', context: 'tooltip explanation' },
        { text: 'action description', type: 'basic, combat, interaction, or chaotic', context: 'tooltip explanation' },
        { text: 'action description', type: 'basic, combat, interaction, or chaotic', context: 'tooltip explanation' },
      ],
      storyProgression: {
        currentPoint: '[Brief identifier for this story point]',
        title: '[Brief title for this story beat]',
        description: '[Concise description of story development]',
        significance: '[major, minor, background, character, or milestone]',
        characters: ['[Character names involved in this story point]'],
        isMilestone: false, // Whether this is a major milestone in the story
      },
    };

    // Add story progression context to the prompt
    const storyContext = storyProgressionContext 
      ? `\nCurrent story progression:\n${storyProgressionContext}\n` 
      : '';
    
    // Add the story point prompt extension
    const storyPointPrompt = buildStoryPointPromptExtension();

    const fullPrompt = `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

      1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
      2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
      3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
      4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
      5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
      6. Do not break character or reference modern-day ethics or sensibilities.

      Recent important story events:
      ${journalContext}
      ${storyContext}

      Player's current inventory (Do not mention this directly in your response):
      ${inventory.map((item) => `- ${item.name} (x${item.quantity})`).join('\n')}

      Player input: "${prompt}"

      Respond as the Game Master in JSON format, with the following structure:

      ${JSON.stringify(expectedJsonResponse, null, 2)}

      Ensure you ALWAYS return valid JSON. Provide all fields, even if they are empty arrays or null. 
      Do NOT include any markdown code block delimiters (\\\`\\\`\\\`json or \\\`\\\`\\\`) in your response. Return ONLY the raw JSON object.
      
      Specific instructions:
      - The location object MUST match what's described in the narrative:
        - For towns: If you mention "Redemption" in the narrative, set location to { "type": "town", "name": "Redemption" }
        - For wilderness: Provide a clear description matching the narrative
        - Never use "Unknown Town" - always provide the actual town name
      - Only include the 'opponent' field if \`combatInitiated\` is true
      - Maintain perfect consistency between narrative text and location object
      - Example: If narrative says "You arrive in the town of Redemption", location must be { "type": "town", "name": "Redemption" }
      
      ${storyPointPrompt}
    `;

    const result = await retryWithExponentialBackoff<GenerateContentResult>(() =>
      model.generateContent(fullPrompt)
    );
    let text = await result.response.text();
    text = text.trim();

    // Remove any markdown code block delimiters (```json, ```) more robustly
    text = text.replace(/^\s*```(?:json)?\s*\n?([\s\S]*?)\n?\s*```\s*$/gim, '$1');
    text = text.trim(); // Remove any extra whitespace

    try {
      // Attempt to parse the entire response as JSON
      const jsonResponse = JSON.parse(text);

      // Convert combatInitiated to boolean if it's a string
      if (typeof jsonResponse.combatInitiated === 'string') {
        jsonResponse.combatInitiated = jsonResponse.combatInitiated.toLowerCase() === 'true';
      }

      // Validate the structure of the response
      if (
        typeof jsonResponse.narrative !== 'string' ||
        typeof jsonResponse.location !== 'object' ||
        !['town', 'wilderness', 'landmark', 'unknown'].includes(jsonResponse.location.type) ||
        typeof jsonResponse.combatInitiated !== 'boolean' ||
        !Array.isArray(jsonResponse.acquiredItems) ||
        !Array.isArray(jsonResponse.removedItems) ||
        !Array.isArray(jsonResponse.suggestedActions)
      ) {
        throw new Error('Invalid JSON structure from AI');
      }

      // Further validation for location details
      if (jsonResponse.location.type === 'town' && !jsonResponse.location.name) {
        console.warn("AI response missing location.name for type 'town'; using default.");
        jsonResponse.location.name = 'Unknown Town';
      }
      if (jsonResponse.location.type === 'wilderness' && !jsonResponse.location.description) {
        console.warn("AI response missing location.description for type 'wilderness'; using default.");
        jsonResponse.location.description = 'Unknown Wilderness';
      }

      // Validate opponent
      if (jsonResponse.combatInitiated === true && typeof jsonResponse.opponent !== 'object') {
        throw new Error('Opponent data expected but not provided in valid format.');
      }

      // Process storyProgression field if it exists
      let storyProgression: StoryProgressionData | undefined = undefined;
      
      if (jsonResponse.storyProgression && typeof jsonResponse.storyProgression === 'object') {
        // Validate and format story progression data
        const spData = jsonResponse.storyProgression;
        
        storyProgression = {
          title: typeof spData.title === 'string' ? spData.title : undefined,
          description: typeof spData.description === 'string' ? spData.description : undefined,
          significance: ['major', 'minor', 'background', 'character', 'milestone'].includes(spData.significance) 
            ? spData.significance 
            : undefined,
          characters: Array.isArray(spData.characters) ? spData.characters : undefined,
          isMilestone: typeof spData.isMilestone === 'boolean' ? spData.isMilestone : undefined,
          currentPoint: typeof spData.currentPoint === 'string' ? spData.currentPoint : undefined
        };
      }

      // Return the structured data with optional story progression
      return {
        narrative: jsonResponse.narrative,
        location: jsonResponse.location,
        combatInitiated: jsonResponse.combatInitiated,
        opponent: jsonResponse.opponent ?? null, // Handle potentially missing opponent
        acquiredItems: jsonResponse.acquiredItems,
        removedItems: jsonResponse.removedItems,
        suggestedActions: jsonResponse.suggestedActions,
        storyProgression
      };
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error);
      console.error('Raw AI response:', text);
      
      if (error instanceof SyntaxError) {
          console.error('SyntaxError message:', error.message);
      }
      // Fallback: Return a default response with an error message
      return {
        narrative: "The AI encountered an error and could not process your action. Please try again.",
        location: { type: 'unknown' }, // Default location
        combatInitiated: false,
        opponent: null,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [{ text: "Retry", type: "basic", context: "Try your last action again." }],
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('API key expired') ||
        error.message.includes('API_KEY_INVALID')
      ) {
        throw new Error("AI service configuration error");
      }
    }
    throw new Error(`Unexpected AI response error: ${error}`);
  }
}
