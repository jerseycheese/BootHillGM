import { v4 as uuidv4 } from 'uuid';
import { PlayerDecision, PlayerDecisionOption, DecisionImportance } from '../../../types/narrative.types';
import { LocationType } from '../../locationService';
import { RawPlayerDecision, RawDecisionOption } from '../types/rawTypes';

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
