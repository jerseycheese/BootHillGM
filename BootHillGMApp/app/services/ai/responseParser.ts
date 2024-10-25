import { AIResponse } from './types';
import { Character } from '../../types/character';

export function parseAIResponse(text: string): AIResponse {
  if (!text) {
    return {
      narrative: '',
      acquiredItems: [],
      removedItems: []
    };
  }

  try {
    // Extract location if present
    const locationMatch = text.match(/LOCATION:\s*([^:\n\[\]]+)/);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    const acquiredItemsMatch = text.match(/ACQUIRED_ITEMS:\s*\[(.*?)\]/);
    const removedItemsMatch = text.match(/REMOVED_ITEMS:\s*\[(.*?)\]/);

    const acquiredItems = acquiredItemsMatch 
      ? acquiredItemsMatch[1]
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : [];
      
    const removedItems = removedItemsMatch
      ? removedItemsMatch[1]
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : [];

    let combatInitiated = false;
    let opponent: Character | undefined;

    if (text.includes('COMBAT:')) {
      combatInitiated = true;
      const combatMatch = text.match(/COMBAT:\s*([^\n]+)/);
      const opponentName = combatMatch ? combatMatch[1].trim() : 'Unknown Opponent';
      
      opponent = {
        name: opponentName,
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
      };
    }

    // Clean narrative text by removing metadata lines
    const narrative = text
      .split('\n')
      .filter(line => 
        !line.includes('ACQUIRED_ITEMS:') &&
        !line.includes('REMOVED_ITEMS:') &&
        !line.includes('LOCATION:') &&
        !line.includes('COMBAT:')
      )
      .join('\n')
      .trim();

    return {
      narrative,
      location,
      combatInitiated,
      opponent,
      acquiredItems,
      removedItems
    };
  } catch (error) {
    // If it's an API error, let it propagate
    if (error instanceof Error && 
       (error.message.includes('API Error') || error.message.includes('response'))) {
      throw error;
    }
    // For parsing errors, return a basic response
    return {
      narrative: text,
      acquiredItems: [],
      removedItems: []
    };
  }
}
