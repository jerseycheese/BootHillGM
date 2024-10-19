import React from 'react';
import { JournalEntry } from '../types/journal';

interface JournalViewerProps {
  entries: JournalEntry[];
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entries }) => {
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
              <strong>{new Date(entry.timestamp).toLocaleDateString()}</strong>: {entry.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalViewer;