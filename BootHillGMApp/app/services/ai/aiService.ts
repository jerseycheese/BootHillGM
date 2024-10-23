import { getAIModel } from './config';
import { InventoryItem } from '../../types/inventory';

export async function getAIResponse(prompt: string, journalContext: string, inventory: InventoryItem[]) {
  try {
    const model = getAIModel();

    const fullPrompt = `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience.
      
      Current inventory for reference:
      ${inventory.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}

      Remember to:
      1. When the player acquires items, list them after "ACQUIRED_ITEMS:" on a new line
      2. When the player uses or loses items, list them after "REMOVED_ITEMS:" on a new line
      3. Always specify these lists even if empty
      
      Example format:
      [Your narrative response...]
      ACQUIRED_ITEMS: [Rock]
      REMOVED_ITEMS: []

      Recent story events:
      ${journalContext}

      Player input: "${prompt}"

      Respond as the Game Master:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Log the parsing results
    const acquiredItemsMatch = text.match(/ACQUIRED_ITEMS:\s*(.*?)(?=\n|$)/);
    const removedItemsMatch = text.match(/REMOVED_ITEMS:\s*(.*?)(?=\n|$)/);

    const acquiredItems = acquiredItemsMatch 
      ? acquiredItemsMatch[1].split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => item.replace(/^\[|\]$/g, ''))
      : [];
      
    const removedItems = removedItemsMatch
      ? removedItemsMatch[1].split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => item.replace(/^\[|\]$/g, ''))
      : [];

    return {
      narrative: text,
      acquiredItems,
      removedItems,
      location: text.split('LOCATION:')[1]?.trim() || undefined,
      combatInitiated: text.includes('COMBAT:'),
      opponent: text.includes('COMBAT:') ? {
        name: text.split('COMBAT:')[1]?.trim(),
        health: 100,
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          bravery: 10,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        }
      } : undefined
    };
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw error;
  }
}
