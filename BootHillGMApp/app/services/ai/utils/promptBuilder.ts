import { InventoryItem } from '../../../types/item.types';
import { NarrativeContext, LoreStore } from '../../../types/narrative.types';
import { buildStoryPointPromptExtension } from '../../../utils/storyUtils';
import { buildComprehensiveContextExtension } from '../../../utils/decisionPromptBuilder';
import { buildLoreExtractionPrompt } from '../../../utils/loreExtraction';
import { buildLoreContextPrompt } from '../../../utils/loreContextBuilder';

// Add debug console function for better troubleshooting
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG AIPromptBuilder]', ...args);
};

/**
 * Safely formats inventory items with error handling
 */
function formatInventoryItems(inventory: InventoryItem[] | undefined | null): string {
  if (!inventory || !Array.isArray(inventory)) {
    debug('Invalid inventory passed to formatInventoryItems:', inventory);
    return '- Basic survival supplies (default)';
  }
  
  try {
    const itemStrings = inventory.map(item => {
      if (!item || typeof item !== 'object') {
        return '- Unknown item';
      }
      
      const name = item.name || 'Unnamed item';
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return `- ${name} (x${quantity})`;
    });
    
    return itemStrings.length > 0 
      ? itemStrings.join('\n') 
      : '- No items in inventory';
  } catch (error) {
    debug('Error formatting inventory items:', error);
    return '- Error reading inventory';
  }
}

/**
 * Safely gets a utility prompt with error handling
 */
function safelyGetUtilityPrompt(utilityFn: (...args: Array<unknown>) => string, ...args: Array<unknown>): string {
  try {
    return utilityFn(...args) || '';
  } catch (error) {
    debug(`Error getting utility prompt:`, error);
    return '';  // Return empty string on error
  }
}

/**
 * Builds a comprehensive AI prompt incorporating all available context
 * 
 * This function combines player input, narrative context, inventory, story progression,
 * and lore information into a structured prompt for the AI model. It leverages
 * specialized prompt builders for various context types.
 * 
 * @param prompt Player's input text
 * @param journalContext Recent game events summary
 * @param inventory Player's current inventory
 * @param storyProgressionContext Optional story progression information
 * @param narrativeContext Optional narrative context with decision history
 * @param loreStore Optional lore store with game world facts
 * @returns A complete prompt string ready to send to the AI model
 */
export function buildAIPrompt(
  prompt: string = '',
  journalContext: string = 'Player has just arrived in a frontier town.',
  inventory: InventoryItem[] = [],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext,
  loreStore?: LoreStore
): string {
  debug('Building AI prompt with:', { 
    promptLength: prompt?.length || 0, 
    journalContextLength: journalContext?.length || 0,
    inventoryCount: Array.isArray(inventory) ? inventory.length : 0,
    hasStoryProgression: !!storyProgressionContext,
    hasNarrativeContext: !!narrativeContext,
    hasLoreStore: !!loreStore
  });
  
  try {
    // Ensure we have valid input values
    const safePrompt = prompt || 'look around';
    const safeJournalContext = journalContext || 'Player has just arrived in a frontier town.';
    
    // Add story progression context to the prompt
    const storyContext = storyProgressionContext 
      ? `\nCurrent story progression:\n${storyProgressionContext}\n` 
      : '';
    
    // Generate decision-related context using the utilities - with error handling
    let decisionsContext = '';
    if (narrativeContext) {
      try {
        decisionsContext = buildComprehensiveContextExtension(narrativeContext);
      } catch (e) {
        debug('Error building decisions context:', e);
      }
    }
    
    // Add the story point prompt extension - with error handling
    const storyPointPrompt = safelyGetUtilityPrompt(buildStoryPointPromptExtension);
    
    // Add lore extraction prompt - with error handling
    const loreExtractionPrompt = safelyGetUtilityPrompt(buildLoreExtractionPrompt);
    
    // Add lore context if available - with error handling
    let loreContext = '';
    if (loreStore && narrativeContext) {
      try {
        loreContext = buildLoreContextPrompt(loreStore, narrativeContext);
      } catch (e) {
        debug('Error building lore context:', e);
      }
    }

    // Format inventory for the prompt - with error handling
    const inventoryText = formatInventoryItems(inventory);

    // Build the complete prompt
    const finalPrompt = `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

      1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
      2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
      3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
      4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
      5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
      6. Do not break character or reference modern-day ethics or sensibilities.
      7. Remember and reference the player's past decisions when appropriate to create a coherent narrative.
      8. When presenting new choices, consider how they relate to the player's previous decisions.

      Recent important story events:
      ${safeJournalContext}
      ${storyContext}
      ${decisionsContext}
      ${loreContext}

      Player's current inventory (Do not mention this directly in your response):
      ${inventoryText}

      Player input: "${safePrompt}"

      Respond as the Game Master in JSON format, with the following structure:

      // Updated example format for suggestedActions
      {
        "narrative": "...",
        "location": { "...": "..." },
        "combatInitiated": false,
        "opponent": null,
        "acquiredItems": [ { "name": "Item Name", "category": "general|weapon|consumable|medical" } ], // Example: { "name": "Whiskey Bottle", "category": "consumable" }
        "removedItems": [],
        "suggestedActions": [
          { "id": "action-id-1", "title": "Action Title 1", "description": "Action Description 1", "type": "optional" },
          { "id": "action-id-2", "title": "Action Title 2", "description": "Action Description 2", "type": "optional" }
        ],
        "playerDecision": null, // or { ... }
        "storyProgression": null, // or { ... }
        "lore": null // or { ... }
      }

      Ensure you ALWAYS return valid JSON. Provide all fields, even if they are empty arrays or null. 
      Do NOT include any markdown code block delimiters (\`\`\`json or \`\`\`) in your response. Return ONLY the raw JSON object.
      
      Specific instructions:
      - The location object MUST match what's described in the narrative:
        - For towns: If you mention "Redemption" in the narrative, set location to { "type": "town", "name": "Redemption" }
        - For wilderness: Provide a clear description matching the narrative
        - Never use "Unknown Town" - always provide the actual town name
      - Only include the 'opponent' field if \`combatInitiated\` is true
      - Maintain perfect consistency between narrative text and location object
      - Example: If narrative says "You arrive in the town of Redemption", location must be { "type": "town", "name": "Redemption" }
      - Player Decision Points:
        - Include a playerDecision field when the narrative presents a meaningful choice
        - Each decision should have a prompt and 2-4 options
        - Each option needs text and impact fields
        - Set importance to: critical (major story impact), significant (important), moderate (medium impact), or minor (small impact)
        - Not every response needs a decision point - only include when meaningful choices arise
        - When creating decision options, reference relevant past player decisions to show continuity
        - For acquiredItems: Provide the item name and its category ('general', 'weapon', 'consumable', 'medical'). If unsure, use 'general'.
      
      ${storyPointPrompt}

      ${loreExtractionPrompt}
    `;
    
    debug('Generated prompt of length:', finalPrompt.length);
    return finalPrompt;
  } catch (error) {
    debug('Error building AI prompt:', error);
    
    // Fallback basic prompt in case of any errors
    return `
      You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive gaming experience.
      
      Recent story events:
      Player has just arrived in a frontier town.

      Player's current inventory:
      - Basic supplies

      Player input: "look around"

      Respond as the Game Master in JSON format, with the following structure:
      {
        "narrative": "As you step onto the main street of this dusty frontier town, you take in the sights around you. Wooden buildings line both sides of the wide dirt road. To your right stands a saloon, its swinging doors occasionally opening as patrons enter and leave. On your left is a general store with goods displayed in the window. Further down the street, you can make out what appears to be a sheriff's office, distinguished by the small jail attached to its side. The town is bustling with activity as locals go about their business.",
        "location": { "type": "town", "name": "Boot Hill" },
        "combatInitiated": false,
        "opponent": null,
        "acquiredItems": [],
        "removedItems": [],
        "suggestedActions": [
          { "id": "action-1", "title": "Visit the saloon", "description": "Step into the local drinking establishment", "type": "optional" },
          { "id": "action-2", "title": "Check out the general store", "description": "Browse goods and supplies", "type": "optional" },
          { "id": "action-3", "title": "Head to the sheriff's office", "description": "Introduce yourself to the local law", "type": "optional" }
        ],
        "playerDecision": null,
        "storyProgression": null,
        "lore": null
      }
      `;
  }
}