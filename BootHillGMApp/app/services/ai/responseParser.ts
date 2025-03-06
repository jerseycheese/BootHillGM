import { AIResponse } from './types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { cleanText } from '../../utils/textCleaningUtils';

/**
 * Parses AI response text to extract structured game information.
 * Handles: narrative text, metadata markers, combat initiation, and suggested actions.
 * Cleans and formats content for game state updates.
 */
export function parseAIResponse(text: string): AIResponse | Character {
  // First try to parse as JSON character data
  try {
    const characterData = JSON.parse(text);
    if (characterData.name && characterData.attributes) {
      return {
        id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: characterData.name,
        attributes: {
          speed: characterData.attributes.speed,
          gunAccuracy: characterData.attributes.gunAccuracy,
          throwingAccuracy: characterData.attributes.throwingAccuracy,
          strength: characterData.attributes.strength,
          baseStrength: characterData.attributes.baseStrength,
          bravery: characterData.attributes.bravery,
          experience: characterData.attributes.experience
        },
        minAttributes: {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0
        },
        maxAttributes: {
          speed: 20,
          gunAccuracy: 20,
          throwingAccuracy: 20,
          strength: 20,
          baseStrength: 20,
          bravery: 20,
          experience: 20
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isNPC: true,
        isPlayer: false
      };
    }
  } catch {
    // If JSON parsing fails, fall through to regular parsing
  }

  // Fall back to regular AI response parsing
  const defaultResponse: AIResponse = {
    narrative: '',
    location: '',
    acquiredItems: [],
    removedItems: [],
    combatInitiated: false,
    opponent: undefined,
    suggestedActions: []
  };

  if (!text || text.trim().length === 0) {
    return defaultResponse;
  }

  try {
    // First extract all metadata before cleaning the text
    const locationMatch = text.match(/LOCATION:\s*([^:\n\[\]]+)/);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    const acquiredItemsMatch = text.match(/ACQUIRED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/);
    const removedItemsMatch = text.match(/REMOVED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/);

    const acquiredItems = acquiredItemsMatch 
      ? (acquiredItemsMatch[1] || acquiredItemsMatch[2] || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : [];
      
    const removedItems = removedItemsMatch
      ? (removedItemsMatch[1] || removedItemsMatch[2] || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : [];

    // Parse suggested actions
    let suggestedActions: SuggestedAction[] = [];
    const suggestedActionsMatch = text.match(/SUGGESTED_ACTIONS:\s*(\[[\s\S]*?\])/);
    if (suggestedActionsMatch) {
      try {
        const parsedActions = JSON.parse(suggestedActionsMatch[1]);
        if (Array.isArray(parsedActions)) {
          suggestedActions = parsedActions.filter(action => 
            action.text && 
            action.type && 
            ['basic', 'combat', 'interaction'].includes(action.type)
          );
        }
      } catch {
        // Failed to parse suggested actions, continue without them
      }
    }

    let combatInitiated = false;
    let opponent: Character | undefined;

    // Handle combat initiation and opponent creation
    const combatMatch = text.match(/COMBAT:\s*([^\n]+)/);
    if (combatMatch) {
      combatInitiated = true;
      // Clean the opponent name before creating the opponent object
      const opponentName = cleanText(combatMatch[1].trim());
      
      opponent = {
        id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: opponentName,
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          baseStrength: 10,
          bravery: 10,
          experience: 5
        },
        minAttributes: {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0
        },
        maxAttributes: {
          speed: 20,
          gunAccuracy: 20,
          throwingAccuracy: 20,
          strength: 20,
          baseStrength: 20,
          bravery: 20,
          experience: 20
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isNPC: true,
        isPlayer: false
      };
    }

    // Split text into lines and remove empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    // Process lines to handle multiline metadata blocks and join character actions
    const processedLines: string[] = [];
    let currentCharacterName: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip pure metadata lines
      if (/^(?:ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|COMBAT|SUGGESTED_ACTIONS):\s*(\[[^\]]*\]|\s*)$/i.test(line)) {
        continue;
      }

      // If this is a character name (single word or two words)
      if (/^[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?$/.test(line)) {
        currentCharacterName = line;
        continue;
      }

      // Clean metadata markers from the line
      line = line.replace(/\s*ACQUIRED_ITEMS:\s*(?:\[[^\]]*\]|\s*)/g, ' ')
                .replace(/\s*REMOVED_ITEMS:\s*(?:\[[^\]]*\]|\s*)/g, ' ')
                .replace(/\s*SUGGESTED_ACTIONS:\s*\[[^\]]*\]/g, ' ')
                .trim();

      if (line) {
        if (currentCharacterName) {
          // If we have a character name, this must be their action
          const fullLine = `${currentCharacterName} ${line}`;
          processedLines.push(fullLine);
          currentCharacterName = null;
        } else {
          // Regular narrative line
          processedLines.push(line);
        }
      }
    }

    // Join the processed lines into the final narrative
    const narrative = processedLines.join('\n')
      .replace(/\s+:\s+/g, ': ')
      .replace(/\s+,\s+/g, ', ')
      .replace(/\s+!/g, '!')
      .replace(/\s+\./g, '.')
      .replace(/\s+\?/g, '?')
      .replace(/\s+\)/g, ')')
      .replace(/\(\s+/g, '(')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return {
      narrative,
      location,
      combatInitiated,
      opponent,
      acquiredItems,
      removedItems,
      suggestedActions
    };
  } catch (error) {
    // If it's an API error, let it propagate
    if (error instanceof Error && 
       (error.message.includes('API Error') || error.message.includes('response'))) {
      throw error;
    }
    // For parsing errors, return a basic response
    return {
      ...defaultResponse,
      narrative: text
    };
  }
}
