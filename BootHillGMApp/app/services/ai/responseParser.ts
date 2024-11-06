import { AIResponse } from './types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';

// Helper function to clean metadata markers from any text
function cleanMetadataMarkers(text: string): string {
  // First clean any metadata between character names and actions
  text = text
    // Clean metadata between character name and action
    .replace(/(\w+)\s+ACQUIRED_ITEMS:\s*REMOVED_ITEMS:\s*(\w+|hits|misses)/g, '$1 $2')
    .replace(/(\w+)\s+ACQUIRED_ITEMS:\s*REMOVED_ITEMS:!/g, '$1!')
    // Clean standalone metadata markers
    .replace(/ACQUIRED_ITEMS:\s*(?:\[[^\]]*\]|\s*[^\n]*)/g, '')
    .replace(/REMOVED_ITEMS:\s*(?:\[[^\]]*\]|\s*[^\n]*)/g, '')
    .replace(/SUGGESTED_ACTIONS:\s*\[[^\]]*\]/g, '')
    // Clean any remaining markers
    .replace(/\s*ACQUIRED_ITEMS:\s*/g, '')
    .replace(/\s*REMOVED_ITEMS:\s*/g, '')
    .replace(/\s*SUGGESTED_ACTIONS:\s*/g, '')
    // Clean up extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
    
  return text;
}

export function parseAIResponse(text: string): AIResponse {
  const defaultResponse: AIResponse = {
    narrative: '',
    acquiredItems: [],
    removedItems: [],
    suggestedActions: []
  };

  if (!text) {
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
        // Skip lines that are pure metadata
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('acquired_items:') && lowerLine.trim().startsWith('acquired_items:')) return '';
        if (lowerLine.includes('removed_items:') && lowerLine.trim().startsWith('removed_items:')) return '';
        if (lowerLine.includes('location:') && lowerLine.trim().startsWith('location:')) return '';
        if (lowerLine.includes('combat:') && lowerLine.trim().startsWith('combat:')) return '';
        if (lowerLine.includes('suggested_actions:') && lowerLine.trim().startsWith('suggested_actions:')) return '';
        
        // Clean any remaining metadata markers from the line
        return cleanMetadataMarkers(line);
      })
      .filter(Boolean) // Remove empty lines
      .join('\n')
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
