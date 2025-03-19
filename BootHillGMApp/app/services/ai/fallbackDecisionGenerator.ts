/**
 * Fallback Decision Generator
 * 
 * This module provides fallback decision generation capabilities when
 * AI-powered generation fails or is unavailable. It ensures a graceful
 * degradation path with reasonable templated decisions.
 */

import { NarrativeState, PlayerDecision } from '../../types/narrative.types';
import { Character } from '../../types/character';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a fallback decision when AI generation fails
 * 
 * @param narrativeState Current narrative state
 * @param character Player character
 * @returns Fallback player decision
 */
export function generateFallbackDecision(
  narrativeState: NarrativeState,
  character: Character
): PlayerDecision {
  // Extract context for situational awareness
  const locationContext = narrativeState.currentStoryPoint?.locationChange 
    ? extractLocationName(narrativeState.currentStoryPoint.locationChange)
    : 'current location';

  const recentNarrative = narrativeState.narrativeHistory.length > 0
    ? narrativeState.narrativeHistory[narrativeState.narrativeHistory.length - 1]
    : '';

  // Determine the most appropriate fallback based on context
  if (isInCombatContext(recentNarrative)) {
    return generateCombatDecision(character, locationContext);
  } else if (isInTownContext(locationContext, narrativeState)) {
    return generateTownDecision(character, locationContext);
  } else if (isInDialogueContext(recentNarrative)) {
    return generateDialogueDecision(character);
  } else if (isInWildernessContext(locationContext, narrativeState)) {
    return generateWildernessDecision(character);
  } else {
    // Generic fallback as last resort
    return generateGenericDecision(character);
  }
}

/**
 * Check if the narrative context suggests a combat situation
 */
function isInCombatContext(narrative: string): boolean {
  const combatKeywords = [
    'fight', 'gun', 'shoot', 'attack', 'defend', 'dodge', 
    'punch', 'hit', 'shot', 'weapon', 'battle', 'duel'
  ];

  return combatKeywords.some(keyword => 
    narrative.toLowerCase().includes(keyword)
  );
}

/**
 * Check if the location context suggests being in a town
 */
function isInTownContext(location: string, state: NarrativeState): boolean {
  // Check for direct town indicator
  if (location.includes('town') || 
     (state.currentStoryPoint?.locationChange && 
      typeof state.currentStoryPoint.locationChange !== 'string' &&
      state.currentStoryPoint.locationChange.type === 'town')) {
    return true;
  }
  
  // Check for town-associated keywords
  const townKeywords = [
    'saloon', 'bar', 'sheriff', 'store', 'bank', 'street',
    'hotel', 'building', 'jail', 'office', 'church'
  ];
  
  const recentNarrative = state.narrativeHistory.slice(-2).join(' ');
  return townKeywords.some(keyword => 
    recentNarrative.toLowerCase().includes(keyword)
  );
}

/**
 * Check if the narrative context suggests a dialogue situation
 */
function isInDialogueContext(narrative: string): boolean {
  // Look for quotation marks or dialogue indicators
  return narrative.includes('"') || 
         narrative.includes('"') || 
         narrative.includes("'") || 
         /\b(said|asked|replied|spoke|talked)\b/i.test(narrative);
}

/**
 * Check if the location context suggests being in the wilderness
 */
function isInWildernessContext(location: string, state: NarrativeState): boolean {
  // Check for direct wilderness indicator
  if (location.includes('wilderness') || 
     (state.currentStoryPoint?.locationChange && 
      typeof state.currentStoryPoint.locationChange !== 'string' &&
      state.currentStoryPoint.locationChange.type === 'wilderness')) {
    return true;
  }
  
  // Check for wilderness-associated keywords
  const wildernessKeywords = [
    'forest', 'mountain', 'river', 'trail', 'desert', 'canyon',
    'camp', 'wildlife', 'trees', 'rocks', 'ridge'
  ];
  
  const recentNarrative = state.narrativeHistory.slice(-2).join(' ');
  return wildernessKeywords.some(keyword => 
    recentNarrative.toLowerCase().includes(keyword)
  );
}

/**
 * Extract a readable location name from location data
 */
function extractLocationName(location: unknown): string {
  if (typeof location === 'string') {
    return location;
  }
  
  if (location && typeof location === 'object') {
    const locationObj = location as Record<string, unknown>;
    
    if ('type' in locationObj) {
      const type = locationObj.type as string;
      
      if (type === 'town' && 'name' in locationObj) {
        return `the town of ${locationObj.name}`;
      }
      
      if (type === 'landmark' && 'name' in locationObj) {
        return `${locationObj.name}`;
      }
      
      return type;
    }
  }
  
  return 'this location';
}

/**
 * Generate a combat-relevant decision
 */
function generateCombatDecision(character: Character, location: string): PlayerDecision {
  return {
    id: `combat-fallback-${uuidv4()}`,
    prompt: 'How do you respond to the threat?',
    timestamp: Date.now(),
    options: [
      {
        id: `combat-opt1-${uuidv4()}`,
        text: 'Stand your ground and fight',
        impact: 'Direct confrontation is risky but might earn respect.',
        tags: ['brave', 'combat']
      },
      {
        id: `combat-opt2-${uuidv4()}`,
        text: 'Look for tactical advantage',
        impact: 'Smart positioning could give you the upper hand.',
        tags: ['tactical', 'combat']
      },
      {
        id: `combat-opt3-${uuidv4()}`,
        text: 'Try to de-escalate the situation',
        impact: 'Avoiding bloodshed might be possible with the right words.',
        tags: ['peaceful', 'social']
      },
      {
        id: `combat-opt4-${uuidv4()}`,
        text: 'Create a diversion and escape',
        impact: 'Live to fight another day, but might be seen as cowardly.',
        tags: ['cautious', 'evasive']
      }
    ],
    context: `Tensions are high in ${location}.`,
    importance: 'significant',
    characters: ['Player Character'],
    aiGenerated: false
  };
}

/**
 * Generate a town-specific decision
 */
function generateTownDecision(_character: Character, location: string): PlayerDecision {
  return {
    id: `town-fallback-${uuidv4()}`,
    prompt: `What would you like to do in ${location}?`,
    timestamp: Date.now(),
    options: [
      {
        id: `town-opt1-${uuidv4()}`,
        text: 'Visit the saloon for information',
        impact: 'Saloons are good places to hear gossip and find work.',
        tags: ['town', 'social']
      },
      {
        id: `town-opt2-${uuidv4()}`,
        text: 'Check in with the sheriff',
        impact: 'The law might have bounties or need help with local issues.',
        tags: ['town', 'lawful']
      },
      {
        id: `town-opt3-${uuidv4()}`,
        text: 'Browse the general store',
        impact: 'Might find useful supplies or hear news from the shopkeeper.',
        tags: ['town', 'shopping']
      },
      {
        id: `town-opt4-${uuidv4()}`,
        text: 'Look for work opportunities',
        impact: 'There\'s always someone who needs help in a frontier town.',
        tags: ['town', 'opportunity']
      }
    ],
    context: `You have some time to spend in ${location}.`,
    importance: 'moderate',
    characters: ['Player Character'],
    aiGenerated: false
  };
}

/**
 * Generate a dialogue-relevant decision
 */
function generateDialogueDecision(_character: Character): PlayerDecision {
  return {
    id: `dialogue-fallback-${uuidv4()}`,
    prompt: 'How do you respond?',
    timestamp: Date.now(),
    options: [
      {
        id: `dialogue-opt1-${uuidv4()}`,
        text: 'Respond honestly',
        impact: 'Honesty might be appreciated, but could have consequences.',
        tags: ['honest', 'direct']
      },
      {
        id: `dialogue-opt2-${uuidv4()}`,
        text: 'Deflect with a question of your own',
        impact: 'Keep your cards close to your chest for now.',
        tags: ['cautious', 'evasive']
      },
      {
        id: `dialogue-opt3-${uuidv4()}`,
        text: 'Tell them what they want to hear',
        impact: 'May smooth things over now, but could cause problems later.',
        tags: ['deceptive', 'diplomatic']
      },
      {
        id: `dialogue-opt4-${uuidv4()}`,
        text: 'Change the subject',
        impact: 'Avoid the topic entirely, but they might notice your evasion.',
        tags: ['evasive', 'cautious']
      }
    ],
    context: 'The conversation has reached an important point.',
    importance: 'moderate',
    characters: ['Player Character'],
    aiGenerated: false
  };
}

/**
 * Generate a wilderness-specific decision
 */
function generateWildernessDecision(_character: Character): PlayerDecision {
  return {
    id: `wilderness-fallback-${uuidv4()}`,
    prompt: 'What\'s your next move in the wilderness?',
    timestamp: Date.now(),
    options: [
      {
        id: `wilderness-opt1-${uuidv4()}`,
        text: 'Continue following the trail',
        impact: 'The established path is safer but might take longer.',
        tags: ['wilderness', 'cautious']
      },
      {
        id: `wilderness-opt2-${uuidv4()}`,
        text: 'Look for signs of danger or opportunity',
        impact: 'Staying alert might reveal hidden threats or resources.',
        tags: ['wilderness', 'observant']
      },
      {
        id: `wilderness-opt3-${uuidv4()}`,
        text: 'Take a shortcut across rougher terrain',
        impact: 'Riskier but could save time if you navigate successfully.',
        tags: ['wilderness', 'risky']
      },
      {
        id: `wilderness-opt4-${uuidv4()}`,
        text: 'Make camp and rest',
        impact: 'Recover strength but delay progress and possibly attract attention.',
        tags: ['wilderness', 'cautious']
      }
    ],
    context: 'The wilderness presents both dangers and opportunities.',
    importance: 'moderate',
    characters: ['Player Character'],
    aiGenerated: false
  };
}

/**
 * Generate a generic decision as final fallback
 */
function generateGenericDecision(_character: Character): PlayerDecision {
  return {
    id: `generic-fallback-${uuidv4()}`,
    prompt: 'What would you like to do next?',
    timestamp: Date.now(),
    options: [
      {
        id: `generic-opt1-${uuidv4()}`,
        text: 'Investigate further',
        impact: 'Gather more information before committing to a course of action.',
        tags: ['cautious', 'observant']
      },
      {
        id: `generic-opt2-${uuidv4()}`,
        text: 'Take decisive action',
        impact: 'Acting quickly might give you an advantage or prevent problems.',
        tags: ['brave', 'direct']
      },
      {
        id: `generic-opt3-${uuidv4()}`,
        text: 'Consider alternatives',
        impact: 'There may be options you haven\'t considered yet.',
        tags: ['thoughtful', 'creative']
      },
      {
        id: `generic-opt4-${uuidv4()}`,
        text: 'Wait and see what develops',
        impact: 'Sometimes patience is the best approach.',
        tags: ['patient', 'cautious']
      }
    ],
    context: 'You need to decide your next course of action.',
    importance: 'moderate',
    characters: ['Player Character'],
    aiGenerated: false
  };
}