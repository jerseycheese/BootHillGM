import { Character } from '../../types/character';
import { InventoryItem } from '../../types/item.types';
import { SuggestedAction } from '../../types/campaign';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { GenerateContentResult } from '@google/generative-ai';
import { LocationType } from '../locationService';
import { PlayerDecision } from '../../types/narrative.types';
import { parsePlayerDecision } from './responseParser';
import { getAIModel } from '../../utils/ai/aiConfig';

/**
 * Service for handling AI model interactions for the game.
 * Provides methods for generating content, parsing responses, and managing the API communication.
 */
class AIService {
  private model: ReturnType<typeof getAIModel>;

  constructor() {
    this.model = getAIModel();
  }
  
  /**
   * Test-specific method to access constructPrompt
   * @param prompt - The player's input action
   * @param journalContext - Recent important story events
   * @param inventory - The player's current inventory
   * @returns Constructed prompt string
   */
  async testConstructPrompt(prompt: string, journalContext: string, inventory: InventoryItem[]): Promise<string> {
    return this.constructPrompt(prompt, journalContext, inventory);
  }

  /**
   * Generates character data from the AI model.
   * @returns Promise resolving to the character data as a string
   */
  async generateFromAI(): Promise<string> {
    const prompt = `
      Generate a complete character following Boot Hill v2 rules. Include:
      - Name
      - Attributes (speed, gunAccuracy, throwingAccuracy, strength, bravery, experience)
      - Background story
      - Starting equipment
      - Status
      
      Format the response as JSON with the following structure:
      {
        "name": string,
        "attributes": {
          "speed": number,
          "gunAccuracy": number,
          "throwingAccuracy": number,
          "strength": number,
          "baseStrength": number,
          "bravery": number,
          "experience": number
        },
        "background": string,
        "equipment": string[],
        "status": "active"
      }
    `;
    
    const result = await retryWithExponentialBackoff<GenerateContentResult>(() =>
      this.model.generateContent(prompt)
    );
    return result.response.text();
  }

  /**
   * Retrieves a response from the AI Game Master based on player input and game context.
   * @param prompt - The player's input action
   * @param journalContext - Recent important story events
   * @param inventory - The player's current inventory
   * @returns A Promise that resolves to an object containing game state data including narrative, location, and player decision
   */
  async getAIResponse(prompt: string, journalContext: string, inventory: InventoryItem[]): Promise<{
    narrative: string;
    location?: LocationType;
    combatInitiated?: boolean;
    opponent?: Character;
    acquiredItems: string[];
    removedItems: string[];
    suggestedActions: SuggestedAction[];
    playerDecision?: PlayerDecision;
  }> {
    try {
      const fullPrompt = await this.constructPrompt(prompt, journalContext, inventory);
      const result = await retryWithExponentialBackoff<GenerateContentResult>(() => this.model.generateContent(fullPrompt));
      const text = await result.response.text();
      
      try {
        return this.parseAIResponse(text);
      } catch {
        // Return a basic response with just the narrative text
        return {
          narrative: text,
          acquiredItems: [],
          removedItems: [],
          suggestedActions: [],
          // playerDecision is undefined by default
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
          throw new Error("AI service configuration error");
        }
      }
      throw new Error("Unexpected AI response error");
    }
  }

  /**
   * Constructs the prompt for the AI model based on player input and game context.
   * @param prompt - The player's input action
   * @param journalContext - Recent important story events
   * @param inventory - The player's current inventory
   * @returns Constructed prompt string with formatting and instructions for the AI
   * @private
   */
  private async constructPrompt(prompt: string, journalContext: string, inventory: InventoryItem[]): Promise<string> {
    return `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:
      
      1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
      2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
      3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
      4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
      5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
      6. Do not break character or reference modern-day ethics or sensibilities.
      
      Recent important story events:
      ${journalContext}
      
      Player's current inventory (Do not mention this directly in your response):
      ${inventory.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}
      
      Player input: "${prompt}"
      
      Respond as the Game Master, describing the results of the player's action and advancing the story. 
      If the player attempts to take or acquire an item, describe the process of obtaining it.
      If the player uses, throws, or discards an item, describe the result.
      Only allow the player to use items that are actually in their inventory. If the player tries to use an item they don't have, explain that they don't possess the item.
      After your narrative response, on a new line, add:
      ACQUIRED_ITEMS: [List any items the player acquired, separated by commas. If no items were acquired, leave this empty]
      REMOVED_ITEMS: [List any items the player used, discarded, or lost, separated by commas. If no items were removed, leave this empty]
      SUGGESTED_ACTIONS: [{"text": "action description", "type": "action type", "context": "tooltip explanation"}]
      Include exactly 4 suggested actions with types: "basic" (look, move), "combat" (fight, defend), "interaction" (talk, trade), or "chaotic" (unpredictable actions).
      If combat occurs, describe it narratively and include a COMBAT: tag followed by the opponent's name.
      If the location has changed, on a new line, write "LOCATION:" followed by a brief (2-5 words) description of the new location. 
      If the location hasn't changed, don't include a LOCATION line.
      If there's an important story development, include "important:" followed by a brief summary of the key information.

      If the narrative presents a meaningful choice for the player, include a playerDecision field in your JSON response with the following structure:
      {
        "playerDecision": {
          "prompt": "[Question or situation requiring player decision]",
          "options": [
            {
              "text": "[Option 1 text]",
              "impact": "[Description of potential impact]",
              "tags": ["optional", "tags"]
            },
            {
              "text": "[Option 2 text]",
              "impact": "[Description of potential impact]",
              "tags": ["optional", "tags"]
            }
          ],
          "importance": "[critical, significant, moderate, or minor]",
          "context": "[Optional additional context for the decision]",
          "characters": ["Optional array of character names involved in the decision"]
        }
      }

      Not every response needs a decision point - only include when meaningful choices arise.
      Each decision should have a prompt and 2-4 options.
      Each option needs text and impact fields.
      Set importance to: critical (major story impact), significant (important), moderate (medium impact), or minor (small impact).
      
      Game Master response:
    `;
  }

  /**
   * Parses the AI response text into structured game data.
   * @param text - The raw text response from the AI model
   * @returns Structured game data including narrative, location, and player decision
   * @private
   */
  private async parseAIResponse(text: string): Promise<{
    narrative: string;
    location?: LocationType;
    combatInitiated?: boolean;
    opponent?: Character;
    acquiredItems: string[];
    removedItems: string[];
    suggestedActions: SuggestedAction[];
    playerDecision?: PlayerDecision;
  }> {
    const parts = text.split('LOCATION:');
    let narrative = parts[0].trim();
    // Convert string location to LocationType
    const locationString = parts[1] ? parts[1].trim() : undefined;
    const location: LocationType | undefined = locationString
      ? { type: 'town', name: locationString }
      : undefined;

    const acquiredItemsMatch = text.match(/ACQUIRED_ITEMS:\s*(.*?)(?=\n|$)/);
    const removedItemsMatch = text.match(/REMOVED_ITEMS:\s*(.*?)(?=\n|$)/);
    const suggestedActionsMatch = text.match(/SUGGESTED_ACTIONS:\s*(\[[\s\S]*?\])/);

    const acquiredItems = acquiredItemsMatch
      ? acquiredItemsMatch[1].split(',').map(item => item.trim()).filter(Boolean).map(item => item.replace(/^\[|\]$/g, ''))
      : [];
    const removedItems = removedItemsMatch
      ? removedItemsMatch[1].split(',').map(item => item.trim()).filter(Boolean).map(item => item.replace(/^\[|\]$/g, ''))
      : [];

    let suggestedActions: SuggestedAction[] = [];
    if (suggestedActionsMatch) {
      try {
        const parsedActions = JSON.parse(suggestedActionsMatch[1]);
        if (Array.isArray(parsedActions)) {
          suggestedActions = parsedActions.filter(action =>
            action.text &&
            action.type &&
            ['basic', 'combat', 'interaction', 'chaotic'].includes(action.type)
          );
        }
      } catch {
        // Provide default actions if parsing fails
        suggestedActions = [
          { text: "Look around", type: "basic", context: "Observe your surroundings" },
          { text: "Ready weapon", type: "combat", context: "Prepare for combat" },
          { text: "Talk to someone", type: "interaction", context: "Interact with others" },
          { text: "Do something chaotic", type: "chaotic", context: "Take a risky action" }
        ];
      }
    }

    const filteredAcquiredItems = acquiredItems.filter(item => !item.startsWith("REMOVED_ITEMS:") && item !== "");

    let combatInitiated = false;
    let opponent: Character | undefined;

    if (narrative.includes('COMBAT:')) {
      combatInitiated = true;
      const combatParts = narrative.split('COMBAT:');
      narrative = combatParts[0].trim();
      const opponentName = combatParts[1].trim();

      opponent = {
        id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: opponentName,
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 5
        },
        minAttributes: {
          speed: 1,
          gunAccuracy: 1,
          throwingAccuracy: 1,
          strength: 1,
          baseStrength: 1,
          bravery: 1,
          experience: 0
        },
        maxAttributes: {
          speed: 20,
          gunAccuracy: 20,
          throwingAccuracy: 20,
          strength: 20,
          baseStrength: 20,
          bravery: 20,
          experience: 10
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isNPC: true,
        isPlayer: false
      };
    }

    // Remove the metadata lines from the narrative
    narrative = narrative
      .replace(/ACQUIRED_ITEMS: \[.*?\]\n?/, '')
      .replace(/REMOVED_ITEMS: \[.*?\]\n?/, '')
      .replace(/SUGGESTED_ACTIONS: \[[\s\S]*?\]\n?/, '')
      .replace(/^important:.*$/gim, '')  // Remove lines starting with "important:"
      .replace(/\n.*?important:.*$/gim, '')  // Remove lines with "important:" anywhere
      .replace(/\n\s*\n+/g, '\n')  // Clean up multiple newlines
      .trim();

    let playerDecision: PlayerDecision | undefined;

    try {
      // First try to parse the entire response as JSON to extract playerDecision
      try {
        const jsonResponse = JSON.parse(text);
        if (jsonResponse.playerDecision && typeof jsonResponse.playerDecision === 'object') {
          playerDecision = parsePlayerDecision(jsonResponse.playerDecision, location);
        } else {
          playerDecision = undefined;
        }
      } catch {
        // If full JSON parsing fails, try the substring approach
        const playerDecisionStartIndex = text.indexOf('"playerDecision":');
        if (playerDecisionStartIndex !== -1) {
          const jsonStartIndex = playerDecisionStartIndex + '"playerDecision":'.length;
          const jsonEndIndex = findClosingBrace(text, jsonStartIndex);

          if (jsonEndIndex !== -1) {
            const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
            const decisionData = JSON.parse(jsonString);
            playerDecision = parsePlayerDecision(decisionData, location);
          }
        } else {
          playerDecision = undefined;
        }
      }
    } catch {
      // Failed to parse, leave playerDecision as undefined
      playerDecision = undefined;
    }

    // Create the final response object
    const response = {
      narrative,
      location,
      combatInitiated,
      opponent,
      acquiredItems: filteredAcquiredItems,
      removedItems: removedItems.map(item => item.replace("REMOVED_ITEMS: ", "").trim()).filter(Boolean),
      suggestedActions,
    };

    // Only add playerDecision if it's defined and valid
    if (playerDecision) {
      return {
        ...response,
        playerDecision
      };
    } else {
      return response;
    }
  }
}

/**
 * Helper function to find the closing brace in a JSON string.
 * Used for extracting nested JSON objects from text responses.
 * @param str - The string to search in
 * @param openBraceIndex - The index where to start searching from (after the opening brace)
 * @returns The index of the closing brace or -1 if not found
 */
function findClosingBrace(str: string, openBraceIndex: number): number {
  let openBraceCount = 0;
  for (let i = openBraceIndex; i < str.length; i++) {
    if (str[i] === '{') {
      openBraceCount++;
    } else if (str[i] === '}') {
      openBraceCount--;
      if (openBraceCount === 0) {
        return i;
      }
    }
  }
  return -1; // Should never happen with correct JSON, but handle for robustness
}

export { AIService };
