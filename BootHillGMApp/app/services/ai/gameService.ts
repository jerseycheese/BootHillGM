import { Character } from '../../types/character';
import { InventoryItem } from '../../types/inventory';
import { SuggestedAction } from '../../types/campaign';
import { getAIModel } from '../../utils/aiService';
import { retryWithExponentialBackoff } from '../../utils/retry';

/**
 * Retrieves a response from the AI Game Master based on player input and game context.
 * 
 * @param prompt - The player's input action
 * @param journalContext - Recent important story events
 * @param inventory - The player's current inventory
 * @returns A Promise that resolves to an object containing the narrative, location, combat status, opponent, acquired items, removed items, and suggested actions
 */
export async function getAIResponse(prompt: string, journalContext: string, inventory: InventoryItem[]): Promise<{ 
  narrative: string; 
  location?: string; 
  combatInitiated?: boolean; 
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
}> {
  try {
    const model = getAIModel();
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

      Game Master response:
    `;

    const result = await retryWithExponentialBackoff(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    const parts = text.split('LOCATION:');
    let narrative = parts[0].trim();
    const location = parts[1] ? parts[1].trim() : undefined;

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
      } catch (e) {
        console.warn('Failed to parse suggested actions:', e);
        // Provide default actions if parsing fails
        suggestedActions = [
          { text: "Look around", type: "basic", context: "Observe your surroundings" },
          { text: "Ready weapon", type: "combat", context: "Prepare for combat" },
          { text: "Talk to someone", type: "interaction", context: "Interact with others" },
          { text: "Do something unpredictable", type: "chaotic", context: "Take a risky action" }
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
        wounds: [],
        isUnconscious: false,
        inventory: []
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

    return { 
      narrative, 
      location, 
      combatInitiated, 
      opponent, 
      acquiredItems: filteredAcquiredItems, 
      removedItems: removedItems.map(item => item.replace("REMOVED_ITEMS: ", "").trim()).filter(Boolean),
      suggestedActions
    };
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
 * Generates a brief, journal-style summary of a player action in a Western RPG.
 * 
 * @param action - The player's action
 * @param context - The context of the action
 * @returns A Promise that resolves to a string containing the summary sentence
 */
export async function generateNarrativeSummary(action: string, context: string): Promise<string> {
  const prompt = `
    Create a very brief (1 sentence) journal-style summary of this player action in a Western RPG:
    Action: ${action}
    Context: ${context}

    Guidelines:
    - Use past tense
    - Focus on the key action/outcome
    - Keep it under 15 words if possible
    - Don't include game mechanics or metadata
    - Start with the character's action

    Example format:
    Input: "go to the saloon"
    Output: "Entered the dusty saloon and approached the bar."

    Respond with ONLY the summary sentence, no additional text or formatting.
  `;

  try {
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const summary = response.text().trim();
    
    // Remove any metadata that might have been included
    const cleanSummary = summary.split('\n')
      .filter(line => !line.startsWith('ACQUIRED_ITEMS:') && !line.startsWith('REMOVED_ITEMS:') && !line.startsWith('LOCATION:'))
      .join(' ')
      .trim();
    
    // If we got a valid response, return it
    if (cleanSummary && typeof cleanSummary === 'string') {
      return cleanSummary;
    }
    
    // If something went wrong, return a simple action summary
    return `${context} ${action}.`;
  } catch {
    // Return a simple action summary as fallback
    return `${context} ${action}.`;
  }
}

/**
 * Determines if an item would likely be used as a weapon in an Old West setting.
 * 
 * @param name - The name of the item
 * @param description - The description of the item
 * @returns A Promise that resolves to a boolean indicating if the item is a weapon
 */
export async function determineIfWeapon(name: string, description: string): Promise<boolean> {
  const prompt = `
    Analyze if this item would likely be used as a weapon in an Old West setting:
    Name: ${name}
    Description: ${description}

    Consider both conventional weapons (guns, knives, etc) and potential improvised weapons.
    Respond with ONLY "true" or "false" - no other text.
  `;

  try {
    const model = getAIModel();
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const text = response.text().trim().toLowerCase();
    
    return text === 'true';
  } catch (error) {
    console.warn('[WeaponCheck] Failed to determine weapon status:', error);
    return false;
  }
}
