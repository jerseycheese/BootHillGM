import { InventoryItem } from '../../types/item.types';

const WESTERN_THEMES = {
  SURVIVAL: ['resource scarcity', 'environmental challenges', 'physical hardship', 'self-reliance'],
  LAW_VS_OUTLAW: ['justice', 'order vs chaos', 'authority', 'moral choices'],
  FRONTIER_JUSTICE: ['personal honor', 'reputation', 'consequences']
} as const;

/**
 * Analyzes action text for western-themed content to guide AI response
 * Now with improved error handling for empty strings
 */
function analyzeActionThemes(action: string): Array<keyof typeof WESTERN_THEMES> {
  // Ensure action is a valid string
  if (!action || typeof action !== 'string') {
    return ['SURVIVAL']; // Default theme if invalid input
  }
  
  const actionLower = action.toLowerCase();
  const themes: Array<keyof typeof WESTERN_THEMES> = [];

  if (actionLower.match(/hunt|food|water|shelter|heal|rest|supplies|weather/)) {
    themes.push('SURVIVAL');
  }
  if (actionLower.match(/sheriff|deputy|jail|law|steal|rob|outlaw|wanted|bounty/)) {
    themes.push('LAW_VS_OUTLAW');
  }
  if (actionLower.match(/fight|duel|revenge|honor|defend|shoot|confront/)) {
    themes.push('FRONTIER_JUSTICE');
  }

  return themes.length ? themes : ['SURVIVAL'];
}

/**
 * Safely formats inventory items for prompt with error handling
 */
function formatInventoryItems(inventory: InventoryItem[] | undefined | null): string {
  // Check if inventory exists and is an array
  if (!inventory || !Array.isArray(inventory)) {
    return 'No items in inventory';
  }
  
  try {
    // Use safe mapping with error handling
    const itemStrings = inventory.map(item => {
      if (!item || typeof item !== 'object') {
        return '- Unknown item';
      }
      const name = item.name || 'Unnamed item';
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return `- ${name} (x${quantity})`;
    });
    
    return itemStrings.join('\n');
  } catch {
    return 'Error reading inventory';
  }
}

/**
 * Builds a complete game prompt with enhanced error handling
 * @param action Player's current action (defaults to empty string if undefined)
 * @param context Recent game context (defaults to generic context if undefined)
 * @param inventory Player's inventory (handled safely for undefined/null)
 */
export function buildGamePrompt(
  action: string = '',
  context: string = 'You are in a frontier town in the Old West.',
  inventory: InventoryItem[] = []
): string {
  
  try {
    // Handle null/undefined inputs with defaults
    const safeAction = action || 'explore surroundings';
    const safeContext = context || 'You are in a frontier town in the Old West.';
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    
    // Analyze themes with error handling
    const relevantThemes = analyzeActionThemes(safeAction);
    
    // Safe theme mapping with error handling
    let themeContext = '';
    try {
      themeContext = relevantThemes.map(theme => 
        `Consider ${theme.replace(/_/g, ' ').toLowerCase()} themes: ${WESTERN_THEMES[theme].join(', ')}.`
      ).join('\n    ');
    } catch {
      themeContext = 'Consider survival themes: resource scarcity, environmental challenges, physical hardship, self-reliance.';
    }
    
    // Get formatted inventory with error handling
    const inventoryText = formatInventoryItems(safeInventory);
    
    // Build the complete prompt
    const prompt = `
    You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

    1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
    2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
    3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
    4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
    5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
    6. Do not break character or reference modern-day ethics or sensibilities.
    
    ${themeContext}

    Recent story events:
    ${safeContext}

    Player's current inventory (Do not mention this directly in your response):
    ${inventoryText}

    Player input: "${safeAction}"

    Respond as the Game Master, describing the results of the player's action and advancing the story. 
    After your narrative response, on a new line, add:
    ACQUIRED_ITEMS: [List any items the player acquired, separated by commas. If no items were acquired, leave this empty]
    REMOVED_ITEMS: [List any items the player used, discarded, or lost, separated by commas. If no items were removed, leave this empty]
    SUGGESTED_ACTIONS: [{"text": "action description", "type": "action type", "context": "tooltip explanation"}]
    Include exactly 3 suggested actions with types: "basic" (look, move), "combat" (fight, defend), or "interaction" (talk, trade).`;
    
    return prompt;
  } catch {

    // Fallback simple prompt in case of errors
    return `
    You are an AI Game Master for a Western-themed RPG. 
    
    Recent story events:
    You are in a frontier town in the Old West.

    Player's current inventory:
    - Basic survival supplies

    Player input: "look around"

    Respond as the Game Master, describing the results of the player's action and advancing the story. 
    After your narrative response, add:
    ACQUIRED_ITEMS: []
    REMOVED_ITEMS: []
    SUGGESTED_ACTIONS: [{"text": "Explore the town", "type": "basic", "context": "Look around for points of interest"}, 
    {"text": "Check your supplies", "type": "basic", "context": "See what you have with you"}, 
    {"text": "Visit the saloon", "type": "interaction", "context": "Talk to locals and get information"}]`;
  }
}