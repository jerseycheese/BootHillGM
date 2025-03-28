/**
 * Interface representing the raw decision data as returned from the AI model
 * before validation and transformation into the application's type system.
 */
export interface RawPlayerDecision {
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
export interface RawDecisionOption {
  text?: string;
  impact?: string;
  tags?: string[];
}

/**
 * Custom error type for parsing errors during JSON extraction or processing
 * Used to provide more specific information about parsing failures.
 */
export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

/**
 * Custom error type for validation errors when raw data doesn't meet requirements
 * Used to signal that required fields are missing or invalid.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Regular expressions used throughout the parsing process
 * Centralizing them here enhances maintainability
 */
export const PARSING_REGEX = {
  LOCATION: /LOCATION:\s*([^:\n\[\]]+)/,
  ACQUIRED_ITEMS: /ACQUIRED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/,
  REMOVED_ITEMS: /REMOVED_ITEMS:(?:\s*\[([^\]]*)\]|\s*([^\n]*))/,
  SUGGESTED_ACTIONS: /SUGGESTED_ACTIONS:\s*(\[[\s\S]*?\])/,
  COMBAT: /COMBAT:\s*([^\n]+)/,
  METADATA_LINE: /^(?:ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|COMBAT|SUGGESTED_ACTIONS):\s*(\[[^\]]*\]|\s*)$/i,
  CHARACTER_NAME: /^[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?$/,
  ITEM_METADATA: /\s*ACQUIRED_ITEMS:\s*(?:\[[^\]]*\]|\s*)/g,
  REMOVED_METADATA: /\s*REMOVED_ITEMS:\s*(?:\[[^\]]*\]|\s*)/g,
  SUGGESTED_METADATA: /\s*SUGGESTED_ACTIONS:\s*\[[^\]]*\]/g
};
