import { Character } from '../../types/character';
import { /* Intentionally empty */ } from '../../services/ai/gameService';
import { retryWithExponentialBackoff } from '../retry';
import { getAIModel } from './aiConfig';

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