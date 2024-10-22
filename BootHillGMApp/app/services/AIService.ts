import { getAIResponse as originalGetAIResponse } from '../utils/aiService';
import { InventoryItem } from '../types/inventory';

class AIService {
  static async getAIResponse(prompt: string, journalContext: string, inventory: InventoryItem[]) {
    try {
      return await originalGetAIResponse(prompt, journalContext, inventory);
    } catch (error) {
      console.error('Error in AIService.getAIResponse:', error);
      throw new Error('Failed to get AI response');
    }
  }

  // Add more AI-related methods here as needed
}

export default AIService;
