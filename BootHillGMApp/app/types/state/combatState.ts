import { CombatType } from '../combat';

/**
 * Combat log entry type
 */
export interface CombatLogEntry {
  text: string;
  timestamp: number;
  type?: 'action' | 'result' | 'system';
  data?: Record<string, unknown>;
}

/**
 * Combat turn interface
 */
export interface CombatTurn {
  playerId: string;
  actions: string[];
  [key: string]: unknown;
}

/**
 * Combat state slice that manages all combat-related data
 */
export interface CombatState {
  isActive: boolean;
  combatType: CombatType;
  rounds: number;          // Standard property name aligned with other code
  playerTurn: boolean;
  playerCharacterId: string;
  opponentCharacterId: string;
  combatLog: CombatLogEntry[];
  roundStartTime: number;
  modifiers: {
    player: number;
    opponent: number;
  };
  currentTurn: CombatTurn | null;
}

/**
 * Initial state for the combat slice
 */
export const initialCombatState: CombatState = {
  isActive: false,
  combatType: 'brawling',
  rounds: 0,                // Standardized on rounds instead of currentRound
  playerTurn: true,
  playerCharacterId: '',
  opponentCharacterId: '',
  combatLog: [],
  roundStartTime: 0,
  modifiers: {
    player: 0,
    opponent: 0
  },
  currentTurn: null
};