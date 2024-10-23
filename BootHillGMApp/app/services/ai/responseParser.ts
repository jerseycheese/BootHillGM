import { Character } from '../../types/character';

interface ParsedResponse {
  narrative: string;
  location?: string;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
}

export function parseAIResponse(text: string): ParsedResponse {
  const parts = text.split('LOCATION:');
  let narrative = parts[0].trim();
  const location = parts[1] ? parts[1].trim() : undefined;

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

  let combatInitiated = false;
  let opponent: Character | undefined;

  if (narrative.includes('COMBAT:')) {
    combatInitiated = true;
    const combatParts = narrative.split('COMBAT:');
    narrative = combatParts[0].trim();
    const opponentName = combatParts[1].trim();
    
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

  return {
    narrative,
    location,
    combatInitiated,
    opponent,
    acquiredItems: acquiredItems.filter(item => !item.startsWith("REMOVED_ITEMS:")),
    removedItems: removedItems.map(item => item.replace("REMOVED_ITEMS: ", "").trim()).filter(Boolean)
  };
}
