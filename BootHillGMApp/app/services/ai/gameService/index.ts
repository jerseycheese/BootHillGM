/**
 * Game Service for AI interactions
 */

import { InventoryItem } from '../../../types/item.types';
import { AIResponse } from '../types';

/**
 * Get an AI response for the provided input
 * @param input User's input text
 * @param _context Recent gameplay context
 * @param _inventory Player's current inventory
 * @returns AI response with narrative and gameplay elements
 */
export async function getAIResponse(
  input: string,
  _context: string,
  _inventory: InventoryItem[]
): Promise<AIResponse> {
  // This is a simplified implementation for testing
  return {
    narrative: `You ${input}. The sheriff nods slightly, watching your movements carefully.`,
    suggestedActions: [
      { text: "Talk to the sheriff", type: "interaction" },
      { text: "Look around the saloon", type: "basic" },
      { text: "Order a drink", type: "interaction" }
    ],
    acquiredItems: [],
    removedItems: [],
    location: undefined, // Using undefined instead of null
    playerDecision: undefined, // Using undefined for consistency
    combatInitiated: false,
    opponent: undefined // Using undefined for consistency
  };
}
