import { AIResponse } from './types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { cleanText } from '../../utils/textCleaningUtils';
import { v4 as uuidv4 } from 'uuid';
import { PlayerDecision, PlayerDecisionOption, DecisionImportance } from '../../types/narrative.types';
import { LocationType } from '../locationService';

/**
 * Interface representing the raw decision data as returned from the AI model
 * before validation and transformation into the application's type system.
 */
interface RawPlayerDecision {
  prompt?: string;
  options?: RawDecisionOption[];
  importance?: string;
  context?: string;
  characters?: string[];
}

/**
 * Interface representing a raw decision option from the AI model
 * before validation and transformation.
 */
interface RawDecisionOption {
  text?: string;
  impact?: string;
  tags?: string[];
}

/**
 * Custom error types for more specific error handling
 * Prefixed with underscore to indicate they're defined but not directly used
 */
class _ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

class _ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Parses a player decision from AI response data.
 * Validates and transforms the raw decision data into a structured PlayerDecision object.
 * 
 * @param decisionData - Raw decision data from AI response
 * @param currentLocation - Current game location
 * @returns Parsed PlayerDecision object or undefined if invalid
 */
export function parsePlayerDecision(
  decisionData: RawPlayerDecision,
  currentLocation?: LocationType
): PlayerDecision | undefined {
  if (!decisionData || typeof decisionData !== 'object') {
    return undefined;
  }

  // Validate required fields
  if (!decisionData.prompt || !Array.isArray(decisionData.options) || decisionData.options.length < 2) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Invalid player decision data: missing prompt or insufficient options');
    }
    return undefined;
  }

  // Parse options
  const options: PlayerDecisionOption[] = decisionData.options
    .filter((option: RawDecisionOption) => option && typeof option === 'object' && option.text && option.impact)
    .map((option: RawDecisionOption) => ({
      id: uuidv4(),
      text: option.text!, // These are now safe due to the filter
      impact: option.impact!, // These are now safe due to the filter
      tags: Array.isArray(option.tags) ? option.tags : [],
    }));

  // If we don't have at least 2 valid options, return undefined
  if (options.length < 2) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Invalid player decision data: insufficient valid options after filtering');
    }
    return undefined;
  }

  // Validate importance
  const validImportance = ['critical', 'significant', 'moderate', 'minor'];
  const importance: DecisionImportance = validImportance.includes(decisionData.importance as string)
    ? decisionData.importance as DecisionImportance
    : 'moderate';

  // Create the decision object
  return {
    id: uuidv4(),
    prompt: decisionData.prompt,
    timestamp: Date.now(),
    location: currentLocation,
    options,
    context: decisionData.context || '',
    importance,
    characters: Array.isArray(decisionData.characters) ? decisionData.characters : [],
    aiGenerated: true
  };
}

/**
 * Type guard to validate if an object conforms to the PlayerDecision interface.
 * Ensures all required fields are present and properly typed.
 * 
 * @param decision - The object to validate as a PlayerDecision
 * @returns Boolean indicating whether the object is a valid PlayerDecision
 */
export function isValidPlayerDecision(decision: unknown): decision is PlayerDecision {
    return (
        decision !== null &&
        typeof decision === 'object' &&
        'prompt' in decision && typeof decision.prompt === 'string' &&
        'options' in decision && Array.isArray(decision.options) &&
        decision.options.length >= 2 &&
        decision.options.every(
            (option: unknown) =>
                typeof option === 'object' &&
                option !== null &&
                'text' in option && typeof option.text === 'string' &&
                'impact' in option && typeof option.impact === 'string'
        )
    );
}

/**
 * Extract JSON from text content using multiple strategies
 * 
 * @param text - Text that may contain JSON
 * @param marker - Optional JSON marker (e.g., "playerDecision")
 * @returns Parsed JSON object or null if parsing fails
 */
function extractJSON(text: string, marker?: string): Record<string, unknown> | null {
  // Try parsing the whole text as JSON first
  try {
    return JSON.parse(text);
  } catch {
    // If that fails, look for JSON within the text
    if (marker) {
      try {
        // Try to find JSON with a specific marker
        const markerRegex = new RegExp(`"${marker}"\\s*:\\s*(\\{[\\s\\S]*?\\})`, 'g');
        const matches = text.match(markerRegex);
        
        if (matches && matches.length > 0) {
          // Wrap in an object to make it valid JSON
          return JSON.parse(`{${matches[0]}}`);
        }
      } catch {
        // Fall through to next approach
      }
    }
    
    // Try to extract any JSON object
    try {
      const jsonRegex = /(\{[\s\S]*?\})/g;
      const matches = text.match(jsonRegex);
      
      if (matches && matches.length > 0) {
        // Try each match until one parses successfully
        for (const match of matches) {
          try {
            return JSON.parse(match);
          } catch {
            // Continue to next match
          }
        }
      }
    } catch {
      // Fall through to return null
    }
    
    return null;
  }
}

/**
 * Parses AI response text to extract structured game information.
 * Handles multiple formats of AI responses:
 * 1. JSON-formatted character data (for NPC generation)
 * 2. Structured text with metadata markers
 * 3. Mixed formats containing both narrative text and JSON structures (for playerDecision)
 * 
 * The parser extracts:
 * - Narrative text
 * - Location information
 * - Combat status and opponent details
 * - Item acquisition and removal
 * - Suggested player actions
 * - Player decision points (when present)
 * 
 * @param text - Raw text response from the AI model
 * @returns Structured game data as either an AIResponse or Character object
 */
export function parseAIResponse(text: string): AIResponse | Character {
  // First try to parse as JSON character data
  try {
    const characterData = JSON.parse(text);
    if (characterData.name && characterData.attributes) {
      return {
        id: `character_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
  } catch (error) {
    // If it's a SyntaxError, it's not JSON, so continue to text parsing
    if (!(error instanceof SyntaxError)) {
      console.error('Unexpected error in character data parsing:', error);
    }
    // Otherwise, just fall through to text parsing
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
    playerDecision: undefined // Initialize playerDecision here
  };

  if (!text || text.trim().length === 0) {
    return defaultResponse;
  }

  // Extract metadata and process the text
  let locationMatch, locationName, location;
  let acquiredItemsMatch, removedItemsMatch;
  let acquiredItems = [], removedItems = [];
  let suggestedActions: SuggestedAction[] = [];
  let combatInitiated = false;
  let opponent: Character | undefined;
  let playerDecision: PlayerDecision | undefined = undefined;
  let narrative = '';

  try {
    // Extract location
    locationMatch = text.match(/LOCATION:\s*([^:\n\[\]]+)/);
    locationName = locationMatch ? locationMatch[1].trim() : undefined;
    location = locationName ? { type: 'town' as const, name: locationName } : { type: 'unknown' as const };

    // Extract acquired and removed items
    acquiredItemsMatch = text.match(/ACQUIRED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/);
    removedItemsMatch = text.match(/REMOVED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/);

    acquiredItems = acquiredItemsMatch
      ? (acquiredItemsMatch[1] || acquiredItemsMatch[2] || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
      : [];

    removedItems = removedItemsMatch
      ? (removedItemsMatch[1] || removedItemsMatch[2] || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
      : [];

    // Parse suggested actions
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
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to parse suggested actions:', error);
        }
        // Continue without suggested actions
      }
    }

    // Handle combat initiation and opponent creation
    const combatMatch = text.match(/COMBAT:\s*([^\n]+)/);
    if (combatMatch) {
      combatInitiated = true;
      // Clean the opponent name before creating the opponent object
      const opponentName = cleanText(combatMatch[1].trim());

      opponent = {
        id: `character_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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

    // Process narrative text
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
    narrative = processedLines.join('\n')
      .replace(/\s+:\s+/g, ': ')
      .replace(/\s+,\s+/g, ', ')
      .replace(/\s+!/g, '!')
      .replace(/\s+\./g, '.')
      .replace(/\s+\?/g, '?')
      .replace(/\s+\)/g, ')')
      .replace(/\(\s+/g, '(')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Try multiple approaches to extract playerDecision from the response
    try {
      // First attempt: Try to parse the entire text as JSON
      const jsonResponse = extractJSON(text);
      if (jsonResponse && jsonResponse.playerDecision && typeof jsonResponse.playerDecision === 'object') {
        playerDecision = parsePlayerDecision(jsonResponse.playerDecision as RawPlayerDecision, location);
      } else {
        // Second attempt: Try to extract just the playerDecision part
        const decisionJson = extractJSON(text, 'playerDecision');
        if (decisionJson && decisionJson.playerDecision && typeof decisionJson.playerDecision === 'object') {
          playerDecision = parsePlayerDecision(decisionJson.playerDecision as RawPlayerDecision, location);
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
      // Failed to extract playerDecision, leave as undefined
    }

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