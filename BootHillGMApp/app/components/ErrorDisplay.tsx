import React, { useEffect } from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onClear: () => void;
}

/**
 * A reusable component to display error messages.
 * 
 * Features:
 * - Displays the error message if present.
 * - Automatically clears the error after a timeout.
 * - Uses ARIA attributes for accessibility.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear }) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (error) {
      timeoutId = setTimeout(onClear, 3000); // Clear error after 3 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error, onClear]);

  if (!error) {
    return null;
  }

  return (
    <div 
      className="text-red-600 mb-2" 
      role="alert" 
      data-testid="error-display"
    >
      {error}
    </div>
  );
};
