import React from 'react';

/**
 * Props for the CombatLog component
 */
interface CombatLogProps {
  /** Array of combat log messages to display */
  entries: string[];
}

/**
 * Displays a scrollable list of combat actions and their outcomes.
 * Features:
 * - Auto-scrolling container with max height
 * - Accessible log role and label
 * - Test IDs for automated testing
 * - Individual entry keys for React reconciliation
 */
export const CombatLog: React.FC<CombatLogProps> = ({ entries }) => {
  return (
    <div 
      className="combat-log max-h-48 overflow-y-auto"
      role="log"
      aria-label="Combat log"
      data-testid="combat-log"
    >
      {entries.map((entry, index) => (
        <p 
          key={`${entry}-${index}`}
          className="text-sm"
          data-testid={`combat-log-entry-${index}`}
        >
          {entry}
        </p>
      ))}
    </div>
  );
};
