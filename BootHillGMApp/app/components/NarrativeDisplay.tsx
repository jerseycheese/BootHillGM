import { useRef, useEffect, useMemo } from 'react';
import { cleanMetadataMarkers, toSentenceCase, extractItemUpdates } from '../utils/textCleaningUtils';
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
const cleanItemList = (itemsStr: string): string[] => {
  // Remove brackets and split by comma
  return itemsStr.replace(/^\[|\]$/g, '')
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

/**
 * Processes narrative text into content blocks for display.
 * Handles: player actions, GM responses, item updates, and general narrative.
 * Maintains proper spacing and formatting while cleaning metadata markers.
 */
const processNarrativeContent = (text: string): NarrativeItem[] => {
  const items: NarrativeItem[] = [];
  let currentInteraction = '';
  let emptyLineCount = 0;

  // Split the text into lines
  const lines = text.split('\n');

  // Process each line
  for (const line of lines) {
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

    // Add line to current interaction context
    currentInteraction += trimmedLine + '\n';

    // Process metadata markers and collect items
    let acquiredItems: string[] = [];
    let removedItems: string[] = [];
    
    if (/^ACQUIRED_ITEMS:/i.test(trimmedLine)) {
      const itemMatch = trimmedLine.match(/^ACQUIRED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        acquiredItems = cleanItemList(itemMatch[1]);
      }
      continue;
    }

    if (/^REMOVED_ITEMS:/i.test(trimmedLine)) {
      const itemMatch = trimmedLine.match(/^REMOVED_ITEMS:\s*(.+)/i);
      if (itemMatch && itemMatch[1]) {
        removedItems = cleanItemList(itemMatch[1]);
      }
      continue;
    }

    // Skip other metadata markers
    if (/^SUGGESTED_ACTIONS:/i.test(trimmedLine)) {
      continue;
    }

    const cleanedLine = cleanMetadataMarkers(trimmedLine);

    if (cleanedLine.startsWith('Player:')) {
      const processedAction = processPlayerAction(cleanedLine);
      if (processedAction !== 'Player: undefined') {
        items.push({ type: 'player-action', content: processedAction });
      }
    } else if (cleanedLine.startsWith('GM:') || cleanedLine.startsWith('Game Master:')) {
      items.push({
        type: 'gm-response',
        content: cleanedLine.replace('Game Master:', 'GM:'),
      });

      // Extract item updates from currentInteraction
      const updates = extractItemUpdates(currentInteraction);

      // Add acquired items if any
      if (updates.acquired.length > 0) {
        items.push({
          type: 'item-update',
          content: `Acquired Items: ${updates.acquired.join(', ')}`,
          metadata: {
            items: updates.acquired,
            updateType: 'acquired',
          },
        });
      }

      // Reset currentInteraction after processing GM response
      currentInteraction = '';
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
