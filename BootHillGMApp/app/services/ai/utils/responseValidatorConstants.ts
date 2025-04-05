/**
 * Constants used for response validation and processing
 * 
 * This module contains pattern definitions, valid action types, and default values
 * used throughout the response validation process.
 * 
 * @see responseValidator.ts for the main validation functions
 * @see responseValidatorUtils.ts for utility functions using these constants
 */
import { ActionType } from '../../../types/campaign';
import { LocationType } from '../../../services/locationService';

/**
 * Patterns used to identify narrative themes and contexts
 * These patterns help determine the most appropriate action types
 * based on the content of the narrative text.
 */
export const CONTEXT_PATTERNS = {
  COMBAT: /fight|attack|defend|battle|combat|weapon|shoot|punch|strike|defeat|gun|duel|showdown/i,
  SOCIAL: /talk|speak|convince|persuade|charm|negotiate|discuss|conversation|bargain|deal|offer/i,
  EXPLORATION: /search|explore|investigate|look|find|discover|examine|scout|journey|travel/i,
  CHAOTIC: /wild|crazy|unexpected|chaotic|surprise|shocking|random|unpredictable|dangerous/i,
  MAIN: /mission|quest|objective|goal|task|important|crucial|essential|primary/i,
  SIDE: /optional|additional|extra|alternative|secondary|side|minor/i,
  INTERACTION: /use|interact|activate|operate|handle|touch|pick|grab|take|obtain/i,
  DANGER: /danger|risk|caution|careful|threat|hazard|peril|beware/i
};

/**
 * Valid action types that can be assigned to suggested actions
 * These correspond to the ActionType union type defined in campaign.ts
 */
export const VALID_ACTION_TYPES: ActionType[] = [
  'main', 'side', 'optional', 'combat', 'basic', 'interaction', 'chaotic', 'danger'
];

/**
 * Default fallback location used when location data is invalid or missing
 * Conforms to the wilderness type in the LocationType union
 */
export const DEFAULT_LOCATION: LocationType = { type: 'wilderness', description: 'Unknown area' };
