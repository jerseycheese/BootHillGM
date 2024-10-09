import React from 'react';
import { JournalEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  // Format the timestamp to a readable date string
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'UTC'  // Ensure consistent timezone handling
    });
  };

  return (
    <div className="wireframe-section">
      <h2 className="wireframe-subtitle">Journal</h2>
      {entries.length === 0 ? (
        <p>No journal entries yet.</p>
      ) : (
        <ul className="wireframe-list">
          {/* Display entries in reverse chronological order */}
          {entries.slice().reverse().map((entry, index) => (
            <li key={index} className="wireframe-text mb-2">
              <strong>{formatDate(entry.timestamp)}</strong>: {entry.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalViewer;