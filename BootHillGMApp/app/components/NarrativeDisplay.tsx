import { useRef, useEffect } from 'react';

export interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

interface ItemUpdate {
  items: string;
  type: 'acquired' | 'used';
}

export const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastNarrativeRef = useRef<string>('');
  const isAutoScrollEnabled = useRef<boolean>(true);

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
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAutoScrollEnabled.current = isAtBottom;
  };

  // Shows a notification when items are acquired or used
  // Acquired items appear in amber with a package emoji
  // Used items appear in gray with a recycle emoji
  const createItemUpdateNotification = ({ items, type }: ItemUpdate): JSX.Element => {
    const itemList = items.split(',').map(item => item.trim());
    const isAcquired = type === 'acquired';
    
    return (
      <div className={`item-update my-2 py-2 px-4 rounded border-l-4 ${
        isAcquired ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-400'
      }`}>
        <span className={isAcquired ? 'text-amber-700' : 'text-gray-700'}>
          {isAcquired ? 'Acquired: ' : 'Used: '}
        </span>
        <span className={isAcquired ? 'text-amber-900' : 'text-gray-900'}>
          {itemList.map((item, idx) => (
            <span key={idx}>
              {idx > 0 && ", "}
              <span className="font-medium">{item}</span>
            </span>
          ))}
        </span>
      </div>
    );
  };

  // Processes the narrative text and formats it with appropriate styling
  // - Player actions are shown with a green border
  // - GM responses are shown with a blue border
  // - Item updates appear after the relevant action
  const formatNarrativeContent = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let pendingUpdate: ItemUpdate | null = null;

    text.split('\n').forEach((line, index) => {
      if (line.startsWith('ACQUIRED_ITEMS:')) {
        pendingUpdate = {
          items: line.replace('ACQUIRED_ITEMS:', '').trim(),
          type: 'acquired'
        };
        return;
      }
      
      if (line.startsWith('REMOVED_ITEMS:')) {
        pendingUpdate = {
          items: line.replace('REMOVED_ITEMS:', '').trim(),
          type: 'used'
        };
        return;
      }

      if (pendingUpdate && 
          !line.startsWith('ACQUIRED_ITEMS:') && 
          !line.startsWith('REMOVED_ITEMS:')) {
        elements.push(createItemUpdateNotification(pendingUpdate));
        pendingUpdate = null;
      }

      if (line.startsWith('Player:')) {
        elements.push(
          <div key={`line-${index}`} className="player-action my-3 py-2 px-4 rounded border-l-4 border-green-500">
            {line}
          </div>
        );
      } else if (line.startsWith('Game Master:')) {
        elements.push(
          <div key={`line-${index}`} className="gm-response my-3 py-2 px-4 border-l-4 border-blue-500">
            {line.replace('Game Master:', 'GM:')}
          </div>
        );
      } else if (line.trim()) {
        elements.push(
          <div key={`line-${index}`} className="narrative-line my-2 py-1">
            {line}
          </div>
        );
      } else {
        elements.push(<div key={`line-${index}`} className="h-2" />);
      }
    });

    if (pendingUpdate) {
      elements.push(createItemUpdateNotification(pendingUpdate));
    }

    return elements;
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4"
      data-testid="narrative-display"
    >
      <div className="narrative-content py-4 space-y-1 relative">
        {formatNarrativeContent(narrative)}
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
