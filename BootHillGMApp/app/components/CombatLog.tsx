import React from 'react';

interface CombatLogProps {
  entries: string[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ entries }) => {
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div 
      ref={logRef}
      className="combat-log max-h-48 overflow-y-auto"
      role="log"
      aria-label="Combat log"
    >
      {entries.map((log: string, index: number) => (
        <p key={index} className="text-sm">{log}</p>
      ))}
    </div>
  );
};
