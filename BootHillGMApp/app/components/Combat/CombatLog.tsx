import React from 'react';

interface CombatLogProps {
  entries: string[];
}

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
