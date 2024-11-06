interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

interface CombatLogProps {
  entries: CombatLogEntry[];
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
          key={`${entry.timestamp}-${index}`}
          className={`text-sm my-1 px-2 py-1 rounded ${
            entry.type === 'hit' ? 'bg-green-100' :
            entry.type === 'miss' ? 'bg-gray-100' :
            entry.type === 'critical' ? 'bg-yellow-100' :
            ''
          }`}
          data-testid={`combat-log-entry-${index}`}
        >
          {entry.text}
        </p>
      ))}
    </div>
  );
};
