// /app/utils/initialization/journalEntryHelpers.ts
import { NarrativeJournalEntry, JournalEntry } from "../../types/journal";

/**
 * Creates a properly typed narrative journal entry with consistent structure
 * 
 * This function generates a properly formatted journal entry with the 'narrative' type
 * and ensures all required fields are present including proper typing for TypeScript.
 * It's primarily used when creating journal entries during game reset or initialization.
 * 
 * @param content - The main narrative text content for the journal entry
 * @param title - Optional title for the entry (defaults to 'New Adventure')
 * @param timestamp - Optional timestamp (defaults to current time)
 * @param summary - Optional narrative summary (if not provided, one will need to be generated)
 * @returns A complete NarrativeJournalEntry object ready for storage
 * 
 * @example
 * // Basic usage with AI-generated summary
 * const entry = createTypedNarrativeEntry(
 *   "The dusty streets of Boot Hill welcome you...",
 *   "Arrival in Boot Hill",
 *   Date.now(),
 *   "You arrive in the frontier town of Boot Hill."
 * );
 */
export function createTypedNarrativeEntry(
  content: string,
  title: string = 'New Adventure',
  timestamp: number = Date.now(),
  summary: string = 'New narrative entry'
): NarrativeJournalEntry {
  return {
    id: `entry_narrative_${Date.now()}`,
    timestamp,
    type: 'narrative' as const, // Use 'as const' to ensure the literal type
    title,
    content,
    narrativeSummary: summary
  };
}

/**
 * Ensures a journal entry has the correct type designation
 * This is useful when working with journal entries from API responses
 * or when type information might be a string instead of a literal
 */
export function ensureJournalEntryType<T extends JournalEntry>(
  entry: Partial<T> & { type: string }
): T {
  // Convert string type to literal type
  if (entry.type === 'narrative') {
    return {
      ...entry,
      type: 'narrative' as const
    } as T;
  } else if (entry.type === 'combat') {
    return {
      ...entry,
      type: 'combat' as const
    } as T;
  } else if (entry.type === 'quest') {
    return {
      ...entry,
      type: 'quest' as const
    } as T;
  } else {
    // Default case
    return entry as T;
  }
}