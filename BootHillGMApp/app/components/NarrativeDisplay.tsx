import { useRef, useEffect, useMemo } from 'react';
import { cleanMetadataMarkers, toSentenceCase, extractItemUpdates } from '../utils/textCleaningUtils';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

// Key type definitions for narrative content processing
type ContentType = 'player-action' | 'gm-response' | 'narrative' | 'item-update';
type UpdateType = 'acquired' | 'used';

interface NarrativeItem {
  type: ContentType;
  content: string;
  metadata?: {
    items?: string[];
    updateType?: UpdateType;
  };
}

const processPlayerAction = (text: string): string => {
  const parts = text.split(':');
  if (parts.length !== 2 || !parts[1].trim()) {
    return text; // Return original if no valid content after colon
  }
  return `Player: ${toSentenceCase(parts[1].trim())}`;
};

/**
 * Processes narrative text into structured content, identifying:
 * - Player actions and GM responses
 * - Inventory changes (acquisitions and removals)
 * - Maintains proper formatting and spacing
 * 
 * Handles both explicit metadata markers and natural language patterns
 * for better game state tracking.
 */
const processNarrativeContent = (text: string): NarrativeItem[] => {
  console.log('Processing narrative:', text);
  const items: NarrativeItem[] = [];
  let currentInteraction = '';
  let lastProcessedLine = '';

  // Split the text into lines
  const lines = text.split('\n');

  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      items.push({ type: 'narrative', content: '' });
      continue;
    }

    // Add line to current interaction context
    currentInteraction += trimmedLine + '\n';

    console.log('Current line:', trimmedLine);
    console.log('Current interaction context:', currentInteraction);

    // Skip rendering of pure metadata lines
    if (/^(?:ACQUIRED_ITEMS|REMOVED_ITEMS|SUGGESTED_ACTIONS):/i.test(trimmedLine)) {
      console.log('Processing metadata line:', trimmedLine);
      // If this is a REMOVED_ITEMS line and the last processed line was a player action
      if (/^REMOVED_ITEMS:/i.test(trimmedLine) && lastProcessedLine.startsWith('Player:')) {
        const updates = extractItemUpdates(currentInteraction);
        console.log('Updates from metadata after player action:', updates);
        if (updates.removed.length > 0) {
          console.log('Adding removed items from metadata:', updates.removed);
          items.push({
            type: 'item-update',
            content: `Used/Removed Items: ${updates.removed.join(', ')}`,
            metadata: {
              items: updates.removed,
              updateType: 'used',
            },
          });
        }
      }
      continue;
    }

    const cleanedLine = cleanMetadataMarkers(trimmedLine);

    if (cleanedLine.startsWith('Player:')) {
      const processedAction = processPlayerAction(cleanedLine);
      if (processedAction !== 'Player: undefined') {
        items.push({ type: 'player-action', content: processedAction });
        lastProcessedLine = processedAction;
      }
    } else if (cleanedLine.startsWith('GM:') || cleanedLine.startsWith('Game Master:')) {
      items.push({
        type: 'gm-response',
        content: cleanedLine.replace('Game Master:', 'GM:'),
      });
      lastProcessedLine = cleanedLine;

      // Extract item updates from currentInteraction
      const updates = extractItemUpdates(currentInteraction);
      console.log('Updates after GM response:', updates);

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
      lastProcessedLine = cleanedLine;
    }
  }

  return items;
};

// Content render component
const NarrativeContent: React.FC<{ item: NarrativeItem }> = ({ item }) => {
  const baseClasses = 'my-2 py-1';
  
  switch (item.type) {
    case 'player-action':
      return <div className={`${baseClasses} player-action border-l-4 border-green-500 pl-4`}>{item.content}</div>;
      
    case 'gm-response':
      return <div className={`${baseClasses} gm-response border-l-4 border-blue-500 pl-4`}>{item.content}</div>;
      
    case 'item-update':
      console.log('Rendering item-update:', {
        content: item.content,
        updateType: item.metadata?.updateType,
      });
      return (
        <div
          data-testid={`item-update-${item.metadata?.updateType}`}
          className={`${baseClasses} item-update p-2 px-4 rounded border-l-4 ${
            item.metadata?.updateType === 'acquired'
              ? 'bg-amber-50 border-amber-400'
              : 'bg-gray-50 border-gray-400'
          }`}
        >
          {item.content}
        </div>
      );
      
    default:
      return item.content ? (
        <div className={`${baseClasses} narrative-line`}>{item.content}</div>
      ) : (
        <div className="h-2" />
      );
  }
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
