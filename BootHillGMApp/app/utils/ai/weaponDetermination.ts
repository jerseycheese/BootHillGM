import {} from '../../services/ai/gameService';
import { retryWithExponentialBackoff } from '../retry';
import { getAIModel } from './aiConfig';

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
    } catch {
    // Default to false if AI fails
    return false;
    }
}
