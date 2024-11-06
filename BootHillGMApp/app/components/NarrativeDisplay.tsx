import { useRef, useEffect, useMemo } from 'react';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

// Key type definitions for narrative content processing
type ContentType = 'player-action' | 'gm-response' | 'narrative' | 'item-update';
type UpdateType = 'acquired' | 'used';

interface PendingUpdate {
  items: string;
  type: UpdateType;
}

interface NarrativeItem {
  type: ContentType;
  content: string;
  metadata?: {
    items?: string[];
    updateType?: UpdateType;
  };
}

// Parses a single line of text into a structured narrative item with appropriate type
const parseNarrativeLine = (line: string): NarrativeItem => {
  if (line.startsWith('Player:')) {
    return { type: 'player-action', content: line };
  } else if (line.startsWith('Game Master:')) {
    return { 
      type: 'gm-response', 
      content: line.replace('Game Master:', 'GM:') 
    };
  }
  return { type: 'narrative', content: line };
};

// Creates a formatted item update entry for inventory changes
const createItemUpdate = (items: string, type: UpdateType): NarrativeItem => {
  const itemList = items.split(',').map(item => item.trim());
  return {
    type: 'item-update',
    content: `${type === 'acquired' ? 'Acquired' : 'Used'}: ${itemList.join(', ')}`,
    metadata: { items: itemList, updateType: type }
  };
};

// Processes the full narrative text into structured content items
// Handles special markers like ACQUIRED_ITEMS and REMOVED_ITEMS
// Returns an array of typed narrative items for consistent rendering
const processNarrativeContent = (text: string): NarrativeItem[] => {
  const items: NarrativeItem[] = [];
  let pendingUpdate: PendingUpdate | null = null;

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    if (trimmedLine.startsWith('ACQUIRED_ITEMS:')) {
      pendingUpdate = {
        items: trimmedLine.replace('ACQUIRED_ITEMS:', '').trim(),
        type: 'acquired' as const
      };
      continue;
    }
    
    if (trimmedLine.startsWith('REMOVED_ITEMS:')) {
      pendingUpdate = {
        items: trimmedLine.replace('REMOVED_ITEMS:', '').trim(),
        type: 'used' as const
      };
      continue;
    }

    if (pendingUpdate && trimmedLine.length > 0 && 
        !trimmedLine.startsWith('ACQUIRED_ITEMS:') && 
        !trimmedLine.startsWith('REMOVED_ITEMS:')) {
      items.push(createItemUpdate(pendingUpdate.items, pendingUpdate.type));
      pendingUpdate = null;
    }

    if (trimmedLine.length > 0) {
      items.push(parseNarrativeLine(trimmedLine));
    } else {
      items.push({ type: 'narrative', content: '' });
    }
  }

  if (pendingUpdate) {
    items.push(createItemUpdate(pendingUpdate.items, pendingUpdate.type));
  }

  return items;
};

// Renders individual narrative items with consistent styling based on their type
const NarrativeContent: React.FC<{ item: NarrativeItem }> = ({ item }) => {
  const baseClasses = 'my-2 py-1';
  
  switch (item.type) {
    case 'player-action':
      return <div className={`${baseClasses} player-action border-l-4 border-green-500 pl-4`}>{item.content}</div>;
    case 'gm-response':
      return <div className={`${baseClasses} gm-response border-l-4 border-blue-500 pl-4`}>{item.content}</div>;
    case 'item-update':
      const bgColor = item.metadata?.updateType === 'acquired' ? 'bg-amber-50' : 'bg-gray-50';
      const borderColor = item.metadata?.updateType === 'acquired' ? 'border-amber-400' : 'border-gray-400';
      return (
        <div className={`${baseClasses} item-update py-2 px-4 rounded border-l-4 ${bgColor} ${borderColor}`}>
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
