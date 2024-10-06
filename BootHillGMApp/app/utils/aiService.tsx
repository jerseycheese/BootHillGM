import { GoogleGenerativeAI } from "@google/generative-ai";
import { Character } from '../types/character';

// TODO: Improve formatting of AI messages for better readability and engagement

const apiKey = typeof window === 'undefined' ? process.env.GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

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

const model = genAI.getGenerativeModel({ model: AI_CONFIG.modelName });

export async function getAIResponse(prompt: string): Promise<{ narrative: string; location?: string }> {
  try {
    // Construct a prompt that emphasizes player agency and uncensored storytelling
    const fullPrompt = `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

      1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
      2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
      3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
      4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
      5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
      6. Do not break character or reference modern-day ethics or sensibilities.

      Player input: "${prompt}"

      Respond as the Game Master, describing the results of the player's action and advancing the story. 
      If the action involves using an item, update their inventory accordingly. 
      If combat occurs, describe it narratively without using a separate combat system. 
      If the location has changed, on a new line, write "LOCATION:" followed by a brief (2-5 words) description of the new location. 
      If the location hasn't changed, don't include a LOCATION line.

      Game Master response:
    `;

    // Generate content using the AI model
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response to separate narrative and location
    const parts = text.split('LOCATION:');
    const narrative = parts[0].trim();
    const location = parts[1] ? parts[1].trim() : undefined;

    return { narrative, location };
  } catch (error) {
    // Error handling for API issues
    console.error('Error getting AI response:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
        return { narrative: "Sorry, there's an issue with the AI service configuration. Please try again later." };
      }
    }
    return { narrative: "An unexpected error occurred. Please try again." };
  }
}

export async function getCharacterCreationStep(step: number, currentField: string): Promise<string> {
  const prompt = `
    You are an AI Game Master guiding a player through creating a character for the Boot Hill RPG. 
    This is step ${step + 1} of the character creation process, focusing on the character's ${currentField}.
    
    Please provide a brief, engaging prompt for the player to determine their character's ${currentField}.
    For numerical attributes, suggest a range (e.g., 1-20 for attributes, 1-100 for skills).
    Keep your response concise and focused on this specific aspect of character creation.

    Also, provide a brief description of what this ${currentField} represents in the context of a Western character.
  `;

  const response = await getAIResponse(prompt);
  return response.narrative;
}

export function validateAttributeValue(attribute: string, value: number): boolean {
  // Basic validation logic - can be expanded based on Boot Hill rules
  const validRanges: Record<string, [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
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

  return true; // For any attributes not explicitly defined
}

export async function generateCompleteCharacter(): Promise<Character> {
  // Prompt for the AI to generate a character with specific attributes and skills
  const prompt = `
    Generate a complete character for the Boot Hill RPG. Provide values for the following attributes and skills:
    - Name
    - Speed (1-20)
    - GunAccuracy (1-20)
    - ThrowingAccuracy (1-20)
    - Strength (8-20)
    - Bravery (1-20)
    - Experience (0-11)
    - Shooting (1-100)
    - Riding (1-100)
    - Brawling (1-100)

    Format the response as a valid JSON object without any markdown formatting.
  `;

  const response = await getAIResponse(prompt);
  try {
    // Remove any markdown code block syntax from the AI response
    const cleanedResponse = response.narrative.replace(/```json\n?|\n?```/g, '');
    
    // Parse the cleaned response as JSON
    const characterData = JSON.parse(cleanedResponse);
    
    // Transform the parsed data into our Character structure
    const character: Character = {
      name: characterData.Name || characterData.name,
      attributes: {
        speed: Number(characterData.Speed),
        gunAccuracy: Number(characterData.GunAccuracy),
        throwingAccuracy: Number(characterData.ThrowingAccuracy),
        strength: Number(characterData.Strength),
        bravery: Number(characterData.Bravery),
        experience: Number(characterData.Experience)
      },
      skills: {
        shooting: Number(characterData.Shooting),
        riding: Number(characterData.Riding),
        brawling: Number(characterData.Brawling)
      }
    };
    
    // Validate that all character attributes and skills are present and are valid numbers
    const isValid = (
      !isNaN(character.attributes.speed) &&
      !isNaN(character.attributes.gunAccuracy) &&
      !isNaN(character.attributes.throwingAccuracy) &&
      !isNaN(character.attributes.strength) &&
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
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw AI response:', response);
    
    // Return a default character if parsing fails
    return {
      name: 'John Doe',
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    };
  }
}

// Generate a field value for character creation
// Uses AI for character name and random generation for attributes and skills
export async function generateFieldValue(
  key: keyof Character['attributes'] | keyof Character['skills'] | 'name'
): Promise<string | number> {
  if (key === 'name') {
    const prompt = "Generate a name for a character in a Western-themed RPG. Provide only the name, no additional text.";
    const response = await getAIResponse(prompt);
    return response.narrative.trim();
  } else {
    return generateRandomValue(key as keyof Character['attributes'] | keyof Character['skills']);
  }
}

function generateRandomValue(key: keyof Character['attributes'] | keyof Character['skills']): number {
  const ranges: Record<keyof Character['attributes'] | keyof Character['skills'], [number, number]> = {
    speed: [1, 20],
    gunAccuracy: [1, 20],
    throwingAccuracy: [1, 20],
    strength: [8, 20],
    bravery: [1, 20],
    experience: [0, 11],
    shooting: [1, 100],
    riding: [1, 100],
    brawling: [1, 100],
  };

  const [min, max] = ranges[key];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a character summary based on the provided character data
export async function generateCharacterSummary(character: Character): Promise<string> {
  const prompt = `
    Generate a brief, engaging summary for a character in a Western-themed RPG based on the following attributes:
    Name: ${character.name}
    Attributes:
    ${Object.entries(character.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    Skills:
    ${Object.entries(character.skills).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    
    The summary should capture the essence of the character, their strengths, potential weaknesses, and how they might fit into a Western setting. Keep the tone consistent with a gritty, Wild West atmosphere.
  `;

  const response = await getAIResponse(prompt);
  return response.narrative;
}