import { getAIResponse } from '../../services/ai/gameService';
import { Character } from '../../types/character';

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