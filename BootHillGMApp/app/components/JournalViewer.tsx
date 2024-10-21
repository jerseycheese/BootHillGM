import React from 'react';
import { JournalEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
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
              <strong>{formatDate(entry.timestamp)}</strong>: {entry.narrativeSummary || entry.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalViewer;
