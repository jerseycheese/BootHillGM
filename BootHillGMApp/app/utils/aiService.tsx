import { GoogleGenerativeAI } from "@google/generative-ai";

// TODO: Improve formatting of AI messages for better readability and engagement

const apiKey = typeof window === 'undefined' ? process.env.GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI response:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
        return "Sorry, there's an issue with the AI service configuration. Please try again later.";
      }
    }
    return "An unexpected error occurred. Please try again.";
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

  return getAIResponse(prompt);
}

export async function getAttributeDescription(attribute: string): Promise<string> {
  const prompt = `
    Provide a brief, engaging description of the '${attribute}' attribute or skill in the context of a Western character.
    Explain its importance and how it might affect the character's actions in the game.
    Keep the description concise, around 2-3 sentences.
  `;

  return getAIResponse(prompt);
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