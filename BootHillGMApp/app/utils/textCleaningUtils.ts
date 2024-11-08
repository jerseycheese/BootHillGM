/**
 * Centralized utilities for cleaning metadata from game text and detecting inventory changes.
 * Handles both explicit metadata markers and natural language patterns.
 */

/**
 * Regex patterns for identifying and removing various types of metadata
 * from game text while preserving important game information.
 */
const METADATA_PATTERNS = {
  // Matches metadata markers at line start or after whitespace
  MARKERS: /(?:^|\s+)(SUGGESTED_ACTIONS|ACQUIRED_ITEMS|REMOVED_ITEMS):\s*(\[[^\]]*\]|[^\s]+)/gm,
  EMPTY_BRACKETS: /\[\s*\]/g,
  IMPORTANT: /\s*important:\s*[^]*?(?=[A-Z][a-z]+\s|$)/g,
  LOCATION: /\s*LOCATION:\s*[^.!?\n]*/g,
  JSON_METADATA: /\{[^{}]*\}/g,
  DESCRIPTIVE: /\s+The\s+[^.!?]*(?:is|are)\s+[^.!?]*[.!?]/gi,
  EXTRA_WHITESPACE: /[\s\n]{2,}/g,
  COMBAT_METADATA: /\s*(\[Roll: \d+\/\d+(?:\s*-\s*Critical!)?\])/g,
  LEADING_NEWLINES: /^\n+/,
  TRAILING_NEWLINES: /\n+$/,
};

/**
 * Removes metadata markers and formatting artifacts from text while preserving
 * game-relevant content. Handles both single-line and multi-line text.
 */
export const cleanMetadataMarkers = (text: string | undefined): string => {
  if (!text?.trim()) return '';

  let cleaned = text;

  // Remove metadata markers using the updated MARKERS pattern
  cleaned = cleaned.replace(METADATA_PATTERNS.MARKERS, '');

  // Clean empty brackets
  cleaned = cleaned.replace(METADATA_PATTERNS.EMPTY_BRACKETS, '');

  // Clean important
  cleaned = cleaned.replace(METADATA_PATTERNS.IMPORTANT, '');

  // Clean location
  cleaned = cleaned.replace(METADATA_PATTERNS.LOCATION, '');

  // Clean descriptive
  cleaned = cleaned.replace(METADATA_PATTERNS.DESCRIPTIVE, '');

  // Clean JSON metadata
  cleaned = cleaned.replace(METADATA_PATTERNS.JSON_METADATA, '');

  // Clean extra whitespace
  cleaned = cleaned.replace(METADATA_PATTERNS.EXTRA_WHITESPACE, ' ').trim();

  return cleaned;
};

/**
 * Specifically cleans combat log entries while preserving roll information
 * and important combat details. Handles multi-line combat descriptions.
 */
export const cleanCombatLogEntry = (text: string): string => {
  if (!text?.trim()) return '';


  // First normalize newlines and clean leading/trailing ones
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(METADATA_PATTERNS.LEADING_NEWLINES, '')
    .replace(METADATA_PATTERNS.TRAILING_NEWLINES, '');


  cleaned = cleaned.replace(METADATA_PATTERNS.MARKERS, (match) => {
    return '';
  });


  // Clean any remaining metadata
  cleaned = cleaned
    .replace(METADATA_PATTERNS.JSON_METADATA, '')
    .replace(METADATA_PATTERNS.EMPTY_BRACKETS, '')
    .replace(METADATA_PATTERNS.COMBAT_METADATA, ' $1')
    .replace(METADATA_PATTERNS.EXTRA_WHITESPACE, ' ')
    .trim();

  return cleaned;
};

/**
 * Converts text to sentence case, capitalizing the first letter of each sentence.
 */
export const toSentenceCase = (text: string): string => {
  if (!text?.trim()) return '';

  return text.split('. ')
    .map(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return '';
      return trimmed.split(' ')
        .map((word, index) => {
          if (index === 0 || /^[A-Z]/.test(word)) {
            return word;
          }
          return word.toLowerCase();
        })
        .join(' ');
    })
    .join('. ');
};


/**
 * Detects items being acquired or removed from both explicit metadata
 * and natural language descriptions. Supports various verb forms and
 * complex item names.
 */
export const extractItemUpdates = (text: string): { acquired: string[]; removed: string[] } => {
  const updates = {
    acquired: [] as string[],
    removed: [] as string[],
  };

  const processMetadataMatches = (matches: RegExpMatchArray[], array: string[]) => {
    for (const match of matches) {
      if (match[1]) {
        const items = match[1]
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        array.push(...items);
      }
    }
  };

  const processNaturalLanguageMatches = (matches: RegExpMatchArray[], array: string[]) => {
    for (const match of matches) {
      if (match[1]) {
        let item = match[1].trim();
        // Remove articles and possessive pronouns only at the start of the string
        item = item.replace(/^(?:the|a|an|your|my)\s+/i, '');
        if (item && !array.includes(item)) {
          array.push(item);
        }
      }
    }
  };

  // Extract from metadata markers - these are explicit and should be prioritized
  const acquiredMatches = Array.from(text.matchAll(/ACQUIRED_ITEMS:\s*\[(.*?)\]/g));
  const removedMatches = Array.from(text.matchAll(/REMOVED_ITEMS:\s*\[(.*?)\]/g));


  // Process explicit metadata first
  processMetadataMatches(acquiredMatches, updates.acquired);
  processMetadataMatches(removedMatches, updates.removed);

  // Process natural language patterns
  // Player direct commands
  const takeMatches = Array.from(text.matchAll(/^\s*Player:\s*(?:Take|take|TAKE)\s+(.+)$/gm));
  processNaturalLanguageMatches(takeMatches, updates.acquired);

  const useMatches = Array.from(text.matchAll(/^\s*Player:\s*(?:Use|use|USE)\s+(.+)$/gm));
  processNaturalLanguageMatches(useMatches, updates.removed);

  // GM responses indicating item acquisition
  [
    /^\s*GM:\s*You (?:manage to scoop|scoop|reach out and pocket|pick up|take|uncork) (.+?)(?:\s+(?:into|onto|with|from)\b.*|[.,]|$)/gim,
  ].forEach((pattern) => {
    const matches = Array.from(text.matchAll(pattern));
    processNaturalLanguageMatches(matches, updates.acquired);
  });

  // GM responses indicating item removal
  [
    /^\s*GM:\s*You (?:use|consume|drink|eat|discard|throw away|drop|lose|bring|hold) (.+?)(?:\s+(?:to|into|onto|with|from|at)\b.*|[.,]|$)/gim,
  ].forEach((pattern) => {
    const matches = Array.from(text.matchAll(pattern));
    processNaturalLanguageMatches(matches, updates.removed);
  });

  // Clean and deduplicate items
  updates.acquired = Array.from(new Set(updates.acquired)).map(cleanMetadataMarkers);
  updates.removed = Array.from(new Set(updates.removed)).map(cleanMetadataMarkers);

  return updates;
};
