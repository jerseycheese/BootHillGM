import { cleanCombatLogEntry } from '../../utils/textCleaningUtils';
import { debugTextCleaning } from '../../utils/debugHelpers';

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
      {entries.map((entry, index) => {
        debugTextCleaning('Combat Log - Before Cleaning', entry.text);
        const cleanedText = cleanCombatLogEntry(entry.text);
        debugTextCleaning('Combat Log - After Cleaning', cleanedText);
        
        return (
          <p 
            key={`${entry.timestamp}-${index}`}
            className={`text-sm my-1 px-2 py-1 rounded ${
              entry.type === 'hit' ? 'bg-green-100' :
              entry.type === 'miss' ? 'bg-gray-100' :
              entry.type === 'critical' ? 'bg-yellow-100' : ''
            }`}
            data-testid={`combat-log-entry-${index}`}
          >
            {cleanedText}
          </p>
        );
      })}
    </div>
  );
};
