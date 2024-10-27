import React, { useEffect, useRef } from 'react';

interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * NarrativeDisplay handles the presentation of game narrative text and error states.
 * It provides:
 * - Expanded scrollable container for game text
 * - Error message display in red
 * - Optional retry functionality for error recovery
 * - Preserves text formatting using pre tag and whitespace-pre-wrap
 * - Auto-scrolls to bottom when new narrative content arrives
 */
const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastNarrativeRef = useRef<string>('');
  
  // Tracks whether auto-scroll should be enabled based on user scroll position
  const isAutoScrollEnabled = useRef<boolean>(true);

  useEffect(() => {
    if (containerRef.current && narrative !== lastNarrativeRef.current && isAutoScrollEnabled.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
      lastNarrativeRef.current = narrative;
    }
  }, [narrative]);

  // Disables auto-scroll when user scrolls up, re-enables when they scroll to bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAutoScrollEnabled.current = isAtBottom;
  };

  // Formats narrative text with visual distinction between player actions and GM responses
  // Returns an array of styled div elements for each line of text
  const formatNarrativeContent = (text: string): JSX.Element[] => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('Player:')) {
        return (
          <div 
            key={`line-${index}`}
            className="player-action my-3 py-2 px-4 rounded border-l-4 border-green-500"
          >
            {line}
          </div>
        );
      }
      
      if (line.startsWith('Game Master:')) {
        return (
          <div 
            key={`line-${index}`}
            className="gm-response my-3 py-2 px-4 border-l-4 border-blue-500"
          >
            {line.replace('Game Master:', 'GM:')}
          </div>
        );
      }
      
      return line.trim() ? (
        <div 
          key={`line-${index}`}
          className="narrative-line my-2 py-1"
        >
          {line}
        </div>
      ) : <div key={`line-${index}`} className="h-2" />;
    });
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="narrative-container overflow-y-auto flex-1 max-h-[60vh] px-4"
      data-testid="narrative-display"
    >
      <div className="narrative-content py-4 space-y-1">
        {formatNarrativeContent(narrative)}
      </div>
      
      {error && (
        <div 
          className="error-container text-red-500 flex items-center gap-2 mt-4 p-2 bg-red-50 rounded"
          role="alert"
        >
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="retry-button px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NarrativeDisplay;
