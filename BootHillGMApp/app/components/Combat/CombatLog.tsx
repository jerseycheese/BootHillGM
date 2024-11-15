import { cleanCombatLogEntry } from '../../utils/textCleaningUtils';

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
        // Clean and extract just the combat action, removing metadata and status updates
        const cleanedText = cleanCombatLogEntry(
          entry.text
            .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical content with surrounding spaces
            .replace(/\s*important:.*?(?=\s*\w+\s+(?:punches|shoots|attacks))/g, '') // Remove "important:" sections before combat actions
            .replace(/\s+/g, ' ') // Normalize whitespace
            .split(/[{:\n]/)[0] // Split on metadata markers
            .trim()
        );
        
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
