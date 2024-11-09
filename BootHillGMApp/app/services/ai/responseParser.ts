import { AIResponse } from './types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { cleanMetadataMarkers } from '../../utils/textCleaningUtils';

/**
 * Parses AI response text to extract structured game information.
 * Handles: narrative text, metadata markers, combat initiation, and suggested actions.
 * Cleans and formats content for game state updates.
 */
export function parseAIResponse(text: string): AIResponse {
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
      } catch (e) {
        console.warn('Failed to parse suggested actions:', e);
      }
    }

    let combatInitiated = false;
    let opponent: Character | undefined;

    // Handle combat initiation and opponent creation
    const combatMatch = text.match(/COMBAT:\s*([^\n]+)/);
    if (combatMatch) {
      combatInitiated = true;
      // Clean the opponent name before creating the opponent object
      const opponentName = cleanMetadataMarkers(combatMatch[1].trim());
      
      opponent = {
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
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        },
        wounds: [],
        isUnconscious: false
      };
    }

    // Clean the narrative text thoroughly
    const narrative = text
      // First remove standalone metadata lines
      .split('\n')
      .map(line => {
        const lowerLine = line.toLowerCase().trim();
        // Remove lines that are only metadata
        if (/^(acquired_items|removed_items|location|combat|suggested_actions):\s*(\[[^\]]*\]|\s*)$/i.test(lowerLine)) {
          return '';
        }
        // Clean any remaining metadata markers from the line using the shared utility
        return cleanMetadataMarkers(line);
      })
      .filter(Boolean) // Remove empty lines
      .join(' ')
      .replace(/\s+/g, ' ')
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
