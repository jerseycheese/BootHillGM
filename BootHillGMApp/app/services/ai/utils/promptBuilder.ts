import { InventoryItem } from '../../../types/item.types';
import { NarrativeContext, LoreStore } from '../../../types/narrative.types';
import { buildStoryPointPromptExtension } from '../../../utils/storyUtils';
import { buildComprehensiveContextExtension } from '../../../utils/decisionPromptBuilder';
import { buildLoreExtractionPrompt } from '../../../utils/loreExtraction';
import { buildLoreContextPrompt } from '../../../utils/loreContextBuilder';

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
  prompt: string,
  journalContext: string,
  inventory: InventoryItem[],
  storyProgressionContext?: string,
  narrativeContext?: NarrativeContext,
  loreStore?: LoreStore
): string {
  // Add story progression context to the prompt
  const storyContext = storyProgressionContext 
    ? `\nCurrent story progression:\n${storyProgressionContext}\n` 
    : '';
  
  // Generate decision-related context using the utilities
  const decisionsContext = narrativeContext
    ? buildComprehensiveContextExtension(narrativeContext)
    : '';
  
  // Add the story point prompt extension
  const storyPointPrompt = buildStoryPointPromptExtension();
  
  // Add lore extraction prompt
  const loreExtractionPrompt = buildLoreExtractionPrompt();
  
  // Add lore context if available
  const loreContext = (loreStore && narrativeContext)
    ? buildLoreContextPrompt(loreStore, narrativeContext)
    : '';

  // Format inventory for the prompt
  const inventoryText = inventory.map((item) => `- ${item.name} (x${item.quantity})`).join('\n');

  // Build the complete prompt
  return `
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
    ${journalContext}
    ${storyContext}
    ${decisionsContext}
    ${loreContext}

    Player's current inventory (Do not mention this directly in your response):
    ${inventoryText}

    Player input: "${prompt}"

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
}
