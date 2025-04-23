/**
 * JournalDisplay Component
 * 
 * Displays and manages the player's journal entries.
 */

import React, { useState } from 'react';
import { JournalEntry } from '../../types/journal';

interface JournalDisplayProps {
  entries: JournalEntry[];
  dispatch?: React.Dispatch<unknown>;
}

// Define the expected structure for associatedData locally
interface AssociatedData {
  location?: string;
  characters?: string[];
}

// Type guard to check if an entry has the expected associatedData structure
const isJournalEntryWithValidAssociatedData = (
  entry: JournalEntry | { [key: string]: unknown } // Allow potential extra props
): entry is JournalEntry & { associatedData: AssociatedData } => {
  // Check if entry is an object and has the associatedData property
  if (typeof entry !== 'object' || entry === null || !('associatedData' in entry)) {
    return false;
  }
  // Check if associatedData itself is an object
  const data = entry.associatedData;
  if (typeof data !== 'object' || data === null) {
    return false; // associatedData exists but is not an object
  }
  
  // Now check the properties within the associatedData object
  const obj = data as Record<string, unknown>; // Use Record for safer property access
  
  // Check location: must be string if present
  const hasValidLocation = !('location' in obj) || typeof obj.location === 'string';
  
  // Check characters: must be an array of strings if present
  const hasValidCharacters = !('characters' in obj) || 
    (Array.isArray(obj.characters) && obj.characters.every(c => typeof c === 'string'));

  return hasValidLocation && hasValidCharacters;
};

/**
 * JournalDisplay component - shows the player's journal and quest log
 */
export const JournalDisplay: React.FC<JournalDisplayProps> = ({
  entries
}) => {
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Filter entries by type
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(entry => entry.type === filter);

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    (b.timestamp || 0) - (a.timestamp || 0)
  );
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Get entry type icon
  const getEntryIcon = (type: string): string => {
    switch (type) {
      case 'quest': return '📜';
      case 'location': return '🗺️';
      case 'character': return '👤';
      case 'combat': return '⚔️';
      case 'item': return '🧰';
      default: return '📝';
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setActiveEntry(null);
  };

  return (
    <div className="journal-display">
      <h3 className="text-xl font-bold mb-3">Journal</h3>
      
      {/* Filters */}
      <div className="filters flex mb-3 border-b pb-2">
        <button 
          className={`mr-2 px-2 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleFilterChange('all')}
          data-testid="filter-all"
        >
          All
        </button>
        <button 
          className={`mr-2 px-2 py-1 rounded text-sm ${filter === 'quest' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleFilterChange('quest')}
          data-testid="filter-quests"
        >
          Quests
        </button>
        <button 
          className={`mr-2 px-2 py-1 rounded text-sm ${filter === 'narrative' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleFilterChange('narrative')}
          data-testid="filter-narrative"
        >
          Story
        </button>
      </div>
      
      {/* Empty state */}
      {sortedEntries.length === 0 && (
        <div className="text-gray-500 text-center p-4">
          No journal entries yet
        </div>
      )}
      
      {/* Entry list */}
      <ul className="entries-list" role="list">
        {sortedEntries.map(entry => (
          <li 
            key={entry.id}
            className={`
              entry-item p-2 mb-2 cursor-pointer rounded hover:bg-gray-100
              ${activeEntry?.id === entry.id ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200'}
            `}
            onClick={() => setActiveEntry(entry)}
            data-testid={`journal-entry-${entry.id}`}
            role="listitem"
          >
            <div className="flex justify-between items-start">
              <div className="entry-header flex items-center">
                <span className="entry-icon mr-2">{getEntryIcon(entry.type)}</span>
                <span className="entry-title font-medium">{entry.title || 'Journal Entry'}</span>
              </div>
              <span className="entry-timestamp text-xs text-gray-500">
                {entry.timestamp ? formatTimestamp(entry.timestamp) : ''}
              </span>
            </div>
            
            {/* Preview content if not active */}
            {activeEntry?.id !== entry.id && (
              <div className="entry-preview mt-1 text-sm text-gray-600 truncate">
                {entry.content}
              </div>
            )}
            
            {/* Full content if active */}
            {activeEntry?.id === entry.id && (
              <div className="entry-content mt-2 text-sm">
                <p>{entry.content}</p>
                {/* Check for associatedData using the type guard */}
                {isJournalEntryWithValidAssociatedData(entry) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    {/* Location */}
                    {entry.associatedData.location && (
                      <div>Location: {entry.associatedData.location}</div>
                    )}
                    {/* Characters */}
                    {entry.associatedData.characters && entry.associatedData.characters.length > 0 && (
                      <div>Characters: {entry.associatedData.characters.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JournalDisplay;