/**
 * Centralized utilities for cleaning metadata from game text and detecting inventory changes.
 * Handles both explicit metadata markers and natural language patterns.
 */

/**
 * Regex patterns for identifying and cleaning various types of metadata
 * from game text while preserving important information.
 */
const METADATA_PATTERNS = {
  CORE: {
    MARKERS: /(^|\s+)(SUGGESTED_ACTIONS|ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|COMBAT):\s*(\[[^\]]*\]|[^.!?]*?)(?=\s|$)/gm,
    MULTILINE: /\n+(?:SUGGESTED_ACTIONS|ACQUIRED_ITEMS|REMOVED_ITEMS):[^\n]*/g,
    JSON: /\{[^{}]*\}/g
  },
  COMBAT: {
    ROLLS: /\[Roll: \d+\/\d+(?:\s*-\s*Critical!)?\]/g,
    STATUS: /\s*\([^)]*\)\s*/g
  },
  FORMAT: {
    WHITESPACE: /\s{2,}/g,
    NEWLINES: /^\n+|\n+$/g,
    NUMBERS: /(\d+)\s*:\s*(\d+)/g
  }
};

/**
 * Removes metadata markers and formatting artifacts from text while preserving
 * game-relevant content. Handles both single-line and multi-line text.
 */
export const cleanText = (text: string | undefined): string => {
  if (!text?.trim()) return '';
  
  return text
    // Clean metadata
    .replace(METADATA_PATTERNS.CORE.MARKERS, (_, p1) => p1?.trim() || '')
    .replace(METADATA_PATTERNS.CORE.MULTILINE, '')
    .replace(METADATA_PATTERNS.CORE.JSON, '')
    // Clean combat info
    .replace(METADATA_PATTERNS.COMBAT.ROLLS, '')
    .replace(METADATA_PATTERNS.COMBAT.STATUS, ' ')
    // Format cleanup
    .replace(METADATA_PATTERNS.FORMAT.WHITESPACE, ' ')
    .replace(METADATA_PATTERNS.FORMAT.NEWLINES, '')
    .replace(METADATA_PATTERNS.FORMAT.NUMBERS, '$1:$2')
    .trim();
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
    .replace(METADATA_PATTERNS.FORMAT.NEWLINES, '');

  // Remove all date prefixes, including those mid-text
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{4}:\s*/g, '');
  
  // Remove metadata sections
  cleaned = cleaned.replace(/ACQUIRED_ITEMS:[\s\S]*?SUGGESTED_ACTIONS:[\s\S]*?](\s*-\s*\w+)?/, '');
  
  // Remove any remaining metadata markers
  cleaned = cleaned.replace(METADATA_PATTERNS.CORE.MARKERS, '');
  cleaned = cleaned.replace(METADATA_PATTERNS.CORE.JSON, '');
  cleaned = cleaned.replace(METADATA_PATTERNS.CORE.MULTILINE, '');
  
  // Clean extra whitespace but preserve spaces around punctuation
  cleaned = cleaned.replace(METADATA_PATTERNS.FORMAT.WHITESPACE, ' ').trim();

  return cleaned;
};

/**
 * Converts text to sentence case, capitalizing the first letter of each sentence.
 */
/**
 * Cleans location text by removing metadata and separating location from narrative content.
 * Handles cases where narrative content is appended to location text.
 */
export const cleanLocationText = (text: string | null | undefined): string => {
  if (!text?.trim()) return '';

  // First remove any LOCATION: prefix
  let cleaned = text.replace(/^LOCATION:\s*/i, '');

  // Split on narrative breaks and take only the location part
  cleaned = cleaned.split(/[.!?\n]|\s+(?=[A-Z][a-z]+\s+(?:has|is|was|were|will|had|have))/)[0];

  // Remove any remaining metadata markers
  cleaned = cleanText(cleaned);

  // Final cleanup of any remaining narrative indicators
  cleaned = cleaned
    .replace(/(?:has|is|was|were|will|had|have)\s+.*$/, '')
    .replace(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:has|is|was|were|will|had|have)\s+.*$/, '')
    .trim();

  return cleaned;
};

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
 * Extracts item updates from both explicit metadata markers and natural language.
 * Handles both bracketed and unbracketed item lists.
 */
export const extractItemUpdates = (text: string): { acquired: string[]; removed: string[] } => {
  const updates = {
    acquired: [] as string[],
    removed: [] as string[],
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

  // Extract from metadata markers - handle both bracketed and non-bracketed formats
  const acquiredMatches = Array.from(text.matchAll(/ACQUIRED_ITEMS:\s*(?:\[(.*?)\]|\s*(.+?)(?:\n|$))/g));
  const removedMatches = Array.from(text.matchAll(/REMOVED_ITEMS:\s*(?:\[(.*?)\]|\s*(.+?)(?:\n|$))/g));

  // Process explicit metadata first
  acquiredMatches.forEach(match => {
    const items = (match[1] || match[2] || '').split(',').map(item => item.trim()).filter(Boolean);
    updates.acquired.push(...items);
  });

  removedMatches.forEach(match => {
    const items = (match[1] || match[2] || '').split(',').map(item => item.trim()).filter(Boolean);
    updates.removed.push(...items);
  });

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
  updates.acquired = Array.from(new Set(updates.acquired)).map(cleanText);
  updates.removed = Array.from(new Set(updates.removed)).map(cleanText);

  return updates;
};

/**
 * Cleans character names by removing metadata markers.
 */
export const cleanCharacterName = (name: string): string => {
  // Remove metadata markers using the updated MARKERS pattern
  let cleaned = name.replace(METADATA_PATTERNS.CORE.MARKERS, '');

  // Clean extra whitespace
  cleaned = cleaned.replace(METADATA_PATTERNS.FORMAT.WHITESPACE, ' ').trim();

  return cleaned;
};
