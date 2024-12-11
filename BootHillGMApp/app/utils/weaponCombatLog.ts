import { WeaponCombatState, LogEntry } from '../types/combat';

export const addLogEntry = (
  state: WeaponCombatState,
  entry: LogEntry
): WeaponCombatState => ({
  ...state,
  roundLog: [...state.roundLog, entry]
});

export const createCombatSummary = (
  winner: 'player' | 'opponent',
  opponentName: string
): string => {
  return winner === 'player' 
    ? `You defeat ${opponentName} with a well-placed shot!`
    : `${opponentName} defeats you with a deadly shot!`;
};
