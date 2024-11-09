import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { JournalEntry } from '../types/journal';
import { isNarrativeEntry, isCombatEntry, isInventoryEntry, isQuestEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

interface ItemData {
  entries: JournalEntry[];
  formatDate: (timestamp: number) => string;
}

const JournalEntry = memo(({ data, index, style }: { 
  data: ItemData; 
  index: number; 
  style: React.CSSProperties;
}) => {
  const entry = data.entries[index];
  
  // Format journal entry based on its type using type guards
  // Returns appropriate display text with consistent formatting
  const formattedContent = useMemo(() => {
    if (isNarrativeEntry(entry)) {
      return entry.narrativeSummary || entry.content;
    } else if (isCombatEntry(entry)) {
      return `Combat: ${entry.combatants.player} vs ${entry.combatants.opponent} - ${entry.outcome}`;
    } else if (isInventoryEntry(entry)) {
      const acquired = entry.items.acquired.length ? `Acquired: ${entry.items.acquired.join(', ')}` : '';
      const removed = entry.items.removed.length ? `Removed: ${entry.items.removed.join(', ')}` : '';
      return [acquired, removed].filter(Boolean).join(' | ');
    } else if (isQuestEntry(entry)) {
      return `${entry.questTitle}: ${entry.status}`;
    }
    return 'Unknown Entry Type'; // Fallback for unknown entry types
  }, [entry]);

  return (
    <div style={style} className="wireframe-text p-2">
      <strong>{data.formatDate(entry.timestamp)}</strong>: {formattedContent}
    </div>
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

  const itemData = useMemo(() => ({
    entries: sortedEntries,
    formatDate
  }), [sortedEntries]);

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
      <List
        height={200}
        itemCount={sortedEntries.length}
        itemSize={50}
        width="100%"
        itemData={itemData}
      >
        {JournalEntry}
      </List>
    </div>
  );
};

export default JournalViewer;
