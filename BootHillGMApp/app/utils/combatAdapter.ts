/**
 * Combat Adapter Utility
 * 
 * This module provides adapter functions to bridge the CombatState type from combat.ts (legacy)
 * with the CombatState type from state/combatState.ts (new slice-based architecture)
 */

import { CombatState as LegacyCombatState } from '../types/combat';
import { CombatState as SliceCombatState } from '../types/state/combatState';
import { LogEntry } from '../types/combat';
import { CombatLogEntry } from '../types/state/combatState';
import { CombatTurn } from '../types/state/combatState';

/**
 * Convert a LogEntry from the legacy format to a CombatLogEntry in the new format
 */
export function convertLogEntry(entry: LogEntry): CombatLogEntry {
  return {
    text: entry.text,
    timestamp: entry.timestamp,
    type: mapLogEntryType(entry.type),
    data: { 
      originalType: entry.type 
    }
  };
}

/**
 * Map the log entry type from legacy to new format
 */
function mapLogEntryType(type: 'hit' | 'miss' | 'critical' | 'info'): 'action' | 'result' | 'system' {
  switch (type) {
    case 'hit':
    case 'miss':
    case 'critical':
      return 'result';
    case 'info':
      return 'system';
    default:
      return 'action';
  }
}

/**
 * Convert a CombatState from the legacy format to the slice-based format
 */
export function legacyToSliceCombatState(legacy?: Partial<LegacyCombatState>): SliceCombatState {
  if (!legacy) {
    return {
      isActive: false,
      combatType: 'brawling',
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
      currentTurn: null
    };
  }

  // Convert combatLog if it exists
  const convertedLog = legacy.combatLog 
    ? legacy.combatLog.map(convertLogEntry) 
    : [];

  // Map currentTurn to appropriate format
  let currentTurn: CombatTurn | null = null;
  if (legacy.currentTurn) {
    if (typeof legacy.currentTurn === 'object') {
      const turnObj = legacy.currentTurn as Record<string, unknown>;
      currentTurn = {
        playerId: String(turnObj.playerId || ''),
        actions: Array.isArray(turnObj.actions) ? turnObj.actions.map(String) : []
      };
    }
  }

  // Get round value from appropriate source
  const roundValue = legacy.rounds || 
                   (legacy.brawling?.round ? Number(legacy.brawling.round) : 0) || 
                   (legacy.weapon?.round || 0);

  return {
    isActive: legacy.isActive ?? false,
    combatType: legacy.combatType ?? 'brawling',
    rounds: roundValue,
    playerTurn: true, // Default to player's turn when adapting
    playerCharacterId: legacy.brawling?.playerCharacterId ?? 
                       legacy.weapon?.playerCharacterId ?? 
                       '',
    opponentCharacterId: legacy.brawling?.opponentCharacterId ?? 
                         legacy.weapon?.opponentCharacterId ?? 
                         '',
    combatLog: convertedLog,
    roundStartTime: Date.now(),
    modifiers: {
      player: legacy.brawling?.playerModifier ?? 0,
      opponent: legacy.brawling?.opponentModifier ?? 0
    },
    currentTurn: currentTurn
  };
}

/**
 * Convert a CombatState from the slice-based format to the legacy format
 * This is helpful when working with code that expects the legacy format
 */
export function sliceToLegacyCombatState(slice: SliceCombatState): LegacyCombatState {
  // Handle potentially undefined slice to avoid errors
  if (!slice) {
    return {
      isActive: false,
      combatType: 'brawling',
      winner: null,
      participants: [],
      rounds: 0,
      combatLog: []
    };
  }
  
  // Safely access properties with default values
  const safeModifiers = slice.modifiers || { player: 0, opponent: 0 };
  
  // Convert CombatLogEntry array to LogEntry array
  const convertedLog: LogEntry[] = Array.isArray(slice.combatLog) 
    ? slice.combatLog.map(entry => ({
        text: entry.text || '',
        type: (entry.data?.originalType as 'hit' | 'miss' | 'critical' | 'info') || 'info',
        timestamp: entry.timestamp || Date.now()
      }))
    : [];

  return {
    isActive: slice.isActive || false,
    combatType: slice.combatType || 'brawling',
    winner: null, // Default to null since slice doesn't track this directly
    participants: [], // Legacy combat requires participants, but slice doesn't track them
    rounds: slice.rounds || 0,
    currentTurn: slice.playerTurn ? 'player' : 'opponent',
    combatLog: convertedLog,
    // Set either brawling or weapon state based on combatType
    ...(slice.combatType === 'brawling' ? {
      brawling: {
        round: slice.rounds > 0 ? (slice.rounds <= 2 ? slice.rounds as 1 | 2 : 2) : 1, // Convert to 1|2 union type
        playerModifier: safeModifiers.player || 0,
        opponentModifier: safeModifiers.opponent || 0,
        playerCharacterId: slice.playerCharacterId || '',
        opponentCharacterId: slice.opponentCharacterId || '',
        roundLog: convertedLog
      }
    } : {}),
    ...(slice.combatType === 'weapon' ? {
      weapon: {
        round: slice.rounds || 0,
        playerWeapon: null, // Slice doesn't track this
        opponentWeapon: null, // Slice doesn't track this
        currentRange: 0, // Slice doesn't track this
        playerCharacterId: slice.playerCharacterId || '',
        opponentCharacterId: slice.opponentCharacterId || '',
        roundLog: convertedLog
      }
    } : {})
  };
}

/**
 * Safely handles ensure combat state by adapting between the two types
 */
export function adaptEnsureCombatState(state?: Partial<SliceCombatState>): SliceCombatState {
  // Handle null/undefined case
  if (!state) {
    return {
      isActive: false,
      combatType: 'brawling',
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
      currentTurn: null
    };
  }

  // Create a complete state with defaults for missing properties
  return {
    isActive: state.isActive ?? false,
    combatType: state.combatType ?? 'brawling',
    rounds: state.rounds ?? 0,
    playerTurn: state.playerTurn ?? true,
    playerCharacterId: state.playerCharacterId ?? '',
    opponentCharacterId: state.opponentCharacterId ?? '',
    combatLog: state.combatLog ?? [],
    roundStartTime: state.roundStartTime ?? Date.now(),
    modifiers: {
      player: state.modifiers?.player ?? 0,
      opponent: state.modifiers?.opponent ?? 0
    },
    currentTurn: state.currentTurn ?? null
  };
}
