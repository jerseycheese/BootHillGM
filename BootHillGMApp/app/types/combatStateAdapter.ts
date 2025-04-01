/**
 * This adapter file helps bridge the gap between our two different CombatState interfaces:
 * - CombatState from '../types/combat' which uses LogEntry
 * - CombatState from '../types/state/combatState' which uses CombatLogEntry
 */

import { CombatState as CombatStateFromCombat, LogEntry, CombatParticipant, BrawlingState } from './combat';
import { CombatState as CombatStateFromState, CombatLogEntry } from './state/combatState';
import { Character } from './character';
import { GameEngineAction } from './gameActions';

/**
 * UniversalCombatState combines properties from both CombatState interfaces
 * to provide a type that's compatible with both
 */
export interface UniversalCombatState {
  // Common properties from both interfaces
  isActive: boolean;
  combatType: 'brawling' | 'weapon' | null;
  
  // Properties specific to CombatStateFromCombat
  winner?: string | null;
  brawling?: unknown;
  weapon?: unknown;
  participants?: CombatParticipant[];
  rounds?: number;
  currentTurn?: 'player' | 'opponent';
  combatLog?: LogEntry[];
  summary?: {
    winner: 'player' | 'opponent';
    results: string;
    stats: {
      rounds: number;
      damageDealt: number;
      damageTaken: number;
    }
  };
  
  // Properties specific to CombatStateFromState
  currentRound?: number; // Added for backward compatibility
  playerTurn?: boolean;
  playerCharacterId?: string;
  opponentCharacterId?: string;
  roundStartTime?: number;
  modifiers?: {
    player: number;
    opponent: number;
  };
}

/**
 * Interface for component props that need to initiate combat
 */
export interface CombatInitiator {
  // Combat core functions
  initiateCombat: (opponent: Character, combatState?: UniversalCombatState | undefined) => void;
  executeCombatRound: () => void;
  handleCombatAction: () => void;
  handlePlayerHealthChange: (characterId: string, newHealth: number) => void;
  
  // Player/character management
  onEquipWeapon: (itemId: string) => void;
  getCurrentOpponent: () => Character | null;
  opponent: Character | null;
  
  // State management
  isCombatActive: boolean;
  dispatch: (action: GameEngineAction) => void;
  
  // Additional properties for hooks
  isLoading?: boolean;
  error?: string | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleDebug?: (command: string) => void;
  handleSave?: () => void;
  handleLoad?: () => void;
  
  // Allow for additional unknown properties
  [key: string]: unknown;
}

/**
 * Convert a LogEntry to a CombatLogEntry to bridge between the two types
 */
export function convertLogEntry(entry: LogEntry): CombatLogEntry {
  return {
    text: entry.text,
    timestamp: entry.timestamp,
    type: mapLogType(entry.type),
    data: { originalType: entry.type }
  };
}

/**
 * Convert a CombatLogEntry to a LogEntry to bridge between the two types
 */
export function convertCombatLogEntry(entry: CombatLogEntry): LogEntry {
  return {
    text: entry.text,
    timestamp: entry.timestamp,
    // Default to 'info' if we can't map the type
    type: mapCombatLogType(entry.type) || 'info'
  };
}

/**
 * Map LogEntry type to CombatLogEntry type
 */
function mapLogType(type: 'hit' | 'miss' | 'critical' | 'info'): 'action' | 'result' | 'system' {
  switch (type) {
    case 'hit':
    case 'critical':
      return 'result';
    case 'miss':
      return 'result';
    case 'info':
      return 'system';
    default:
      return 'system';
  }
}

/**
 * Map CombatLogEntry type to LogEntry type
 */
function mapCombatLogType(type?: 'action' | 'result' | 'system' | 'critical' | 'info' | 'hit' | 'miss'): 'hit' | 'miss' | 'critical' | 'info' | undefined {
  switch (type) {
    case 'action':
      return 'info';
    case 'result':
      return 'hit'; // Default to hit, could be miss but we're simplifying
    case 'system':
      return 'info';
    case 'critical':
      return 'critical';
    case 'hit':
      return 'hit';
    case 'miss':
      return 'miss';
    case 'info':
      return 'info';
    default:
      return undefined;
  }
}

/**
 * Adapter function to convert from combat.ts CombatState to state/combatState.ts CombatState
 */
export function adaptCombatToCombatState(state: Partial<CombatStateFromCombat>): Partial<CombatStateFromState> {
  // Extract playerCharacterId and opponentCharacterId from brawling or weapon state
  const playerCharacterId = state.brawling?.playerCharacterId || state.weapon?.playerCharacterId || '';
  const opponentCharacterId = state.brawling?.opponentCharacterId || state.weapon?.opponentCharacterId || '';
  
  return {
    isActive: state.isActive,
    combatType: state.combatType,
    rounds: state.rounds || 0,
    playerTurn: state.currentTurn === 'player',
    playerCharacterId: playerCharacterId,
    opponentCharacterId: opponentCharacterId,
    combatLog: state.combatLog?.map(convertLogEntry) || [],
    roundStartTime: Date.now(),
    modifiers: {
      player: state.brawling?.playerModifier || 0,
      opponent: state.brawling?.opponentModifier || 0
    }
  };
}

/**
 * Adapter function to convert from state/combatState.ts CombatState to combat.ts CombatState
 */
export function adaptCombatStateToCombat(state: Partial<CombatStateFromState>): Partial<CombatStateFromCombat> {
  // Map currentRound to rounds if it exists (for compatibility)
  const rounds = state.rounds || 0;
  
  // Create a brawling state with required properties
  // Note: BrawlingState (not Partial) means all properties must be defined
  const brawlingState: BrawlingState = {
    playerCharacterId: state.playerCharacterId || '',
    opponentCharacterId: state.opponentCharacterId || '',
    round: 1, // Explicitly set to 1, not undefined
    playerModifier: state.modifiers?.player || 0,
    opponentModifier: state.modifiers?.opponent || 0,
    roundLog: [] // Always provide an empty array, not undefined
  };

  return {
    isActive: state.isActive,
    combatType: state.combatType,
    rounds: rounds,
    currentTurn: state.playerTurn ? 'player' : 'opponent',
    combatLog: state.combatLog?.map(convertCombatLogEntry) || [],
    participants: [],
    winner: null,
    brawling: brawlingState
  };
}
