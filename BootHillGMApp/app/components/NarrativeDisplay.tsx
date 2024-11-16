import { useRef, useEffect, useMemo } from 'react';
import { cleanMetadataMarkers, toSentenceCase } from '../utils/textCleaningUtils';
import { NarrativeContent } from './NarrativeContent';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

// Key type definitions for narrative content processing
type ContentType = 'player-action' | 'gm-response' | 'narrative' | 'item-update';
type UpdateType = 'acquired' | 'used';

export const normalizeItemList = (items: string[]): string[] => {
  return items.map(item => {
    return item
      .replace(/^(?:a|an|the)\s+/i, '')
      .replace(/(?:rusty|but functional|wicked-looking|still surprisingly sharp)/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*its\s+[^,]+/i, '')
      .trim();
  })
  .filter(item => item.length > 0)
  .filter((item, index, self) => 
    index === self.findIndex(t => 
      t.toLowerCase() === item.toLowerCase()
    )
  );
};

export interface NarrativeItem {
  type: ContentType;
  content: string;
  metadata?: {
    items?: string[];
    updateType?: UpdateType;
  };
}

/**
 * Helper function to format player actions with proper casing.
 */
const processPlayerAction = (text: string): string => {
  const parts = text.split(':');
  if (parts.length !== 2 || !parts[1].trim()) {
    return text; // Return original if no valid content after colon
  }
  return `Player: ${toSentenceCase(parts[1].trim())}`;
};

/**
 * Helper function to clean item lists from metadata markers.
 * Handles both bracketed and unbracketed formats.
 */
const normalizeItemList = (items: string[]): string[] => {
  return items.map(item => {
    return item
      .replace(/^(?:a|an|the)\s+/i, '')
      .replace(/(?:rusty|but functional|wicked-looking|still surprisingly sharp)/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*its\s+[^,]+/i, '')
      .trim();
  })
  .filter(item => item.length > 0)
  .filter((item, index, self) => 
    index === self.findIndex(t => 
      t.toLowerCase() === item.toLowerCase()
    )
  );
};

const cleanItemList = (itemsStr: string): string[] => {
  // Remove brackets and split by comma
  const items = itemsStr.replace(/^\[|\]$/g, '')
    .split(',')
    .map(item => item.trim())
    .filter(item => {
      const lowerItem = item.toLowerCase();
      return item.length > 0 && 
             !['items', 'item', 'things', 'stuff', 'several', 'valuable'].includes(lowerItem) &&
             !lowerItem.endsWith('items') &&
             !lowerItem.endsWith('stuff');
    });
  return normalizeItemList(items);
};

/**
 * Helper function to detect item acquisitions in natural language.
 * Returns items if found, null otherwise.
 */
const detectNaturalLanguageItems = (text: string): string[] | null => {
  // Look for patterns indicating item discovery
  const findPatterns = [
    /(?:find|discover|acquire|take|contains?|inside\s+(?:are|is|you\s+find)|reveals?|uncover)\s+(?:a|an|the|some|valuable)?\s*([^.]+?)(?:\.|$)/gi,
    /inside\s+you\s+find\s+(?:a|an|the|some|valuable)?\s*([^.]+?)(?:\.|$)/gi,
    /(?:a|an|the)\s+([^,.]+?(?:shovel|pickaxe|knife|revolver|gun|weapon)[^,.]*?)(?:,|\sand\s|$)/gi
  ];

  let allItems: string[] = [];
  let processedText = text;

  for (const pattern of findPatterns) {
    const matches = processedText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        // Clean up the found items text and split by common separators
        const itemsText = match[1]
          .replace(/\s+(?:and|&)\s+/g, ',')
          .replace(/valuable\s+items?/i, '')
          .replace(/(?:rusty|discarded|functional|worn)\s+/g, '') // Remove common adjectives
          .replace(/,\s*yet\s*/g, ',') // Remove "yet" conjunctions
          .replace(/\s+holding\s+([^,]+)/g, ', $1'); // Convert "holding X" to ", X"
        
        const items = cleanItemList(itemsText);
        if (items.length > 0) {
          // Remove the matched text from further processing
          processedText = processedText.replace(match[0], '');
          allItems.push(...items);
        }
      }
    }
  }

  // Clean and normalize item names
  const normalizedItems = allItems
    .map(item => {
      return item
        .replace(/^(?:a|an|the)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter((item, index, self) => 
      // Remove duplicates case-insensitively
      index === self.findIndex(t => 
        t.toLowerCase() === item.toLowerCase()
      )
    );

  return normalizedItems.length > 0 ? normalizedItems : null;
};

/**
 * Helper function to find next metadata items
 */
const findNextMetadataItems = (lines: string[], currentIndex: number): string[] | null => {
  // Look ahead up to 3 lines for metadata markers
  const searchLimit = Math.min(currentIndex + 4, lines.length);
  
  for (let i = currentIndex + 1; i < searchLimit; i++) {
    const line = lines[i].trim();
    if (/^ACQUIRED_ITEMS:/i.test(line)) {
      const itemMatch = line.match(/^ACQUIRED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        return cleanItemList(itemMatch[1]);
      }
    }
    // Stop looking if we hit another narrative element
    if (line.startsWith('Player:') || line.startsWith('GM:')) {
      break;
    }
  }
  return null;
};

/**
 * Processes narrative text into content blocks for display.
 * Handles: player actions, GM responses, item updates, and general narrative.
 * Maintains proper spacing and formatting while cleaning metadata markers.
 */
const processNarrativeContent = (text: string): NarrativeItem[] => {
  const items: NarrativeItem[] = [];
  let emptyLineCount = 0;

  // Split the text into lines
  const lines = text.split('\n');

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle empty lines
    if (!trimmedLine) {
      emptyLineCount++;
      // Only add a spacer for the first two empty lines
      if (emptyLineCount <= 2) {
        items.push({ type: 'narrative', content: '' });
      }
      continue;
    }
    emptyLineCount = 0;

    // Process metadata markers and collect items
    if (/^ACQUIRED_ITEMS:/i.test(trimmedLine)) {
      const itemMatch = trimmedLine.match(/^ACQUIRED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        const acquiredItems = cleanItemList(itemMatch[1]);
        if (acquiredItems.length > 0) {
          items.push({
            type: 'item-update',
            content: `Acquired Items: ${acquiredItems.join(', ')}`,
            metadata: {
              items: acquiredItems,
              updateType: 'acquired',
            },
          });
        }
      }
      continue;
    }

    if (/^REMOVED_ITEMS:/i.test(trimmedLine)) {
      const itemMatch = trimmedLine.match(/^REMOVED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        const removedItems = cleanItemList(itemMatch[1]);
        if (removedItems.length > 0) {
          items.push({
            type: 'item-update',
            content: `Used/Removed Items: ${removedItems.join(', ')}`,
            metadata: {
              items: removedItems,
              updateType: 'used',
            },
          });
        }
      }
      continue;
    }

    // Skip other metadata markers
    if (/^SUGGESTED_ACTIONS:/i.test(trimmedLine)) {
      continue;
    }

    // Clean the line and skip if empty after cleaning
    const cleanedLine = cleanMetadataMarkers(trimmedLine);
    // If the original line has content but cleaning removed it all,
    // use the original line for narrative content
    if (!cleanedLine && trimmedLine) {
      items.push({ type: 'narrative', content: trimmedLine });
      continue;
    }
    
    if (!cleanedLine) {
      if (emptyLineCount <= 2) {
        items.push({ type: 'narrative', content: '' });
      }
      continue;
    }

    if (cleanedLine.startsWith('Player:')) {
      const processedAction = processPlayerAction(cleanedLine);
      if (processedAction !== 'Player: undefined') {
        items.push({ type: 'player-action', content: processedAction });
      }
    } else if (cleanedLine.startsWith('GM:') || cleanedLine.startsWith('Game Master:')) {
      const gmResponse = cleanedLine.replace('Game Master:', 'GM:');
      items.push({ type: 'gm-response', content: gmResponse });

      // Extract the actual GM text without the prefix
      const gmText = gmResponse.replace(/^GM:\s*/, '');
      
      // Check for natural language item acquisitions
      const naturalItems = detectNaturalLanguageItems(gmText);
      if (naturalItems) {
        items.push({
          type: 'item-update',
          content: `Acquired Items: ${naturalItems.join(', ')}`,
          metadata: {
            items: naturalItems,
            updateType: 'acquired',
          },
        });
      }

      // Keep the existing metadata check
      const nextMetadataItems = findNextMetadataItems(lines, i);
      if (nextMetadataItems) {
        items.push({
          type: 'item-update',
          content: `Acquired Items: ${nextMetadataItems.join(', ')}`,
          metadata: {
            items: nextMetadataItems,
            updateType: 'acquired',
          },
        });
      }
    } else {
      items.push({ type: 'narrative', content: cleanedLine });
    }
  }

  return items;
};

// Main narrative display component that handles:
// - Auto-scrolling behavior
// - Content processing and rendering
// - Error states and retry functionality
export const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastNarrativeRef = useRef<string>('');
  const isAutoScrollEnabled = useRef<boolean>(true);
  const narrativeItems = useMemo(
    () => processNarrativeContent(narrative),
    [narrative]
  );

  useEffect(() => {
    if (containerRef.current && narrative !== lastNarrativeRef.current && isAutoScrollEnabled.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
      lastNarrativeRef.current = narrative;
    }
  }, [narrative]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4"
      data-testid="narrative-display"
    >
      <div className="narrative-content py-4 space-y-1 relative">
        {narrativeItems.map((item, index) => (
          <NarrativeContent key={`${item.type}-${index}`} item={item} />
        ))}
      </div>
      
      {error && (
        <div 
          className="wireframe-section text-red-500 flex items-center gap-2 mt-4 p-2"
          role="alert"
        >
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="wireframe-button px-3 py-1"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
