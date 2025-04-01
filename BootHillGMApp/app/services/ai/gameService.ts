import { Character } from '../../types/character';
import { InventoryItem } from '../../types/item.types';
import { LocationType } from '../locationService';
import { SuggestedAction } from '../../types/campaign';
import { getAIModel } from '../../utils/ai/aiConfig';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { GenerateContentResult } from '@google/generative-ai';
import { 
  StoryProgressionData, 
  PlayerDecision, 
  NarrativeContext,
  LoreStore
} from '../../types/narrative.types';
import { buildStoryPointPromptExtension } from '../../utils/storyUtils';
import { parsePlayerDecision } from './responseParser';
import { buildComprehensiveContextExtension } from '../../utils/decisionPromptBuilder';
import { buildLoreExtractionPrompt } from '../../utils/loreExtraction';
import { buildLoreContextPrompt } from '../../utils/loreContextBuilder';

// Define the structure for the fallback response
interface FallbackResponse {
  narrative: string;
  location: LocationType;
  combatInitiated: boolean;
  opponent: null;
  acquiredItems: string[]; // Use string[] instead of never[]
  removedItems: string[]; // Use string[] instead of never[]
  suggestedActions: SuggestedAction[];
}


// Maximum time to wait for AI response before returning a fallback
const AI_RESPONSE_TIMEOUT_MS = 15000; // 15 seconds (Increased from 6)

/**
 * @param ms Timeout in milliseconds
 * @returns A promise that rejects after the specified timeout
 */
function timeoutPromise(ms: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
}

/**
 * Generates a fallback response when the AI is unavailable or times out
 */
function generateFallbackResponse(
  prompt: string,
  characterName: string = "the player",
  inventoryItems: InventoryItem[] = []
): FallbackResponse { // Add explicit return type
  console.log("Generating fallback response for prompt:", prompt);

  // Extract action words from the prompt to determine response type
  const promptLower = prompt.toLowerCase();
  const isLookingAction = /\b(look|see|view|observe|check)\b/.test(promptLower);
  const isMovementAction = /\b(go|walk|move|travel|head|run)\b/.test(promptLower);
  const isTalkingAction = /\b(talk|speak|ask|tell|say)\b/.test(promptLower);
  const isInventoryAction = /\b(inventory|items|gear|equip)\b/.test(promptLower);
  const isInitializing = /\b(initialize|init|start|begin|new|create)\b/.test(promptLower);
  
  let responseType = 'generic';
  if (isInitializing) responseType = 'initializing';
  else if (isLookingAction) responseType = 'looking';
  else if (isMovementAction) responseType = 'movement';
  else if (isTalkingAction) responseType = 'talking';
  else if (isInventoryAction) responseType = 'inventory';
  
  // Generate a contextual fallback response
  let narrative = "";
  const suggestedActions: SuggestedAction[] = [];
  
  switch (responseType) {
    case 'initializing':
      narrative = `${characterName} arrives in the town of Boothill, greeted by the sight of dusty streets and wooden buildings. The sun hangs low in the sky, casting long shadows across the main thoroughfare. The distant sounds of piano music drift from the saloon, while townsfolk move about their business.`;
      suggestedActions.push(
        { text: "Explore the town", type: "basic", context: "Get to know Boothill" },
        { text: "Visit the saloon", type: "basic", context: "Find information and refreshment" },
        { text: "Look for work", type: "interaction", context: "Earn some money" },
        { text: "Check your gear", type: "inventory", context: "See what you have" }
      );
      break;
      
    case 'looking':
      narrative = `${characterName} looks around at the frontier town. The dusty main street stretches before you, lined with wooden buildings. A saloon stands nearby, and people move about their business.`;
      suggestedActions.push(
        { text: "Enter the saloon", type: "basic", context: "Look for information" },
        { text: "Approach the general store", type: "basic", context: "Check for supplies" },
        { text: "Ask a passerby for information", type: "interaction", context: "Learn about the town" }
      );
      break;
      
    case 'movement':
      narrative = `${characterName} makes their way down the trail. The western landscape stretches out around you, with rolling hills and sparse vegetation. The path continues ahead.`;
      suggestedActions.push(
        { text: "Continue forward", type: "basic", context: "Follow the trail" },
        { text: "Look for a place to rest", type: "basic", context: "Take a break from traveling" },
        { text: "Check your surroundings", type: "basic", context: "Make sure it's safe" }
      );
      break;
      
    case 'talking':
      narrative = `${characterName} tries to engage in conversation. The person nods, listening to what you have to say. "Interesting," they respond, though they seem a bit distracted.`;
      suggestedActions.push(
        { text: "Ask about the town", type: "interaction", context: "Get local information" },
        { text: "Inquire about work", type: "interaction", context: "Look for opportunities" },
        { text: "End the conversation", type: "basic", context: "Move on to something else" }
      );
      break;
      
    case 'inventory':
      const itemNames = inventoryItems.map(item => item.name.toLowerCase());
      narrative = `${characterName} checks their belongings. `;
      
      if (itemNames.length > 0) {
        narrative += `You have ${itemNames.slice(0, -1).join(', ')}${itemNames.length > 1 ? ' and ' + itemNames[itemNames.length - 1] : itemNames[0]}.`;
      } else {
        narrative += "You don't seem to have much with you at the moment.";
      }
      
      suggestedActions.push(
        { text: "Look for supplies", type: "basic", context: "Find more items" },
        { text: "Continue your journey", type: "basic", context: "Move on" },
        { text: "Rest for a moment", type: "basic", context: "Recover your strength" }
      );
      break;
      
    default:
      narrative = `${characterName} considers their next move. The western frontier stretches out before you, full of opportunity and danger.`;
      suggestedActions.push(
        { text: "Look around", type: "basic", context: "Survey your surroundings" },
        { text: "Check your inventory", type: "inventory", context: "See what you're carrying" },
        { text: "Rest for a while", type: "basic", context: "Recover your energy" },
        { text: "Continue forward", type: "basic", context: "Press on with your journey" }
      );
  }
  
  return {
    narrative,
    location: { type: 'town', name: 'Boothill' },
    combatInitiated: false,
    opponent: null,
    acquiredItems: [],
    removedItems: [],
    suggestedActions
  };
}

/**
 * Retrieves a response from the AI Game Master based on player input and game context.
 * This function sends the player's prompt and relevant game state information
 * to the AI model to generate a narrative response, game updates, and potential
 * player decision points.
 *
 * @param prompt - The player's input action or command string.
 * @param journalContext - A string summarizing recent important story events,
 *                       used to maintain narrative coherence.
 * @param inventory - An array of InventoryItem objects representing the player's current inventory.
 * @param storyProgressionContext - [Optional] A string containing context about the current
 *                                story progression, if available.
 * @param narrativeContext - [Optional] A NarrativeContext object containing:
 *                         - decisionHistory: An array of past player decisions.
 *                         - currentTags: Tags describing the current game context.
 *                         This context is used to make AI responses more dynamic and relevant
 *                         by incorporating the player's decision history.
 * @param loreStore - [Optional] A LoreStore object containing facts about the game world
 *
 * @returns A Promise that resolves to an object containing the AI-generated response,
 *          including narrative text, location updates, combat status, items, actions,
 *          story progression hints, and potential player decisions.
 */
export async function getAIResponse(
  prompt: string,
  journalContext: string,
  inventory: InventoryItem[],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext,
  loreStore?: LoreStore
): Promise<{
  narrative: string;
  location: LocationType;
  combatInitiated?: boolean;
  opponent?: Character | null;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
  storyProgression?: StoryProgressionData;
  playerDecision?: PlayerDecision;
  lore?: {
    newFacts: Array<{
      category: string;
      content: string;
      importance?: number;
      confidence?: number;
      tags?: string[];
    }>;
    updatedFacts?: Array<{
      id: string;
      content: string;
      importance?: number;
      confidence?: number;
    }>;
  };
}> {
  console.log("Getting AI response for prompt:", prompt);
  
  // Extract character name from inventory or context for fallback responses
  // NOTE: narrativeContext does not contain playerInfo. Player name should ideally be passed directly.
  const characterName = "the player";
  // Removed incorrect access: narrativeContext?.playerInfo?.name
  try {
    // Placeholder for potential future logic to get name if passed differently
  } catch (e) {
    console.error("Error determining character name for fallback:", e);
  }
  
  // Set up a controller for the fetch operation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, AI_RESPONSE_TIMEOUT_MS + 1000); // Add 1 second buffer to the timeout
  
  try {
    // Create a race between the AI response and a timeout
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
      playerDecision: {
        prompt: '[Question or situation requiring player decision]',
        options: [
          {
            text: '[Option 1 text]',
            impact: '[Description of potential impact]',
            tags: ['optional', 'tags']
          },
          {
            text: '[Option 2 text]',
            impact: '[Description of potential impact]',
            tags: ['optional', 'tags']
          }
        ],
        importance: '[critical, significant, moderate, or minor]'
      },
      storyProgression: {
        currentPoint: '[Brief identifier for this story point]',
        title: '[Brief title for this story beat]',
        description: '[Concise description of story development]',
        significance: '[major, minor, background, character, or milestone]',
        characters: ['[Character names involved in this story point]'],
        isMilestone: false, // Whether this is a major milestone in the story
      },
      lore: {
        newFacts: [
          {
            category: '[character, location, history, item, or concept]',
            content: '[Factual statement about the world]',
            importance: 1, // 1-10, how important this fact is
            confidence: 1, // 1-10, how confident the AI is
            tags: ['tag1', 'tag2'] // Keywords for this fact
          }
        ],
        updatedFacts: [
          {
            id: 'fact-id', // ID of existing fact to update
            content: '[Updated factual statement]',
            importance: 1, // 1-10, updated importance
            confidence: 1 // 1-10, updated confidence
          }
        ]
      }
    };

    // Add story progression context to the prompt
    const storyContext = storyProgressionContext 
      ? `\nCurrent story progression:\n${storyProgressionContext}\n` 
      : '';
    
    // Generate decision-related context using the new utilities
    const decisionsContext = narrativeContext
      ? buildComprehensiveContextExtension(narrativeContext)
      : '';
    
    // Add the story point prompt extension
    const storyPointPrompt = buildStoryPointPromptExtension();
    
    // Add lore extraction prompt
    const loreExtractionPrompt = buildLoreExtractionPrompt();
    
    // Add lore context if available
    const loreContext = (loreStore && narrativeContext)
      ? buildLoreContextPrompt(loreStore, narrativeContext)
      : '';

    const fullPrompt = `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

      1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
      2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
      3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
      4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
      5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
      6. Do not break character or reference modern-day ethics or sensibilities.
      7. Remember and reference the player's past decisions when appropriate to create a coherent narrative.
      8. When presenting new choices, consider how they relate to the player's previous decisions.

      Recent important story events:
      ${journalContext}
      ${storyContext}
      ${decisionsContext}
      ${loreContext}

      Player's current inventory (Do not mention this directly in your response):
      ${inventory.map((item) => `- ${item.name} (x${item.quantity})`).join('\n')}

      Player input: "${prompt}"

      Respond as the Game Master in JSON format, with the following structure:

      ${JSON.stringify(expectedJsonResponse, null, 2)}

      Ensure you ALWAYS return valid JSON. Provide all fields, even if they are empty arrays or null. 
      Do NOT include any markdown code block delimiters (\`\`\`json or \`\`\`) in your response. Return ONLY the raw JSON object.
      
      Specific instructions:
      - The location object MUST match what's described in the narrative:
        - For towns: If you mention "Redemption" in the narrative, set location to { "type": "town", "name": "Redemption" }
        - For wilderness: Provide a clear description matching the narrative
        - Never use "Unknown Town" - always provide the actual town name
      - Only include the 'opponent' field if \`combatInitiated\` is true
      - Maintain perfect consistency between narrative text and location object
      - Example: If narrative says "You arrive in the town of Redemption", location must be { "type": "town", "name": "Redemption" }
      - Player Decision Points:
        - Include a playerDecision field when the narrative presents a meaningful choice
        - Each decision should have a prompt and 2-4 options
        - Each option needs text and impact fields
        - Set importance to: critical (major story impact), significant (important), moderate (medium impact), or minor (small impact)
        - Not every response needs a decision point - only include when meaningful choices arise
        - When creating decision options, reference relevant past player decisions to show continuity
      
      ${storyPointPrompt}

      ${loreExtractionPrompt}
    `;

    // Race between AI response and timeout
    let result;
    try {
      console.log("Starting AI request with timeout of", AI_RESPONSE_TIMEOUT_MS, "ms");
      result = await Promise.race([
        retryWithExponentialBackoff<GenerateContentResult>(() => model.generateContent(fullPrompt)),
        timeoutPromise(AI_RESPONSE_TIMEOUT_MS)
      ]);
      console.log("AI request completed successfully");
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("AI request failed or timed out:", error);
      
      // Make sure we clear the timeout
      clearTimeout(timeoutId);
      
      // Return fallback response
      return generateFallbackResponse(prompt, characterName, inventory);
    }

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
        console.error("Invalid JSON structure from AI response");
        throw new Error('Invalid JSON structure from AI');
      }

      // Further validation for location details
      if (jsonResponse.location.type === 'town' && !jsonResponse.location.name) {
        console.warn("AI response missing location.name for type 'town'; using default.");
        jsonResponse.location.name = 'Boothill';
      }
      if (jsonResponse.location.type === 'wilderness' && !jsonResponse.location.description) {
        console.warn("AI response missing location.description for type 'wilderness'; using default.");
        jsonResponse.location.description = 'A rugged landscape in the western frontier';
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

      // Process playerDecision field if it exists
      let playerDecision: PlayerDecision | undefined = undefined;

      if (jsonResponse.playerDecision && typeof jsonResponse.playerDecision === 'object') {
        playerDecision = parsePlayerDecision(jsonResponse.playerDecision, jsonResponse.location);
      }

      // Ensure we have at least one suggested action
      if (!jsonResponse.suggestedActions || jsonResponse.suggestedActions.length === 0) {
        jsonResponse.suggestedActions = [
          { text: "Look around", type: "basic", context: "Survey your surroundings" },
          { text: "Continue forward", type: "basic", context: "Proceed on your journey" },
          { text: "Check your inventory", type: "inventory", context: "See what you're carrying" }
        ];
      }

      // Return the structured data with optional story progression and player decision
      return {
        narrative: jsonResponse.narrative,
        location: jsonResponse.location,
        combatInitiated: jsonResponse.combatInitiated,
        opponent: jsonResponse.opponent ?? null,
        acquiredItems: jsonResponse.acquiredItems,
        removedItems: jsonResponse.removedItems,
        suggestedActions: jsonResponse.suggestedActions,
        storyProgression,
        playerDecision,
        lore: jsonResponse.lore
      };
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error);
      console.error('Raw AI response:', text);

      if (error instanceof SyntaxError) {
        console.error('SyntaxError message:', error.message);
      }
      
      // Return fallback response
      return generateFallbackResponse(prompt, characterName, inventory);
    }
  } catch (error) {
    console.error("Critical error in AI service:", error);
    
    // Make sure the timeout is cleared
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (
        error.message.includes('API key expired') ||
        error.message.includes('API_KEY_INVALID')
      ) {
        console.error("API key error detected");
      }
    }
    
    // Return fallback response for any error
    return generateFallbackResponse(prompt, characterName, inventory);
  }
}
