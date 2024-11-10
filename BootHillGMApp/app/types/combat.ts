export interface LogEntry {
  text: string;
  type: 'info' | 'error' | 'success';
  timestamp: number;
}

export interface BrawlingState {
  round: number;
  playerModifier: number;
  opponentModifier: number;
  roundLog: LogEntry[];
}

export interface CombatState extends BrawlingState {
  isActive: boolean;
  winner: string | null;
  summary: string | null;
}
