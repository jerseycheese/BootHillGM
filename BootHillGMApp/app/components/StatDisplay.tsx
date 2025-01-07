import React from 'react';

/**
 * StatDisplay component displays a single stat with label, value, and optional max value and description.
 */

interface StatDisplayProps {
  label: string; // The label of the stat (e.g., "Strength")
  value: number; // The current value of the stat
  max?: number; // The maximum value of the stat (optional)
  description?: string; // A description of the stat (optional)
}

export default function StatDisplay({ label, value, max, description }: StatDisplayProps) {
  return (
    <div className="stat-container flex flex-col gap-2">
      <div className="stat-label text-sm font-bold">{label}</div>
      <div className="stat-value text-lg">
        {value}
        {max && (
          <span className="stat-max text-sm">
            / {max}
          </span>
        )}
      </div>
      {description && (
        <div className="stat-description text-xs italic">{description}</div>
      )}
    </div>
  );
}
