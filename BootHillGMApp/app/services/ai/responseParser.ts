import { AIResponse } from './types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { cleanText } from '../../utils/textCleaningUtils';
import { PlayerDecision } from '../../types/narrative.types';
import { LocationType } from '../locationService';
import { RawPlayerDecision, PARSING_REGEX } from './types/rawTypes';
import { extractJSON } from './utils/jsonExtractor';
import { parsePlayerDecision } from './parsers/playerDecisionParser';
import { parseCharacterFromJSON, createOpponentCharacter } from './parsers/characterParser';

/**
 * Parses AI response text to extract structured game information.
 * Handles multiple formats of AI responses:
 * 1. JSON-formatted character data (for NPC generation)
 * 2. Structured text with metadata markers
 * 3. Mixed formats containing both narrative text and JSON structures (for playerDecision)
 * 
 * @param text - Raw text response from the AI model
 * @returns Structured game data as either an AIResponse or Character object
 */
export function parseAIResponse(text: string): AIResponse | Character {
  // First try to parse as JSON character data
  const characterData = parseCharacterFromJSON(text);
  if (characterData) {
    return characterData;
  }

  // Fall back to regular AI response parsing
  const defaultResponse: AIResponse = {
    narrative: '',
    location: { type: 'unknown' },
    acquiredItems: [],
    removedItems: [],
    combatInitiated: false,
    opponent: undefined,
    suggestedActions: [],
    playerDecision: undefined
  };

  if (!text || text.trim().length === 0) {
    return defaultResponse;
  }

  try {
    // Parse the structured response
    const parsedResponse = parseStructuredResponse(text);
    return parsedResponse;
  } catch (error) {
    // If it's an API error, let it propagate
    if (error instanceof Error &&
      (error.message.includes('API Error') || error.message.includes('response'))) {
      throw error;
    }
    
    // Log the specific error type for debugging
    if (process.env.NODE_ENV !== 'production') {
      if (error instanceof SyntaxError) {
        console.error('JSON syntax error in AI response parsing:', error.message);
      } else if (error instanceof TypeError) {
        console.error('Type error in AI response parsing:', error.message);
      } else {
        console.error('Unknown error in AI response parsing:', error);
      }
    }
    
    // For parsing errors, return a basic response
    return {
      ...defaultResponse,
      narrative: text
    };
  }
}

/**
 * Parse structured response from AI text output
 * 
 * @param text - The raw text from the AI response
 * @returns Structured AIResponse object
 */
function parseStructuredResponse(text: string): AIResponse {
  // Extract metadata and process the text
  const locationMatch = text.match(PARSING_REGEX.LOCATION);
  const locationName = locationMatch ? locationMatch[1].trim() : undefined;
  const location = locationName ? { type: 'town' as const, name: locationName } : { type: 'unknown' as const };

  // Extract acquired and removed items
  const acquiredItemsMatch = text.match(PARSING_REGEX.ACQUIRED_ITEMS);
  const removedItemsMatch = text.match(PARSING_REGEX.REMOVED_ITEMS);

  const acquiredItems: string[] = acquiredItemsMatch
    ? (acquiredItemsMatch[1] || acquiredItemsMatch[2] || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
    : [];

  const removedItems: string[] = removedItemsMatch
    ? (removedItemsMatch[1] || removedItemsMatch[2] || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
    : [];

  // Parse suggested actions
  const suggestedActions: SuggestedAction[] = [];
  const suggestedActionsMatch = text.match(PARSING_REGEX.SUGGESTED_ACTIONS);
  if (suggestedActionsMatch) {
    try {
      const parsedActions = JSON.parse(suggestedActionsMatch[1]);
      if (Array.isArray(parsedActions)) {
        parsedActions.forEach(action => {
          if (action.text && 
              action.type && 
              ['basic', 'combat', 'interaction'].includes(action.type)) {
            suggestedActions.push(action);
          }
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to parse suggested actions:', error instanceof Error ? error.message : 'Unknown error');
      }
      // Continue without suggested actions
    }
  }

  // Handle combat initiation and opponent creation
  let combatInitiated = false;
  let opponent: Character | undefined;
  const combatMatch = text.match(PARSING_REGEX.COMBAT);
  if (combatMatch) {
    combatInitiated = true;
    // Clean the opponent name before creating the opponent object
    const opponentName = cleanText(combatMatch[1].trim());
    opponent = createOpponentCharacter(opponentName);
  }

  // Process narrative text
  const narrative = processNarrativeText(text);

  // Try to extract playerDecision from the response
  const playerDecision = extractPlayerDecision(text, location);

  // Return the structured response
  return {
    narrative,
    location,
    combatInitiated,
    opponent,
    acquiredItems,
    removedItems,
    suggestedActions,
    playerDecision
  };
}

/**
 * Extract and process the narrative text from the AI response
 * 
 * @param text - Raw text from the AI
 * @returns Cleaned and processed narrative text
 */
function processNarrativeText(text: string): string {
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
    if (PARSING_REGEX.METADATA_LINE.test(line)) {
      continue;
    }

    // If this is a character name (single word or two words)
    if (PARSING_REGEX.CHARACTER_NAME.test(line)) {
      currentCharacterName = line;
      continue;
    }

    // Clean metadata markers from the line
    line = line.replace(PARSING_REGEX.ITEM_METADATA, ' ')
      .replace(PARSING_REGEX.REMOVED_METADATA, ' ')
      .replace(PARSING_REGEX.SUGGESTED_METADATA, ' ')
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
  return processedLines.join('\n')
    .replace(/\s+:\s+/g, ': ')
    .replace(/\s+,\s+/g, ', ')
    .replace(/\s+!/g, '!')
    .replace(/\s+\./g, '.')
    .replace(/\s+\?/g, '?')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+/g, '(')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract player decision from text if present
 * 
 * @param text - Raw text that might contain player decision
 * @param location - Current game location or other object
 * @returns Parsed PlayerDecision or undefined
 */
function extractPlayerDecision(text: string, location: LocationType | unknown): PlayerDecision | undefined {
  try {
    // First attempt: Try to parse the entire text as JSON
    const jsonResponse = extractJSON(text);
    if (jsonResponse && jsonResponse.playerDecision && typeof jsonResponse.playerDecision === 'object') {
      // Type check the location before using it
      if (location && typeof location === 'object' && 'type' in location) {
        return parsePlayerDecision(jsonResponse.playerDecision as RawPlayerDecision, location as LocationType);
      } else {
        return parsePlayerDecision(jsonResponse.playerDecision as RawPlayerDecision);
      }
    } 
    
    // Second attempt: Try to extract just the playerDecision part
    const decisionJson = extractJSON(text, 'playerDecision');
    if (decisionJson && decisionJson.playerDecision && typeof decisionJson.playerDecision === 'object') {
      // Type check the location before using it
      if (location && typeof location === 'object' && 'type' in location) {
        return parsePlayerDecision(decisionJson.playerDecision as RawPlayerDecision, location as LocationType);
      } else {
        return parsePlayerDecision(decisionJson.playerDecision as RawPlayerDecision);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      if (error instanceof SyntaxError) {
        console.warn('JSON syntax error in player decision extraction:', error.message);
      } else if (error instanceof TypeError) {
        console.warn('Type error in player decision extraction:', error.message);
      } else {
        console.warn('Unknown error in player decision extraction:', error);
      }
    }
  }
  
  // Failed to extract playerDecision, return undefined
  return undefined;
}

// Re-export functions from parsers for backward compatibility
export { parsePlayerDecision } from './parsers/playerDecisionParser';
