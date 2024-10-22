import React from 'react';
import { JournalEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  // Format date in a consistent MM/DD/YYYY format, with fallback for invalid dates
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

      // Use Intl.DateTimeFormat for consistent date formatting across timezones
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

  const renderEntry = (entry: JournalEntry, index: number) => {
    if (!entry) {
      console.warn('Invalid entry received:', entry);
      return null;
    }

    const dateStr = formatDate(entry.timestamp);
    const content = entry.narrativeSummary || entry.content;

    return (
      <li key={`${entry.timestamp}-${index}`} className="wireframe-text mb-2">
        <strong>{dateStr}</strong>: {content}
      </li>
    );
  };

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Journal</h2>
      {!Array.isArray(entries) || entries.length === 0 ? (
        <p>No journal entries yet.</p>
      ) : (
        <ul className="wireframe-list">
          {entries.slice().reverse().map((entry, index) => renderEntry(entry, index))}
        </ul>
      )}
    </div>
  );
};

export default JournalViewer;