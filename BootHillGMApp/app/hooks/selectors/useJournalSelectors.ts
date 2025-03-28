/**
 * Journal-related state selector hooks
 * 
 * Contains selectors for accessing journal state in a memoized way.
 */
import { JournalEntry, QuestJournalEntry, isQuestEntry } from '../../types/journal';
import { createStateHook } from '../createStateHook';

/**
 * Returns all journal entries
 */
export const useJournalEntries = createStateHook<JournalEntry[], [JournalEntry[] | undefined]>(
  (state) => state.journal?.entries ?? [],
  (state) => [state.journal?.entries]
);

/**
 * Returns a specific journal entry by timestamp
 * 
 * @param timestamp The timestamp to find
 */
export const useJournalEntryByTimestamp = (timestamp: number) => createStateHook<JournalEntry | undefined, [JournalEntry[] | undefined]>(
  (state) => state.journal?.entries?.find(entry => entry.timestamp === timestamp),
  (state) => [state.journal?.entries]
)();

/**
 * Returns the most recent journal entry
 */
export const useLatestJournalEntry = createStateHook<JournalEntry | undefined, [JournalEntry[] | undefined]>(
  (state) => {
    const entries = state.journal?.entries ?? [];
    if (entries.length === 0) return undefined;
    
    // Sort entries by timestamp (latest first)
    const sortedEntries = [...entries].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    return sortedEntries[0];
  },
  (state) => [state.journal?.entries]
);

/**
 * Returns journal entries of a specific type
 * 
 * @param type The entry type to filter by
 */
export const useJournalEntriesByType = (type: string) => createStateHook<JournalEntry[], [JournalEntry[] | undefined]>(
  (state) => (state.journal?.entries ?? []).filter(entry => entry.type === type),
  (state) => [state.journal?.entries]
)();

/**
 * Returns journal entries related to a specific quest
 * 
 * @param questTitle The quest title to filter by
 */
export const useJournalEntriesByQuest = (questTitle: string) => createStateHook<QuestJournalEntry[], [JournalEntry[] | undefined]>(
  (state) => {
    const entries = state.journal?.entries ?? [];
    return entries.filter((entry): entry is QuestJournalEntry => 
      isQuestEntry(entry) && entry.questTitle === questTitle
    );
  },
  (state) => [state.journal?.entries]
)();

/**
 * Returns journal entries with a specific status
 * 
 * @param status The status to filter by (e.g., 'started', 'completed')
 */
export const useJournalEntriesByStatus = (status: string) => createStateHook<QuestJournalEntry[], [JournalEntry[] | undefined]>(
  (state) => {
    const entries = state.journal?.entries ?? [];
    return entries.filter((entry): entry is QuestJournalEntry => 
      isQuestEntry(entry) && entry.status === status
    );
  },
  (state) => [state.journal?.entries]
)();

/**
 * Returns journal entries created within a specified time range
 * 
 * @param startTime Start of the time range
 * @param endTime End of the time range
 */
export const useJournalEntriesByTimeRange = (startTime: number, endTime: number) => createStateHook<JournalEntry[], [JournalEntry[] | undefined]>(
  (state) => {
    const entries = state.journal?.entries ?? [];
    return entries.filter(entry => {
      const timestamp = entry.timestamp ?? 0;
      return timestamp >= startTime && timestamp <= endTime;
    });
  },
  (state) => [state.journal?.entries]
)();

/**
 * Returns the total number of journal entries
 */
export const useJournalEntryCount = createStateHook<number, [JournalEntry[] | undefined]>(
  (state) => state.journal?.entries?.length ?? 0,
  (state) => [state.journal?.entries]
);

/**
 * Returns whether there are any journal entries
 */
export const useHasJournalEntries = createStateHook<boolean, [JournalEntry[] | undefined]>(
  (state) => (state.journal?.entries?.length ?? 0) > 0,
  (state) => [state.journal?.entries]
);

/**
 * Returns journal entries with a specific tag-like property
 * This uses a more generic approach since tags aren't directly defined on JournalEntry
 * 
 * @param tag The tag to search for
 */
export const useJournalEntriesByTag = (tag: string) => createStateHook<JournalEntry[], [JournalEntry[] | undefined]>(
  (state) => {
    const entries = state.journal?.entries ?? [];
    return entries.filter(entry => {
      // Use a type-safe check using hasOwnProperty before accessing tags
      const hasTagsProperty = Object.prototype.hasOwnProperty.call(entry, 'tags');
      if (!hasTagsProperty) return false;

      // Cast to any to safely access the tags property which might exist dynamically
      const entryWithTags = entry as JournalEntry & { tags?: string[] };
      return Array.isArray(entryWithTags.tags) && entryWithTags.tags.includes(tag);
    });
  },
  (state) => [state.journal?.entries]
)();
