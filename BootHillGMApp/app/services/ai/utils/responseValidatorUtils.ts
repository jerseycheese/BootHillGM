/**
 * Utility functions for response validation and processing
 * 
 * This module contains helper functions used by the main response validator
 * to analyze narrative context, generate appropriate action text, and ensure
 * action type diversity.
 * 
 * @see responseValidator.ts for the main validation functions
 * @see responseValidatorConstants.ts for constants used in these utilities
 */
import { ActionType, SuggestedAction } from '../../../types/campaign';
import { extractEntitiesFromText } from './entityExtractor';
import { CONTEXT_PATTERNS } from './responseValidatorConstants';

/**
 * Analyzes narrative text to determine appropriate action types based on context
 * by matching key patterns and themes in the text
 * 
 * @param narrativeText - Recent narrative entries to analyze for context
 * @returns Distribution of action types weighted by contextual relevance
 */
export function analyzeNarrativeContext(narrativeText: string): Record<string, number> {
  const actionWeights: Record<string, number> = {
    'main': 1,
    'side': 1, 
    'optional': 1,
    'combat': 1,
    'basic': 1,
    'interaction': 1,
    'chaotic': 1,
    'danger': 1
  };
  
  // Increase weights based on context matches
  if (CONTEXT_PATTERNS.COMBAT.test(narrativeText)) {
    actionWeights.combat += 3;
    actionWeights.danger += 2;
    actionWeights.chaotic += 1;
  }
  
  if (CONTEXT_PATTERNS.SOCIAL.test(narrativeText)) {
    actionWeights.interaction += 5; 
    actionWeights.basic += 1;
    actionWeights.side += 1;
  }
  
  if (CONTEXT_PATTERNS.EXPLORATION.test(narrativeText)) {
    actionWeights.basic += 3;
    actionWeights.interaction += 2;
    actionWeights.side += 1;
  }
  
  if (CONTEXT_PATTERNS.CHAOTIC.test(narrativeText)) {
    actionWeights.chaotic += 3;
    actionWeights.danger += 2;
    actionWeights.combat += 1;
  }
  
  if (CONTEXT_PATTERNS.MAIN.test(narrativeText)) {
    actionWeights.main += 3;
    actionWeights.basic += 1;
  }
  
  if (CONTEXT_PATTERNS.SIDE.test(narrativeText)) {
    actionWeights.side += 3;
    actionWeights.optional += 2;
  }
  
  if (CONTEXT_PATTERNS.INTERACTION.test(narrativeText)) {
    actionWeights.interaction += 3;
    actionWeights.basic += 1;
  }
  
  if (CONTEXT_PATTERNS.DANGER.test(narrativeText)) {
    actionWeights.danger += 3;
    actionWeights.combat += 1;
  }
  
  return actionWeights;
}

/**
 * Selects an action type based on weighted distribution from context analysis
 * 
 * @param actionWeights - Weighted distribution of action types
 * @returns Selected action type based on weighted probability
 */
export function selectActionTypeFromWeights(actionWeights: Record<string, number>): string {
  const totalWeight = Object.values(actionWeights).reduce((sum, weight) => sum + weight, 0);
  let randomValue = Math.random() * totalWeight;
  
  // Sort entries alphabetically by type to ensure consistent iteration order
  for (const [type, weight] of Object.entries(actionWeights).sort()) {
    randomValue -= weight;
    if (randomValue <= 0) {
      return type;
    }
  }
  
  // Fallback to a random action type if something goes wrong
  const allTypes = Object.keys(actionWeights);
  return allTypes[Math.floor(Math.random() * allTypes.length)];
}

/**
 * Generates context-aware action text based on entities and themes in the narrative
 * by extracting characters, locations, and items to create dynamic suggestions
 * 
 * @param narrativeText - Recent narrative entries to extract context from
 * @param actionType - The type of action to generate
 * @returns Generated action text appropriate for the context and action type
 */
export function generateContextAwareActionText(narrativeText: string, actionType: string): string {
  const entities = extractEntitiesFromText(narrativeText);
  const characters = entities.characters || [];
  const locations = entities.locations || [];
  const items = entities.items || [];
  
  // Create action text templates for each action type
  const actionTemplates: Record<string, string[]> = {
    'main': [
      `Continue with the main objective`,
      `Focus on the primary mission`,
      `Advance the main storyline`,
      characters.length > 0 ? `Get ${characters[0]}'s help with your mission` : `Get help with your mission`,
      locations.length > 0 ? `Head to ${locations[0]} to continue your quest` : `Find the next important location`
    ],
    'side': [
      `Explore a side opportunity`,
      `Take on an additional task`,
      `Investigate something interesting`,
      characters.length > 0 ? `Ask ${characters[0]} about local rumors` : `Ask about local rumors`,
      items.length > 0 ? `Find out more about the ${items[0]}` : `Look for valuable items`
    ],
    'optional': [
      `Consider an optional path`,
      `Try something different`,
      `Take a detour`,
      characters.length > 0 ? `Chat casually with ${characters[0]}` : `Take a moment for yourself`,
      locations.length > 0 ? `Visit ${locations[0]} for a change of pace` : `Find a quiet spot to rest`
    ],
    'combat': [
      `Prepare for a fight`,
      `Take an aggressive approach`,
      `Ready your weapons`,
      characters.length > 0 ? `Challenge ${characters[0]} to a duel` : `Look for trouble`,
      items.length > 0 ? `Use your ${items[0]} to gain an advantage` : `Draw your weapon`
    ],
    'basic': [
      `Take a simpler approach`,
      `Focus on the basics`,
      `Keep things straightforward`,
      locations.length > 0 ? `Walk around ${locations[0]}` : `Look around carefully`,
      items.length > 0 ? `Check your ${items[0]}` : `Take stock of your situation`
    ],
    'interaction': [
      `Interact with your surroundings`,
      `Examine objects more closely`,
      locations.length > 0 ? `Search ${locations[0]} for useful items` : `Search the area for useful items`,
      items.length > 0 ? `Use the ${items[0]}` : `Use something in your inventory`,
      characters.length > 0 ? `Give something to ${characters[0]}` : `Offer something as a gift`
    ],
    'chaotic': [
      `Do something unexpected`,
      `Take a wild risk`,
      `Create a distraction`,
      characters.length > 0 ? `Provoke ${characters[0]}` : `Provoke someone`,
      items.length > 0 ? `Misuse the ${items[0]} in a creative way` : `Do something unpredictable`
    ],
    'danger': [
      `Take a cautious approach`,
      `Look out for threats`,
      `Prepare for the worst`,
      characters.length > 0 ? `Be wary of ${characters[0]}` : `Be on your guard`,
      locations.length > 0 ? `Check for dangers in ${locations[0]}` : `Scan for potential threats`
    ]
  };
  
  // Select a random template from the appropriate action type
  const templates = actionTemplates[actionType] || actionTemplates['basic'];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Ensures essential action types ('main', 'side', 'combat', 'interaction') are represented
 * in the suggested actions array, preserving original AI text.
 * It modifies the `type` of existing actions if necessary, prioritizing replacement of
 * 'optional', duplicate, or non-essential types first.
 * 
 * Note: This function modifies the input `actions` array directly.
 *
 * @param actions - The array of suggested actions to check and modify
 */
export function ensureDiverseActionTypes(actions: SuggestedAction[]): void {
  if (!actions) return;
  
  // Check which types are missing
  const existingTypes = new Set(actions.map(action => action.type));
  const essentialTypes = ['main', 'side', 'combat', 'interaction'];
  const missingTypes = essentialTypes.filter(type => !existingTypes.has(type as ActionType));
  
  // If we have missing types, replace some of the less important ones
  // Refined Multi-Pass Replacement Logic:
  if (missingTypes.length > 0) {
    const replaceableIndices: number[] = [];
    const typeCounts: Record<string, number> = {};
    actions.forEach(action => {
        typeCounts[action.type] = (typeCounts[action.type] || 0) + 1;
    });

    // Pass 1: Optional types (highest priority for replacement)
    actions.forEach((action, index) => {
        if (action.type === 'optional' && replaceableIndices.length < missingTypes.length) {
             if (!replaceableIndices.includes(index)) replaceableIndices.push(index);
        }
    });

    // Pass 2: Duplicates (leave one of each type)
    actions.forEach((action, index) => {
        if (replaceableIndices.length < missingTypes.length && typeCounts[action.type] > 1) {
             if (!replaceableIndices.includes(index)) {
                 replaceableIndices.push(index);
                 typeCounts[action.type]--;
             }
        }
    });

    // Pass 3: Non-essential types (lowest priority for replacement)
    const nonEssentialTypes: ActionType[] = ['basic', 'chaotic', 'danger'];
    actions.forEach((action, index) => {
        if (replaceableIndices.length < missingTypes.length && nonEssentialTypes.includes(action.type as ActionType)) {
             if (!replaceableIndices.includes(index)) replaceableIndices.push(index);
        }
    });
    
    // Replace actions using the prioritized list of indices
    let replacedCount = 0;
    for (let i = 0; i < missingTypes.length; i++) {
        const missingType = missingTypes[i];
        if (replacedCount < replaceableIndices.length) {
            // Use a preferred replaceable index
            const replaceIndex = replaceableIndices[replacedCount];
            if (actions[replaceIndex].type !== missingType) {
                 actions[replaceIndex].type = missingType as ActionType;
            }
            replacedCount++;
        } else {
            // Last resort: If no preferred replaceable actions left, overwrite sequentially starting from index 0
            const fallbackIndex = i;
            if (actions[fallbackIndex]) {
                 if (actions[fallbackIndex].type !== missingType) {
                    actions[fallbackIndex].type = missingType as ActionType;
                 }
            } else {
                 break; // Stop if we run out of actions
            }
        }
    }
  }
}
