/**
 * Narrative Generator
 * 
 * Creates contextually appropriate narrative text for fallback responses.
 * This component generates narrative descriptions based on context type and character information.
 * 
 * @module services/ai/fallback
 */

import { InventoryItem } from '../../../types/item.types';
import { ResponseContextType } from './constants';

/**
 * Generates narrative text based on the response context type
 * and character information.
 * 
 * @param contextType The type of context for the narrative
 * @param characterName The name of the character (defaults to "the player")
 * @param inventoryItems The character's inventory items (defaults to empty array)
 * @returns Generated narrative text
 */
export function generateNarrative(
  contextType: ResponseContextType,
  characterName: string = "the player",
  inventoryItems: InventoryItem[] = []
): string {
  switch (contextType) {
    case ResponseContextType.INITIALIZING:
      return `${characterName} arrives in the town of Boot Hill, greeted by the sight of dusty streets and wooden buildings. The sun hangs low in the sky, casting long shadows across the main thoroughfare. The distant sounds of piano music drift from the saloon, while townsfolk move about their business.`;
      
    case ResponseContextType.LOOKING:
      return `${characterName} looks around at the frontier town. The dusty main street stretches before you, lined with wooden buildings. A saloon stands nearby, and people move about their business. The mountains rise in the distance, a reminder of the vast wilderness beyond the town limits.`;
      
    case ResponseContextType.MOVEMENT:
      return `${characterName} makes their way down the trail. The western landscape stretches out around you, with rolling hills and sparse vegetation. The path continues ahead, winding through the rugged terrain. Birds call in the distance, and the wind carries the scent of sage.`;
      
    case ResponseContextType.TALKING:
      return `${characterName} tries to engage in conversation. The person regards you with a measured look, listening to what you have to say. "Interesting," they respond thoughtfully, considering your words. Their expression reveals little about their true thoughts.`;
      
    case ResponseContextType.INVENTORY:
      { // Add opening brace for block scope
        const itemNames = inventoryItems.map(item => item.name.toLowerCase());
        let narrative = `${characterName} checks their belongings. `;
        
        if (itemNames.length > 0) {
          narrative += `You have ${itemNames.slice(0, -1).join(', ')}${itemNames.length > 1 ? ' and ' + itemNames[itemNames.length - 1] : itemNames[0]}. Everything seems in order and ready for use when needed.`;
        } else {
          narrative += "You don't seem to have much with you at the moment. Perhaps finding some supplies should be a priority before venturing further.";
        }
        return narrative;
      } // Add closing brace for block scope
      
    default: // Generic context
      return `${characterName} considers their next move. The western frontier stretches out before you, full of opportunity and danger. The decisions you make here could shape your fortune - for better or worse. A moment's consideration might be the difference between success and disaster.`;
  }
}
