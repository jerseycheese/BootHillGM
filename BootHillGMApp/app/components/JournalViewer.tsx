import React, { memo, useMemo } from 'react';
import type { JournalEntry } from '../types/journal';
import { isNarrativeEntry, isCombatEntry, isInventoryEntry, isQuestEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalEntry = memo(({ entry, formatDate }: { 
  entry: JournalEntry;
  formatDate: (timestamp: number) => string;
}) => {
  const formattedContent = useMemo(() => {
    if (isNarrativeEntry(entry)) {
      return entry.narrativeSummary || entry.content;
    } else if (isCombatEntry(entry)) {
      const content = entry.content.replace(/^\d{1,2}\/\d{1,2}\/\d{4}:\s*/, '').trim();
      return `${formatDate(entry.timestamp)}: ${content}`;
    } else if (isInventoryEntry(entry)) {
      const acquired = entry.items.acquired.length ? `Acquired: ${entry.items.acquired.join(', ')}` : '';
      const removed = entry.items.removed.length ? `Removed: ${entry.items.removed.join(', ')}` : '';
      return [acquired, removed].filter(Boolean).join(' | ');
    } else if (isQuestEntry(entry)) {
      return `${entry.questTitle}: ${entry.status}`;
    }
    return 'Unknown Entry Type';
  }, [entry]);

  return (
    <li className="wireframe-text mb-2">
      <strong>{formatDate(entry.timestamp)}</strong>: {formattedContent}
    </li>
  );
});

JournalEntry.displayName = 'JournalEntry';

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  const sortedEntries = useMemo(() => 
    [...entries].sort((a, b) => b.timestamp - a.timestamp), 
    [entries]
  );

const formatDate = (timestamp: number): string => {
    try {
      if (!timestamp || isNaN(timestamp)) {
        console.warn('Invalid timestamp received:', timestamp);
        return 'Invalid date';
      }

      const date = new Date(timestamp); // Fix: create date object
      if (isNaN(date.getTime())) {
        console.warn('Invalid date object created from timestamp:', timestamp);
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (!Array.isArray(entries) || entries.length === 0) {
    return (
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle mb-2">Journal</h2>
        <p>No journal entries yet.</p>
      </div>
    );
  }

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle mb-2">Journal</h2>
      <ul className="overflow-y-auto">
        {sortedEntries.map((entry) => (
          <JournalEntry
            key={entry.timestamp}
            entry={entry}
            formatDate={formatDate}
          />
        ))}
      </ul>
    </div>
  );
};

export default JournalViewer;
