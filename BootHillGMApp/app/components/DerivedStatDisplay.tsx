import React from 'react';

/**
 * DerivedStatDisplay component displays a derived stat with label, value, and optional description.
 */

interface DerivedStatDisplayProps {
  label: string; // The label of the derived stat (e.g., "Hit Points")
  value: number; // The current value of the derived stat
  description?: string; // A description of the derived stat (optional)
}

export default function DerivedStatDisplay({
  label,
  value,
  description,
}: DerivedStatDisplayProps) {
  return (
    <div className="stat-container flex flex-col gap-2">
      <div className="stat-label text-sm font-bold">{label}</div>
      <div className="stat-value text-lg">{value}</div>
      {description && (
        <div className="stat-description text-xs italic">{description}</div>
      )}
    </div>
  );
}
