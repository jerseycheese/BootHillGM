/**
 * @fileoverview WoundLocationDisplay Component
 * 
 * A component for displaying wound location and severity information with appropriate
 * visual styling based on wound severity. Part of the Boot Hill combat system's
 * wound tracking interface.
 */

import React from 'react';

interface WoundLocationDisplayProps {
  /** The body location of the wound (e.g., 'head', 'chest', etc.) */
  location: string;
  /** The severity of the wound (e.g., 'light', 'serious', 'mortal') */
  severity: string;
}

/**
 * Displays a wound's location and severity with appropriate styling
 * 
 * @component
 * @example
 * ```tsx
 * <WoundLocationDisplay location="head" severity="light" />
 * ```
 */
const WoundLocationDisplay: React.FC<WoundLocationDisplayProps> = ({ location, severity }) => {
  // Determine severity-based styling
  const severityStyles = {
    light: 'bg-yellow-50 text-yellow-700',
    serious: 'bg-red-50 text-red-700',
    mortal: 'bg-red-100 text-red-900 font-bold',
  }[severity.toLowerCase()] || 'bg-gray-50 text-gray-700';

  return (
    <div 
      className={`rounded-sm p-2 flex justify-between items-center ${severityStyles}`}
      data-testid={`wound-${location}-${severity}`}
    >
      <span className="capitalize">{location}</span>
      <span className="text-sm font-medium capitalize">{severity}</span>
    </div>
  );
};

export default WoundLocationDisplay;
