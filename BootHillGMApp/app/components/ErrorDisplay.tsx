import React from 'react';

interface ErrorDisplayProps {
  error: string | { reason: string } | null;
  onClear?: () => void;
  onRetry?: () => void;
}

/**
 * A reusable component to display error messages.
 *
 * Features:
 * - Displays the error message if present.
 * - Uses ARIA attributes for accessibility.
 * - Optionally displays a "Retry" button.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
    const errorMessage = typeof error === 'string' ? error : error?.reason;
    return (
        <div id="bhgmErrorDisplay" className="text-red-600 mb-2 flex items-center bhgm-error-display" role="alert" data-testid="error-display">
            <span>{errorMessage}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    aria-label="Retry"
                >
                    Retry
                </button>
            )}
        </div>
    );
};
