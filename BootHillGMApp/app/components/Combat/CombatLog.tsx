import { useEffect, useRef, useCallback } from 'react';
import { cleanCombatLogEntry } from '../../utils/textCleaningUtils';
import type { CombatSummary, LogEntry } from '../../types/combat';

/**
 * Props for the CombatLog component
 */
interface CombatLogProps {
  /** Array of combat log entries showing combat progression */
  entries: LogEntry[];
  /** Optional combat summary shown when combat ends */
  summary?: CombatSummary;
  /** Flag indicating if combat has ended */
  isCombatEnded?: boolean;
}

/**
 * CombatLog Component
 *
 * Displays the ongoing combat log during combat and shows a summary when combat ends.
 * The summary includes the winner, combat results, and statistics like rounds played
 * and damage dealt/taken.
 *
 * @param props CombatLogProps
 * @returns JSX.Element
 */
export const CombatLog = ({ 
  entries,
  summary,
  isCombatEnded = false
}: CombatLogProps) => {
  const logRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLParagraphElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (logRef.current && !isCombatEnded) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'end',
      };
      if (lastEntryRef.current && lastEntryRef.current.scrollIntoView) { // Check if lastEntryRef.current exists and has scrollIntoView
        lastEntryRef.current.scrollIntoView(scrollOptions);
      }
    }
  }, [entries, isCombatEnded]);

  const getEntryClass = useCallback((type: string) => ({
    'hit': 'bg-green-100 text-green-800',
    'miss': 'bg-gray-100 text-gray-800',
    'critical': 'bg-yellow-100 text-yellow-800',
    'info': 'bg-blue-50 text-blue-800'
  }[type] || ''), []);

  // Validate and filter entries
  const validEntries = entries.filter(entry => {
    const isValid = entry && 
      typeof entry.text === 'string' && 
      typeof entry.timestamp === 'number' &&
      ['hit', 'miss', 'critical', 'info'].includes(entry.type);
  
    return isValid;
  });

  if (isCombatEnded && summary) {
    return (
      <div 
        className="combat-log max-h-48 overflow-y-auto p-4 space-y-4 border rounded-lg bg-white"
        role="log"
        aria-label="Combat summary"
        data-testid="combat-summary"
      >
        <h3 className={`font-bold text-lg ${summary.winner === 'player' ? 'text-green-600' : 'text-red-600'}`}>
          {summary.winner === 'player' ? 'Victory!' : 'Defeat'}
        </h3>
        <p className="text-gray-700">{summary.results}</p>
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p data-testid="combat-summary-rounds"><span className="font-medium">Rounds:</span> {summary.stats.rounds}</p>
          <p data-testid="combat-summary-damage-dealt"><span className="font-medium">Damage Dealt:</span> {summary.stats.damageDealt}</p>
          <p data-testid="combat-summary-damage-taken"><span className="font-medium">Damage Taken:</span> {summary.stats.damageTaken}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={logRef}
      className="combat-log max-h-48 overflow-y-auto p-2 border rounded-lg bg-white"
      role="log"
      aria-label="Combat log"
      data-testid="combat-log"
    >
      {validEntries.map((entry, index) => {
        // Generate a unique key combining timestamp and text hash
        const textHash = entry.text.split('').reduce((acc, char) => 
          ((acc << 5) - acc) + char.charCodeAt(0), 0);
        const key = `${entry.timestamp}-${textHash}-${index}`;
        
        const isLastEntry = index === validEntries.length - 1;
        
        return (
          <p 
            key={key}
            ref={isLastEntry ? lastEntryRef : undefined}
            className={`text-sm my-1 px-3 py-2 rounded-md transition-colors duration-200 ${getEntryClass(entry.type)}`}
            data-testid={`combat-log-entry-${index}`}
          >
            {cleanCombatLogEntry(entry.text)}
          </p>
        );
      })}
      {validEntries.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-2">
          Combat log is empty
        </p>
      )}
    </div>
  );
};
