import { getAIModel } from './config';
import { buildGamePrompt } from './promptBuilder';
import { parseAIResponse } from './responseParser';
import { retryWithExponentialBackoff } from '../../utils/retry';
import { InventoryItem } from '../../types/inventory';


export async function getAIResponse(
  prompt: string, 
  journalContext: string, 
  inventory: InventoryItem[]
) {
  try {
    const model = getAIModel();
    const fullPrompt = buildGamePrompt(prompt, journalContext, inventory);
    
    const result = await retryWithExponentialBackoff(
      () => model.generateContent(fullPrompt)
    );
    
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    throw new Error("Unexpected AI response error");
  }
}
