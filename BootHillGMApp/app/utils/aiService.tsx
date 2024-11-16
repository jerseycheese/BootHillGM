// BootHillGMApp/app/utils/aiService.tsx

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { SuggestedAction } from '../types/campaign';

// Configuration for the AI model, including safety settings set to BLOCK_NONE
const AI_CONFIG = {
  modelName: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 1.0,
    topK: 40,
    maxOutputTokens: 2048
  },
  safetySettings: [
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ]
};

// Retry mechanism for AI requests with exponential backoff
async function retryAIRequest<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait for an exponentially increasing amount of time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}

// Function to get the AI model
function getAIModel() {
  const apiKey = typeof window === 'undefined' ? process.env.GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || '');
  return genAI.getGenerativeModel({ model: AI_CONFIG.modelName });
}

// Main function to get AI response for game narration
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
    // Construct the full prompt for the AI, including context and instructions
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
      Include exactly 3 suggested actions with types: "basic" (look, move), "combat" (fight, defend), or "interaction" (talk, trade).
      If combat occurs, describe it narratively and include a COMBAT: tag followed by the opponent's name.
      If the location has changed, on a new line, write "LOCATION:" followed by a brief (2-5 words) description of the new location. 
      If the location hasn't changed, don't include a LOCATION line.
      If there's an important story development, include "important:" followed by a brief summary of the key information.

      Game Master response:
    `;

    // Generate content using the AI model with retry mechanism
    const result = await retryAIRequest(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();
    
    // Parse the response to separate narrative, location, and combat information
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
            ['basic', 'combat', 'interaction'].includes(action.type)
          );
        }
      } catch (e) {
        console.warn('Failed to parse suggested actions:', e);
      }
    }

    // Filter out any items that start with "REMOVED_ITEMS:" from acquiredItems
    // This prevents incorrectly adding items that should be removed
    const filteredAcquiredItems = acquiredItems.filter(item => !item.startsWith("REMOVED_ITEMS:") && item !== "");

    let combatInitiated = false;
    let opponent: Character | undefined;

    // Check if combat has been initiated and create an opponent if necessary
    if (narrative.includes('COMBAT:')) {
      combatInitiated = true;
      const combatParts = narrative.split('COMBAT:');
      narrative = combatParts[0].trim();
      const opponentName = combatParts[1].trim();
      
      // Create a basic opponent Character object
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
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        },
        wounds: [],
        isUnconscious: false
      };
    }
    
    // Remove the ACQUIRED_ITEMS, REMOVED_ITEMS, and SUGGESTED_ACTIONS lines from the narrative
    narrative = narrative
      .replace(/ACQUIRED_ITEMS: \[.*?\]\n?/, '')
      .replace(/REMOVED_ITEMS: \[.*?\]\n?/, '')
      .replace(/SUGGESTED_ACTIONS: \[[\s\S]*?\]\n?/, '')
      .trim();

    // Return filtered acquired items and remove any "REMOVED_ITEMS: " prefix from removed items
    // This ensures clean data for inventory management
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
    // Error handling for API issues
    if (error instanceof Error) {
      if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
        throw new Error("AI service configuration error");
      }
    }
    throw new Error("Unexpected AI response error");
  }
}

// Function to get AI-generated prompts for character creation steps
export async function getCharacterCreationStep(step: number, currentField: string): Promise<string> {
  const prompt = `
    You are an AI Game Master guiding a player through creating a character for the Boot Hill RPG. 
    This is step ${step + 1} of the character creation process, focusing on the character's ${currentField}.
    
    Please provide a brief, engaging prompt for the player to determine their character's ${currentField}.
    For numerical attributes, suggest a range (e.g., 1-20 for attributes, 1-100 for skills).
    Keep your response concise and focused on this specific aspect of character creation.

    Also, provide a brief description of what this ${currentField} represents in the context of a Western character.
  `;

  const response = await getAIResponse(prompt, '', []); // Passing an empty string as journalContext and empty array as inventory
  return response.narrative;
}

// Function to validate attribute values based on Boot Hill rules
export function validateAttributeValue(attribute: string, value: number): boolean {
  // Define valid ranges for each attribute and skill
  const validRanges: Record<string, [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    baseStrength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11],
    shooting: [1, 100],
    riding: [1, 100],
    brawling: [1, 100],
  };

  if (attribute in validRanges) {
    const [min, max] = validRanges[attribute];
    return value >= min && value <= max;
  }

  return true; // Return true for attributes not in the validRanges object
}

// Function to generate a complete character using AI
export async function generateCompleteCharacter(): Promise<Character> {
  const prompt = `
    Generate a complete character for the Boot Hill RPG. Provide values for the following attributes and skills:
    - Name
    - Speed (1-20)
    - GunAccuracy (1-20)
    - ThrowingAccuracy (1-20)
    - Strength (8-20)
    - BaseStrength (8-20)
    - Bravery (1-20)
    - Experience (0-11)
    - Shooting (1-100)
    - Riding (1-100)
    - Brawling (1-100)

    Respond with a valid JSON object. No additional text or formatting.
  `;

  const response = await getAIResponse(prompt, '', []); // Passing an empty string as journalContext and empty array as inventory
  try {
    // The AI returns both JSON data and narrative text together
    // Extract only the JSON portion between markdown code blocks to ensure clean parsing
    const jsonMatch = response.narrative.match(/```json\n([\s\S]*?)\n```/);
    const cleanedResponse = jsonMatch ? jsonMatch[1].trim() : response.narrative.trim();

    let characterData: Partial<{
      Name: string;
      name: string;
      Speed: string | number;
      GunAccuracy: string | number;
      ThrowingAccuracy: string | number;
      Strength: string | number;
      BaseStrength: string | number;
      Bravery: string | number;
      Experience: string | number;
      Shooting: string | number;
      Riding: string | number;
      Brawling: string | number;
    }>;

    try {
      characterData = JSON.parse(cleanedResponse);
    } catch {
      // Attempt to fix common JSON issues
      const fixedResponse = cleanedResponse
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      try {
        characterData = JSON.parse(fixedResponse);
      } catch {
        throw new Error('Unable to parse character data');
      }
    }
    
    // Create a Character object from the parsed data
    const character: Character = {
      name: characterData.Name || characterData.name || 'Unknown',
      attributes: {
        speed: Number(characterData.Speed) || 10,
        gunAccuracy: Number(characterData.GunAccuracy) || 10,
        throwingAccuracy: Number(characterData.ThrowingAccuracy) || 10,
        strength: Number(characterData.Strength) || 10,
        baseStrength: Number(characterData.BaseStrength) || 10,
        bravery: Number(characterData.Bravery) || 10,
        experience: Number(characterData.Experience) || 5
      },
      skills: {
        shooting: Number(characterData.Shooting) || 50,
        riding: Number(characterData.Riding) || 50,
        brawling: Number(characterData.Brawling) || 50
      },
      wounds: [],
      isUnconscious: false
    };
    
    // Validate that all character attributes and skills are present and are valid numbers
    const isValid = (
      character.name !== 'Unknown' &&
      !isNaN(character.attributes.speed) &&
      !isNaN(character.attributes.gunAccuracy) &&
      !isNaN(character.attributes.throwingAccuracy) &&
      !isNaN(character.attributes.strength) &&
      !isNaN(character.attributes.baseStrength) &&
      !isNaN(character.attributes.bravery) &&
      !isNaN(character.attributes.experience) &&
      !isNaN(character.skills.shooting) &&
      !isNaN(character.skills.riding) &&
      !isNaN(character.skills.brawling)
    );

    if (!isValid) {
      throw new Error('Invalid character data: some attributes or skills are missing or not numbers');
    }
    
    return character;
  } catch {
    
    // Return a default character if parsing fails
    return {
      name: 'John Doe',
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      },
      wounds: [],
      isUnconscious: false
    };
  }
}

// Generate a field value for character creation
// Uses AI for character name and random generation for attributes and skills
export async function generateFieldValue(
  key: keyof Character['attributes'] | keyof Character['skills'] | 'name'
): Promise<string | number> {
  if (key === 'name') {
    const prompt = "Generate a name for a character in a Western-themed RPG. Provide only the name.";
    const response = await getAIResponse(prompt, '', []); // Passing an empty string as journalContext and empty array as inventory
    return response.narrative.trim();
  } else {
    return generateRandomValue(key as keyof Character['attributes'] | keyof Character['skills']);
  }
}

// Generate a random value for a given attribute or skill
function generateRandomValue(key: keyof Character['attributes'] | keyof Character['skills']): number {
  // Define valid ranges for each attribute and skill
  const ranges: Record<keyof Character['attributes'] | keyof Character['skills'], [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    baseStrength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11],
    shooting: [1, 100],
    riding: [1, 100],
    brawling: [1, 100],
  };

  const [min, max] = ranges[key];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    const result = await retryAIRequest(() => model.generateContent(prompt));
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
    
    const result = await retryAIRequest(() => model.generateContent(prompt));
    const response = await result.response;
    const text = response.text().trim().toLowerCase();
    
    return text === 'true';
  } catch (error) {
    console.warn('[WeaponCheck] Failed to determine weapon status:', error);
    // Default to false if AI fails
    return false;
  }
}

export async function generateCharacterSummary(character: Character): Promise<string> {
  const prompt = `
    Generate a brief, engaging summary for a character in a Western-themed RPG based on the following attributes:
    Name: ${character.name}
    Attributes:
    ${Object.entries(character.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    Skills:
    ${Object.entries(character.skills).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    
    The summary should capture the essence of the character, their strengths, potential weaknesses, and how they might fit into a Western setting. Keep the tone consistent with a gritty, Wild West atmosphere.
    
    Respond with only the narrative summary, no additional text or formatting.
  `;

  try {
    const model = getAIModel();
    const result = await retryAIRequest(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text().trim();
  } catch {
    return `A ${character.name} is a character in the Old West.`;
  }
}
