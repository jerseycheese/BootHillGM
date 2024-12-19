import { getAIResponse } from '../../services/ai/gameService';

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