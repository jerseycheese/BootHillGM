import React from 'react';
import { JournalEntry, InventoryJournalEntry, CombatJournalEntry } from '../types/journal';
import { cleanMetadataMarkers, toSentenceCase } from '../utils/textCleaningUtils';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  const formatJournalEntry = (entry: JournalEntry): string => {
    let entryContent = cleanMetadataMarkers(entry.content);
    
    // Apply sentence case to the content
    entryContent = toSentenceCase(entryContent);
    
    // For inventory entries, format them nicely
    if (entry.type === 'inventory' && 'items' in entry) {
      const invEntry = entry as InventoryJournalEntry;
      if (invEntry.items.acquired.length > 0) {
        entryContent += ` (Acquired: ${invEntry.items.acquired.join(', ')})`;
      }
      if (invEntry.items.removed.length > 0) {
        entryContent += ` (Used: ${invEntry.items.removed.join(', ')})`;
      }
    }

    // For combat entries, format the outcome
    if (entry.type === 'combat' && 'outcome' in entry) {
      const combatEntry = entry as CombatJournalEntry;
      const outcome = combatEntry.outcome.charAt(0).toUpperCase() + 
                     combatEntry.outcome.slice(1).toLowerCase();
      entryContent += ` - ${outcome}`;
    }

    return entryContent;
  };

  const formatDate = (timestamp: number): string => {
    try {
      if (!timestamp || isNaN(timestamp)) {
        console.warn('Invalid timestamp received:', timestamp);
        return 'Invalid date';
      }

      const date = new Date(timestamp);
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

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle mb-2">Journal</h2>
      <div className="h-[200px] overflow-y-auto">
        {!Array.isArray(entries) || entries.length === 0 ? (
          <p>No journal entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.slice().reverse().map((entry, index) => (
              <li 
                key={`${entry.timestamp}-${index}`} 
                className="wireframe-text mb-2"
              >
                <strong>{formatDate(entry.timestamp)}</strong>: {formatJournalEntry(entry)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JournalViewer;
