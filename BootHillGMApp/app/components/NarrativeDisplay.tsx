import { useRef, useEffect, useMemo, useCallback } from 'react';
import { NarrativeContent } from './NarrativeContent';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Key type definitions for narrative content processing.
 * ContentType defines the possible types of narrative content for consistent display.
 * UpdateType specifies the types of item updates that can occur during gameplay.
 */
export type ContentType = 'player-action' | 'gm-response' | 'narrative' | 'item-update';
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
 * Displays game narrative with auto-scrolling and content processing.
 * Handles different types of content (player actions, GM responses, items) 
 * and maintains a scrollable view with error handling.
 */
export const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry
}) => {
  // Track scroll position to maintain auto-scroll when appropriate
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef<boolean>(true);
  // Keep track of processed item updates to prevent duplicates
  const processedUpdatesRef = useRef<Set<string>>(new Set());

  // Process narrative content into structured items for display
  const narrativeItems = useMemo(() => {
    // Clear processed updates when narrative changes
    processedUpdatesRef.current.clear();
    
    return narrative.split('\n').reduce<NarrativeItem[]>((narrativeItems, line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        narrativeItems.push({ type: 'narrative', content: '' });
        return narrativeItems;
      }

      // Remove metadata markers while preserving core content
      const cleanLineContent = (text: string): string => {
        return text
          .replace(/(?:ACQUIRED_ITEMS|REMOVED_ITEMS|SUGGESTED_ACTIONS):.+$/g, '')
          .replace(/^important:.*$/i, '')  // Remove any remaining "important:" lines
          .trim();
      };

      // Process different types of narrative content
      if (trimmedLine.startsWith('Player:')) {
        narrativeItems.push({ 
          type: 'player-action',
          content: cleanLineContent(trimmedLine)
        });
      } else if (trimmedLine.startsWith('GM:') || trimmedLine.startsWith('Game Master:')) {
        narrativeItems.push({ 
          type: 'gm-response',
          content: cleanLineContent(trimmedLine)
        });
      } else if (/^(?:ACQUIRED_ITEMS|REMOVED_ITEMS):/.test(trimmedLine)) {
        // Handle item acquisition and removal updates
        const [type, itemList] = trimmedLine.split(':');
        const updateType = type.startsWith('ACQUIRED') ? 'acquired' : 'used';
        const itemsArray = itemList.replace(/[\[\]]/g, '').split(',').map(i => i.trim()).filter(Boolean);
        
        if (itemsArray.length) {
          narrativeItems.push({
            type: 'item-update',
            content: '',
            metadata: { updateType, items: itemsArray }
          });
        }
      } else if (!trimmedLine.startsWith('SUGGESTED_ACTIONS:')) {
        // Process regular narrative lines, excluding metadata markers
        narrativeItems.push({ 
          type: 'narrative',
          content: cleanLineContent(trimmedLine)
        });
      }
      
      return narrativeItems;
    }, []);
  }, [narrative]);

  // Update auto-scroll state based on user interaction
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (containerRef.current && isAutoScrollEnabled.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4"
      data-testid="narrative-display"
    >
      <div className="narrative-content py-4 space-y-1">
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
