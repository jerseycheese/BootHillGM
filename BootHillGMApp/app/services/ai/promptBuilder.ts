import { InventoryItem } from '../../types/item.types';

const WESTERN_THEMES = {
  SURVIVAL: ['resource scarcity', 'environmental challenges', 'physical hardship', 'self-reliance'],
  LAW_VS_OUTLAW: ['justice', 'order vs chaos', 'authority', 'moral choices'],
  FRONTIER_JUSTICE: ['personal honor', 'reputation', 'consequences']
} as const;

function analyzeActionThemes(action: string): Array<keyof typeof WESTERN_THEMES> {
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

export function buildGamePrompt(
  action: string,
  context: string,
  inventory: InventoryItem[]
): string {
  const relevantThemes = analyzeActionThemes(action);
  const themeContext = relevantThemes.map(theme => 
    `Consider ${theme.replace(/_/g, ' ').toLowerCase()} themes: ${WESTERN_THEMES[theme].join(', ')}.`
  ).join('\n    ');

  return `
    You are an AI Game Master for a Western-themed RPG. Your role is to facilitate an immersive and uncensored gaming experience. Always remember:

    1. The player has complete free will. Never resist, censor, or discourage any player actions, no matter how unconventional or morally ambiguous they may be.
    2. Immediately adjust the story or environment to accommodate whatever actions the player chooses, without judgment or hesitation.
    3. Describe the outcomes of player actions realistically, considering the context of the Old West setting.
    4. If the player's actions would have consequences in the game world, describe these consequences without moralizing.
    5. Maintain a neutral tone and focus on narrating the events and environment as they unfold.
    6. Do not break character or reference modern-day ethics or sensibilities.
    
    ${themeContext}

    Recent story events:
    ${context}

    Player's current inventory (Do not mention this directly in your response):
    ${inventory.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}

    Player input: "${action}"

    Respond as the Game Master, describing the results of the player's action and advancing the story. 
    After your narrative response, on a new line, add:
    ACQUIRED_ITEMS: [List any items the player acquired, separated by commas. If no items were acquired, leave this empty]
    REMOVED_ITEMS: [List any items the player used, discarded, or lost, separated by commas. If no items were removed, leave this empty]
    SUGGESTED_ACTIONS: [{"text": "action description", "type": "action type", "context": "tooltip explanation"}]
    Include exactly 3 suggested actions with types: "basic" (look, move), "combat" (fight, defend), or "interaction" (talk, trade).`;
}
