import { InventoryItem } from '../../../types/item.types';
import { SuggestedAction } from '../../../types/campaign';
import { FallbackResponse } from '../types/gameService.types';

// Maximum time to wait for AI response before returning a fallback
export const AI_RESPONSE_TIMEOUT_MS = 15000; // 15 seconds

/**
 * Generates a fallback response when the AI is unavailable or times out.
 * Creates context-appropriate responses based on the type of action in the prompt.
 * 
 * The function categorizes prompts into different types:
 * - initializing: Starting a new game or session
 * - looking: Observing the environment
 * - movement: Traveling or changing location
 * - talking: Conversing with NPCs
 * - inventory: Managing items
 * - generic: Default fallback for uncategorized actions
 * 
 * @param prompt Optional user input text (safely handles undefined)
 * @param characterName Player character name (defaults to "the player")
 * @param inventoryItems Current inventory items (defaults to empty array)
 * @returns A structured FallbackResponse with narrative text and suggested actions
 */
export function generateFallbackResponse(
  prompt?: string,
  characterName: string = "the player",
  inventoryItems: InventoryItem[] = []
): FallbackResponse {
  try {
    // Handle undefined prompt gracefully
    const safePrompt = prompt || '';
    
    // Extract action words from the prompt to determine response type
    const promptLower = safePrompt.toLowerCase();
    const isLookingAction = /\b(look|see|view|observe|check)\b/.test(promptLower);
    const isMovementAction = /\b(go|walk|move|travel|head|run)\b/.test(promptLower);
    const isTalkingAction = /\b(talk|speak|ask|tell|say)\b/.test(promptLower);
    const isInventoryAction = /\b(inventory|items|gear|equip)\b/.test(promptLower);
    const isInitializing = /\b(initialize|init|start|begin|new|create)\b/.test(promptLower);
    
    let responseType = 'generic';
    if (isInitializing) responseType = 'initializing';
    else if (isLookingAction) responseType = 'looking';
    else if (isMovementAction) responseType = 'movement';
    else if (isTalkingAction) responseType = 'talking';
    else if (isInventoryAction) responseType = 'inventory';
    
    // Generate a contextual fallback response
    let narrative = "";
    const suggestedActions: SuggestedAction[] = [];
    
    switch (responseType) {
      case 'initializing':
        narrative = `${characterName} arrives in the town of Boothill, greeted by the sight of dusty streets and wooden buildings. The sun hangs low in the sky, casting long shadows across the main thoroughfare. The distant sounds of piano music drift from the saloon, while townsfolk move about their business.`;
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-init-1', title: "Explore the town", description: "Get to know Boothill", type: 'optional' as const },
          { id: 'fallback-init-2', title: "Visit the saloon", description: "Find information and refreshment", type: 'optional' as const },
          { id: 'fallback-init-3', title: "Look for work", description: "Earn some money", type: 'optional' as const },
          { id: 'fallback-init-4', title: "Check your gear", description: "See what you have", type: 'optional' as const }
        );
        break;
        
      case 'looking':
        narrative = `${characterName} looks around at the frontier town. The dusty main street stretches before you, lined with wooden buildings. A saloon stands nearby, and people move about their business.`;
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-look-1', title: "Enter the saloon", description: "Look for information", type: 'optional' as const },
          { id: 'fallback-look-2', title: "Approach the general store", description: "Check for supplies", type: 'optional' as const },
          { id: 'fallback-look-3', title: "Ask a passerby for information", description: "Learn about the town", type: 'optional' as const }
        );
        break;
        
      case 'movement':
        narrative = `${characterName} makes their way down the trail. The western landscape stretches out around you, with rolling hills and sparse vegetation. The path continues ahead.`;
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-move-1', title: "Continue forward", description: "Follow the trail", type: 'optional' as const },
          { id: 'fallback-move-2', title: "Look for a place to rest", description: "Take a break from traveling", type: 'optional' as const },
          { id: 'fallback-move-3', title: "Check your surroundings", description: "Make sure it's safe", type: 'optional' as const }
        );
        break;
        
      case 'talking':
        narrative = `${characterName} tries to engage in conversation. The person nods, listening to what you have to say. "Interesting," they respond, though they seem a bit distracted.`;
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-talk-1', title: "Ask about the town", description: "Get local information", type: 'optional' as const },
          { id: 'fallback-talk-2', title: "Inquire about work", description: "Look for opportunities", type: 'optional' as const },
          { id: 'fallback-talk-3', title: "End the conversation", description: "Move on to something else", type: 'optional' as const }
        );
        break;
        
      case 'inventory':
        const itemNames = inventoryItems.map(item => item.name.toLowerCase());
        narrative = `${characterName} checks their belongings. `;
        
        if (itemNames.length > 0) {
          narrative += `You have ${itemNames.slice(0, -1).join(', ')}${itemNames.length > 1 ? ' and ' + itemNames[itemNames.length - 1] : itemNames[0]}.`;
        } else {
          narrative += "You don't seem to have much with you at the moment.";
        }
        
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-inv-1', title: "Look for supplies", description: "Find more items", type: 'optional' as const },
          { id: 'fallback-inv-2', title: "Continue your journey", description: "Move on", type: 'optional' as const },
          { id: 'fallback-inv-3', title: "Rest for a moment", description: "Recover your strength", type: 'optional' as const }
        );
        break;
        
      default:
        narrative = `${characterName} considers their next move. The western frontier stretches out before you, full of opportunity and danger.`;
        // Updated fallback suggestedActions to match SuggestedAction type
        suggestedActions.push(
          { id: 'fallback-gen-1', title: "Look around", description: "Survey your surroundings", type: 'optional' as const },
          { id: 'fallback-gen-2', title: "Check your inventory", description: "See what you're carrying", type: 'optional' as const },
          { id: 'fallback-gen-3', title: "Rest for a while", description: "Recover your energy", type: 'optional' as const },
          { id: 'fallback-gen-4', title: "Continue forward", description: "Press on with your journey", type: 'optional' as const }
        );
    }
    
    return {
      narrative,
      location: { type: 'town', name: 'Boothill' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions
    };
  } catch (error) {
    // Ensure absolute fail-safety by catching any errors in fallback generation
    console.error("[AI Service] Error in fallback response generation:", error);
    
    // Provide ultra-minimal fallback response if even the fallback generator fails
    return {
      narrative: "You stand in the town of Boothill, considering your next move.",
      location: { type: 'town', name: 'Boothill' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [
        { id: 'emergency-1', title: "Look around", description: "Survey your surroundings", type: 'optional' as const },
        { id: 'emergency-2', title: "Continue forward", description: "Proceed on your journey", type: 'optional' as const }
      ]
    };
  }
}
