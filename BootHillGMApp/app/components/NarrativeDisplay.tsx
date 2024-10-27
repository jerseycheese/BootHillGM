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

  // Auto-scroll to bottom when narrative updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative]); // Re-run when narrative changes

  return (
    <div 
      ref={containerRef}
      className="overflow-y-auto flex-1"
    >
      <pre className="wireframe-text whitespace-pre-wrap text-lg leading-relaxed">
        {narrative}
      </pre>
      {error && (
        <div className="text-red-500 flex items-center gap-2 mt-4 p-2 bg-red-50 rounded">
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
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
