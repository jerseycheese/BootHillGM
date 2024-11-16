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

const cleanItemList = (itemsStr: string): string[] => {
  // First clean up any JSON or metadata markers that might have gotten mixed in
  const cleanStr = itemsStr.split('SUGGESTED_ACTIONS')[0].trim();
  
  const items = cleanStr
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(item => item.trim())
    .filter(item => {
      const lowerItem = item.toLowerCase();
      return item.length > 0 && 
             !['items', 'item', 'things', 'stuff', 'several', 'valuable'].includes(lowerItem) &&
             !lowerItem.endsWith('items') &&
             !lowerItem.endsWith('stuff');
    });

  // Normalize the items
  return normalizeItemList(items);
};

/**
 * Helper function to detect item acquisitions in natural language.
 * Returns items if found, null otherwise.
 */
const detectNaturalLanguageItems = (text: string): string[] | null => {
  const weaponPatterns = [
    /(?:find|discover|locate|uncover)\s+(?:a|an|the)\s+(?:rusty\s+)?(?:but\s+)?(?:serviceable\s+)?(?:old\s+)?([^,.]+?(?:shotgun|rifle|revolver|pistol|gun|knife|blade)[^,.]*?)(?:(?:'s|\.|\sand\s|,|\s+tucked|\s+beneath))/gi,
  ];

  let weapons: string[] = [];

  // Process weapon patterns
  for (const pattern of weaponPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const weapon = match[1]
          .replace(/(?:rusty|but serviceable|functional|stiff|mechanism is|old)\s+/gi, '')
          .replace(/(?:'s mechanism.*$)/, '')
          .replace(/\s+tucked.*$/, '')
          .trim();
        if (weapon && !weapons.includes(weapon)) {
          weapons.push(weapon);
        }
      }
    }
  }

  return weapons.length > 0 ? weapons : null;
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
  const foundItemsSet = new Set<string>();
  let hasMetadataItems = false; // Flag to track if we found metadata items

  // Split the text into lines
  const lines = text.split('\n');
  console.log('Processing lines:', lines);

  // First pass - check for metadata items
  for (const line of lines) {
    if (/^ACQUIRED_ITEMS:/i.test(line)) {
      const itemMatch = line.match(/^ACQUIRED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        hasMetadataItems = true;
        break;
      }
    }
  }

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      emptyLineCount++;
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
        if (acquiredItems && acquiredItems.length > 0) {
          const newItems = acquiredItems.filter(item => !foundItemsSet.has(item));
          if (newItems.length > 0) {
            newItems.forEach(item => foundItemsSet.add(item));
            items.push({
              type: 'item-update',
              content: `Acquired Items: ${newItems.join(', ')}`,
              metadata: {
                items: newItems,
                updateType: 'acquired',
              },
            });
          }
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
    if (/^(?:REMOVED_ITEMS:|SUGGESTED_ACTIONS:)/i.test(trimmedLine)) {
      continue;
    }

    // Clean the line and process content
    const cleanedLine = cleanMetadataMarkers(trimmedLine);
    if (!cleanedLine && trimmedLine) {
      items.push({ type: 'narrative', content: trimmedLine });
      continue;
    }
    if (!cleanedLine) continue;

    if (cleanedLine.startsWith('Player:')) {
      items.push({ 
        type: 'player-action', 
        content: processPlayerAction(cleanedLine) 
      });
    } else if (cleanedLine.startsWith('GM:') || cleanedLine.startsWith('Game Master:')) {
      const gmResponse = cleanedLine.replace('Game Master:', 'GM:');
      items.push({ type: 'gm-response', content: gmResponse });

      // Only detect natural language items if no metadata items were found
      if (!hasMetadataItems) {
        const gmText = gmResponse.replace(/^GM:\s*/, '');
        const naturalItems = detectNaturalLanguageItems(gmText);
        
        if (naturalItems) {
          const normalizedItems = normalizeItemList(naturalItems)
            .filter(item => !foundItemsSet.has(item));

          if (normalizedItems.length > 0) {
            normalizedItems.forEach(item => foundItemsSet.add(item));
            items.push({
              type: 'item-update',
              content: `Acquired Items: ${normalizedItems.join(', ')}`,
              metadata: {
                items: normalizedItems,
                updateType: 'acquired',
              },
            });
          }
        }
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
  const processedUpdatesRef = useRef<Set<string>>(new Set());

  // Clear processed updates when narrative changes
  useEffect(() => {
    processedUpdatesRef.current.clear();
    console.log('Cleared processed updates');
  }, [narrative]);

  const narrativeItems = useMemo(
    () => {
      console.log('Processing narrative:', narrative);
      const items = processNarrativeContent(narrative);
      console.log('Processed items:', items);
      return items;
    },
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
          <NarrativeContent 
            key={`${item.type}-${index}`} 
            item={item} 
            processedUpdates={processedUpdatesRef.current}
          />
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
