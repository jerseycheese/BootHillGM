import { cleanCombatLogEntry } from '../../utils/textCleaningUtils';

export const CombatLog = ({ 
  entries 
}: { 
  entries: Array<{
    text: string;
    type: 'hit' | 'miss' | 'critical' | 'info';
    timestamp: number;
  }>
}) => {
  const getEntryClass = (type: string) => ({
    'hit': 'bg-green-100',
    'miss': 'bg-gray-100',
    'critical': 'bg-yellow-100'
  }[type] || '');

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
          className={`text-sm my-1 px-2 py-1 rounded ${getEntryClass(entry.type)}`}
          data-testid={`combat-log-entry-${index}`}
        >
          {cleanCombatLogEntry(entry.text)}
        </p>
      ))}
    </div>
  );
};
