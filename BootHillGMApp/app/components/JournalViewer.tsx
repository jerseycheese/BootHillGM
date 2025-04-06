import React, { memo, useMemo, useEffect } from 'react';
import type { JournalEntry, JournalEntryWithSummary, BaseJournalEntry } from '../types/journal';
import { isNarrativeEntry, isCombatEntry, isInventoryEntry, isQuestEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

/**
 * Type guard to check if a JournalEntry has a narrativeSummary property.
 *
 * @param entry - The journal entry to check.
 * @returns True if the entry has a non-empty narrativeSummary string, false otherwise.
 */
// Type guard to check if entry has a narrativeSummary property
const hasNarrativeSummary = (entry: JournalEntry): entry is JournalEntry & JournalEntryWithSummary => {
  return 'narrativeSummary' in entry && typeof (entry as JournalEntry & { narrativeSummary?: string }).narrativeSummary === 'string';
};

/**
 * Memoized component for rendering a single journal entry.
 * Prioritizes displaying `narrativeSummary` if available.
 *
 * @param entry - The journal entry data.
 * @param formatDate - Function to format the timestamp.
 * @returns A list item element representing the journal entry.
 */
// Component for rendering a single journal entry
const JournalEntry = memo(({ entry, formatDate }: { 
  entry: JournalEntry;
  formatDate: (timestamp: number) => string;
}) => {
  // Get the appropriate content for display - PRIORITIZE summaries
  const displayContent = useMemo(() => {
    // Debug the entry
    
    if (hasNarrativeSummary(entry)) {
      
      // First priority: Use narrativeSummary if available and not empty
      if (entry.narrativeSummary.trim() !== '') {
        return entry.narrativeSummary;
      }
    }
    
    // Second priority: Type-specific display formats
    if (isNarrativeEntry(entry)) {
      // Only truncate content if there's no summary
      const maxContentLength = 50; // Reduced for better readability
      if (entry.content && entry.content.length > maxContentLength) {
        return `${entry.content.substring(0, maxContentLength)}...`;
      }
      return entry.content || '';
    } 
    else if (isCombatEntry(entry)) {
      return `${entry.combatants.player} vs ${entry.combatants.opponent}: ${entry.outcome}`;
    } 
    else if (isInventoryEntry(entry)) {
      const acquired = entry.items.acquired.length ? `Acquired: ${entry.items.acquired.join(', ')}` : '';
      const removed = entry.items.removed.length ? `Removed: ${entry.items.removed.join(', ')}` : '';
      return [acquired, removed].filter(Boolean).join(' | ');
    } 
    else if (isQuestEntry(entry)) {
      return `${entry.questTitle}: ${entry.status}`;
    }
    
    // If we get here, we have a JournalEntry but couldn't determine its specific type
    // BaseJournalEntry guarantees a 'content' property
    
    // Explicit cast to BaseJournalEntry which ensures 'content' exists
    return (entry as BaseJournalEntry).content || 'No content available';
  }, [entry]);

  return (
    <li className="wireframe-text mb-2">
      <strong>{formatDate(entry.timestamp)}</strong>: {displayContent}
    </li>
  );
});

JournalEntry.displayName = 'JournalEntry';

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  // Debug the entries received
  useEffect(() => {
    if (Array.isArray(entries)) {
      // Show a sample of entries with summaries
      // const entriesWithSummary = entries.filter(hasNarrativeSummary); // Removed unused variable
      
      // Show first 3 entries for debugging
      entries.slice(0, 3).forEach((_entry, _idx) => { // Prefix unused args
/**
 * Displays a list of journal entries, sorted by timestamp (newest first).
 * Prioritizes displaying AI-generated summaries (`narrativeSummary`) over full content.
 *
 * @param entries - An array of JournalEntry objects.
 * @returns A component rendering the journal list.
 */
      });
    }
  }, [entries]);

  // Sort entries by timestamp (newest first)
  const sortedEntries = useMemo(() => {
    // Ensure entries is a valid array
    const entriesArray = Array.isArray(entries) ? entries : [];
    
    // Filter out invalid entries before sorting
    const validEntries = entriesArray.filter(entry => 
      entry && typeof entry === 'object' && 'timestamp' in entry
    );
    
    // Sort by timestamp (most recent first)
    return [...validEntries].sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  // Function to format timestamps as dates
  const formatDate = (timestamp: number): string => {
    try {
      if (!timestamp || isNaN(timestamp)) {
        return 'Invalid date';
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  // Show empty state if there are no entries
  if (!Array.isArray(entries) || entries.length === 0) {
    return (
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle mb-2">Journal</h2>
        <p>No journal entries yet.</p>
      </div>
    );
  }

  return (
    <div id="bhgmJournalViewer" data-testid="journal-viewer" className="wireframe-section bhgm-journal-viewer">
      <h2 className="wireframe-subtitle mb-2">Journal</h2>
      {sortedEntries.length === 0 ? (
        <p>No valid journal entries available.</p>
      ) : (
        <ul className="overflow-y-auto">
          {sortedEntries.map((entry) => (
            <JournalEntry
              key={entry.id || entry.timestamp || Math.random().toString(36).substring(2, 11)}
              entry={entry}
              formatDate={formatDate}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalViewer;