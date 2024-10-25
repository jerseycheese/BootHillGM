interface NarrativeDisplayProps {
  narrative: string;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * NarrativeDisplay handles the presentation of game narrative text and error states.
 * It provides:
 * - Scrollable container for game text
 * - Error message display in red
 * - Optional retry functionality for error recovery
 * - Preserves text formatting using pre tag and whitespace-pre-wrap
 */
const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({
  narrative,
  error,
  onRetry
}) => {
  // Use wireframe-section for consistent styling and h-64 for fixed height with scrolling
  return (
    <div className="wireframe-section h-64 overflow-y-auto">
      <pre className="wireframe-text whitespace-pre-wrap">{narrative}</pre>
      {error && (
        <div className="text-red-500 flex items-center gap-2">
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
