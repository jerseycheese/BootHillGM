import {} from '../../services/ai/gameService';
import { retryWithExponentialBackoff } from '../retry';
import { getAIModel } from './aiConfig';

/**
 * Generates a concise third-person summary of a narrative text
 * 
 * @param action - The player's action that initiated the narrative
 * @param context - The resulting narrative text to summarize
 * @returns A concise summary string
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
     
    // If something went wrong, return a simple fallback summary
    const fallbackSummary = `${action} and observed the surroundings.`;
    return fallbackSummary;
  } catch (error) {
    
    // Return a simple fallback summary on error
    const errorFallbackSummary = `${action} in the Wild West.`;
    return errorFallbackSummary;
  }
}