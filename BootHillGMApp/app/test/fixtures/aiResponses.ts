/**
 * Test fixtures for AI responses used in various tests.
 */

import { Opponent, AIResponseRaw } from '../../types/ai.types'; 

export const baseSuccessResponse: Partial<AIResponseRaw> = { 
  location: { type: 'town', name: 'Tombstone' },
  combatInitiated: false,
  opponent: undefined,
  acquiredItems: [],
  removedItems: [],
  suggestedActions: [],
  storyProgression: undefined,
};

export const baseOpponentAttributes = {
  speed: 8,
  gunAccuracy: 7,
  throwingAccuracy: 6,
  baseStrength: 80,
  bravery: 6,
  experience: 5,
};

export const createMockAIResponse = (overrides: Partial<AIResponseRaw>): AIResponseRaw => {
  const defaultResponse: AIResponseRaw = {
    narrative: "Default narrative.",
    location: { type: 'town', name: 'Tombstone' }, 
    combatInitiated: false,
    opponent: null, 
    acquiredItems: [], 
    removedItems: [],  
    suggestedActions: [], 
    storyProgression: undefined,
    playerDecision: undefined,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merge = (target: any, source: any) => {
    for (const key in source) {
      // eslint-disable-next-line no-prototype-builtins
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue) && targetValue !== null && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          target[key] = merge({ ...targetValue }, sourceValue);
        } else {
          target[key] = sourceValue;
        }
      }
    }
    return target;
  };

  return merge({ ...defaultResponse }, overrides);
};

export const opponentWithDirectHealth: Opponent = {
  name: "Bandit Joe",
  health: 85, 
  attributes: {
    strength: 70,
    ...baseOpponentAttributes,
  }
};

export const opponentWithAttributeHealth: Opponent = {
  name: "Sheriff Williams",
  attributes: {
    strength: 85,
    health: 90, 
    ...baseOpponentAttributes,
    gunAccuracy: 9,
    bravery: 8,
    experience: 7,
  }
};

export const opponentWithOnlyStrength: Opponent = {
  name: "Outlaw Pete",
  attributes: {
    strength: 75, 
    ...baseOpponentAttributes,
    gunAccuracy: 6,
    throwingAccuracy: 5,
    bravery: 7,
    experience: 4,
  }
};

export const opponentMissingHealthAndStrength: Opponent = {
  name: "Mysterious Stranger",
};
