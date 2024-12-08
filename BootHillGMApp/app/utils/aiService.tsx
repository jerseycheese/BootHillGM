// BootHillGMApp/app/utils/aiService.tsx

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Character } from '../types/character';
import { InventoryItem } from '../types/inventory';
import { retryWithExponentialBackoff } from './retry';
import { getAIResponse } from '../services/ai/gameService';

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

// Function to get the AI model with configured safety and generation settings
export function getAIModel() {
  const apiKey = typeof window === 'undefined' ? process.env.GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || '');
  return genAI.getGenerativeModel({ model: AI_CONFIG.modelName });
}

// Function to get AI-generated prompts for character creation steps
export async function getCharacterCreationStep(step: number, currentField: string): Promise<string> {
  const prompt = `
    You are an AI Game Master guiding a player through creating a character for the Boot Hill RPG. 
    This is step ${step + 1} of the character creation process, focusing on the character's ${currentField}.
    
    Please provide a brief, engaging prompt for the player to determine their character's ${currentField}.
    For numerical attributes, suggest a range (e.g., 1-20 for attributes).
    Keep your response concise and focused on this specific aspect of character creation.

    Also, provide a brief description of what this ${currentField} represents in the context of a Western character.
  `;

  const response = await getAIResponse(prompt, '', []);
  return response.narrative;
}

// Function to validate attribute values based on Boot Hill rules
export function validateAttributeValue(attribute: string, value: number): boolean {
  // Define valid ranges for each attribute
  const validRanges: Record<string, [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    baseStrength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11]
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
    Generate a complete character for the Boot Hill RPG. Provide values for the following attributes:
    - Name
    - Speed (1-20)
    - GunAccuracy (1-20)
    - ThrowingAccuracy (1-20)
    - Strength (8-20)
    - BaseStrength (8-20)
    - Bravery (1-20)
    - Experience (0-11)

    Respond with a valid JSON object. No additional text or formatting.
  `;

    try {
      const response = await getAIResponse(prompt, '', []);
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
      wounds: [],
      isUnconscious: false,
      inventory: [] as InventoryItem[]
    };
    
    // Validate that all character attributes are present and are valid numbers
    const isValid = (
      character.name !== 'Unknown' &&
      !isNaN(character.attributes.speed) &&
      !isNaN(character.attributes.gunAccuracy) &&
      !isNaN(character.attributes.throwingAccuracy) &&
      !isNaN(character.attributes.strength) &&
      !isNaN(character.attributes.baseStrength) &&
      !isNaN(character.attributes.bravery) &&
      !isNaN(character.attributes.experience)
    );

    if (!isValid) {
      throw new Error('Invalid character data: some attributes are missing or not numbers');
    }
    
    return character;
  } catch {
    // Generate a random name using generateFieldValue instead of using a default name
    const name = await generateFieldValue('name');
    
    // Return a character with random name and default stats
    return {
      name: name.toString(),
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
      inventory: [] as InventoryItem[]
    };
    }
}

// Generate a field value for character creation
// Uses AI for character name and random generation for attributes
export async function generateFieldValue(
  key: keyof Character['attributes'] | 'name'
): Promise<string | number> {
    if (key === 'name') {
        const prompt = "Generate a name for a character in a Western-themed RPG. Provide only the name.";
        const response = await getAIResponse(prompt, '', []);
        return response.narrative.trim();
    } else {
        return generateRandomValue(key as keyof Character['attributes']);
    }
}

// Generate a random value for a given attribute
function generateRandomValue(key: keyof Character['attributes']): number {
  // Define valid ranges for each attribute
  const ranges: Record<keyof Character['attributes'], [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    baseStrength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11]
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
        const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));

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
    
    The summary should capture the essence of the character, their strengths, potential weaknesses, and how they might fit into a Western setting. Keep the tone consistent with a gritty, Wild West atmosphere.
    
    Respond with only the narrative summary, no additional text or formatting.
  `;

    try {
        const model = getAIModel();
        const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text().trim();
    } catch {
    return `A ${character.name} is a character in the Old West.`;
    }
}
