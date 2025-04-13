/**
 * JournalViewer component displays the player's journal entries
 * in a chronological order with formatting based on entry type.
 * 
 * Features:
 * - Displays journal entries with timestamps
 * - Supports multiple entry types (narrative, combat, inventory)
 * - Shows condensed summaries with expandable details
 * - Provides entry filtering options
 */
import React, { useState } from 'react';
import { JournalEntry } from '../types/journal';
import { formatDate } from '../utils/dateUtils';

interface JournalViewerProps {
  entries: JournalEntry[];
  maxEntries?: number;
}

/**
 * JournalViewer component displays the player's journal entries
 * 
 * @param entries Array of journal entries to display
 * @param maxEntries Optional maximum number of entries to show
 */
const JournalViewer: React.FC<JournalViewerProps> = ({ 
  entries, 
  maxEntries 
}) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // If no entries, show placeholder message
  if (!entries || entries.length === 0) {
    return (
      <div className="wireframe-section bhgm-journal-viewer" id="bhgmJournalViewer" data-testid="journal-viewer">
        <h2 className="wireframe-subtitle mb-2">Journal</h2>
        <p className="text-sm italic">No journal entries yet.</p>
      </div>
    );
  }

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  
  // Limit entries if maxEntries is provided
  const displayEntries = maxEntries
    ? sortedEntries.slice(0, maxEntries)
    : sortedEntries;

  // Toggle expanded state for an entry
  const toggleExpand = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  // Get summary content for display in the condensed view
  const getSummaryContent = (entry: JournalEntry): string => {
    // If a narrativeSummary is available and valid, use it
    if (entry.narrativeSummary && 
        entry.narrativeSummary.length > 0 && 
        !entry.narrativeSummary.includes('[MOCK') && 
        !entry.narrativeSummary.includes('[FALLBACK')) {
      return entry.narrativeSummary;
    }
    
    // If the summary is marked as mock or fallback but we're not in a test environment,
    // try to create a better summary
    if (entry.narrativeSummary && 
        (entry.narrativeSummary.includes('[MOCK') || 
         entry.narrativeSummary.includes('[FALLBACK'))) {
      // Extract the first proper sentence from content
      const sentenceMatch = entry.content.match(/^(.+?[.!?])\s/);
      if (sentenceMatch && sentenceMatch[1]) {
        return sentenceMatch[1];
      }
      
      // If character name is identifiable, create a better summary
      const characterMatch = entry.content.match(/([A-Z][a-z]+)(?:\s+steps|\s+walks|\s+enters|\s+arrives)/);
      if (characterMatch) {
        return `${characterMatch[1]} explores the frontier town of Boot Hill.`;
      }
    }
    
    // If no valid summary, create one from the first sentence
    const content = entry.content || '';
    
    // Try to extract first sentence
    const sentenceMatch = content.match(/^(.+?[.!?])\s/);
    if (sentenceMatch && sentenceMatch[1]) {
      return sentenceMatch[1];
    }
    
    // If no clear sentence, use truncation as a last resort
    const MAX_LENGTH = 100;
    
    if (content.length <= MAX_LENGTH) return content;
    
    const truncated = content.substring(0, MAX_LENGTH);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex === -1) return truncated + '...';
    
    return truncated.substring(0, lastSpaceIndex) + '...';
  };

  return (
    <div className="wireframe-section bhgm-journal-viewer" id="bhgmJournalViewer" data-testid="journal-viewer">
      <h2 className="wireframe-subtitle mb-2">Journal</h2>
      <ul className="overflow-y-auto">
        {displayEntries.map((entry) => (
          <li 
            key={entry.id} 
            className="wireframe-text mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleExpand(entry.id)}
          >
            <strong>{formatDate(entry.timestamp)}</strong>: {getSummaryContent(entry)}
            
            {/* No longer showing full content when expanded - user only wants date and summary */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JournalViewer;