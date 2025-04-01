import { CombatParticipant, CombatType } from "../combat";

/**
 * Represents a combat log entry.
 */
export interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info' | 'system' | 'action' | 'result';
  timestamp: number;
  data?: {
    originalType?: string;
    [key: string]: unknown;
  };
}

/**
 * Defines a turn in combat including who is acting and available actions
 */
export interface CombatTurn {
  playerId: string;
  actions: string[];
}

/**
 * Interface for the combat state.
 */
export interface CombatState {
  rounds: number;
  isActive: boolean;
  combatType: CombatType;
  playerTurn: boolean;
  playerCharacterId: string;
  opponentCharacterId: string;
  roundStartTime: number;
  combatLog?: CombatLogEntry[];
  modifiers: {
    player: number;
    opponent: number;
  };
  currentTurn: 'player' | 'opponent' | null;
  winner?: string | null;
  participants?: CombatParticipant[];
}

/**
 * Initial state for the combat slice
 */
export const initialCombatState: CombatState = {
  isActive: false,
  combatType: 'brawling', // Default combat type
  rounds: 0,
  playerTurn: true,
  playerCharacterId: '',
  opponentCharacterId: '',
  combatLog: [],
  roundStartTime: 0,
  modifiers: {
    player: 0,
    opponent: 0
  },
  currentTurn: null,
  winner: null,
  participants: []
};