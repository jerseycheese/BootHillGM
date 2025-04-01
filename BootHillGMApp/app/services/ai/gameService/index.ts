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
    // Updated mock suggestedActions to match SuggestedAction type
    suggestedActions: [
      { id: 'mock-1', title: "Talk to the sheriff", description: "Ask about local events", type: 'optional' as const },
      { id: 'mock-2', title: "Look around the saloon", description: "See who's here", type: 'optional' as const },
      { id: 'mock-3', title: "Order a drink", description: "Get some refreshment", type: 'optional' as const }
    ],
    acquiredItems: [],
    removedItems: [],
    location: undefined, // Using undefined instead of null
    playerDecision: undefined, // Using undefined for consistency
    combatInitiated: false,
    opponent: undefined // Using undefined for consistency
  };
}
