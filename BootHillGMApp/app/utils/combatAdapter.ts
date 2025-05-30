// BootHillGMApp/app/utils/combatAdapter.ts (Reordered)
import { CombatState as LegacyCombatState, LogEntry } from '../types/combat';
import { CombatState as SliceCombatState, CombatLogEntry } from '../types/state/combatState';

/**
 * Map the log entry type from legacy to new format
 */
function mapLogEntryType(
  type: 'hit' | 'miss' | 'critical' | 'info'
): 'hit' | 'miss' | 'critical' | 'info' | 'system' | 'action' | 'result' {
  // Keep the original type if it matches the new format
  if (type === 'hit' || type === 'miss' || type === 'critical' || type === 'info') {
    return type;
  }

  // This should never happen, but provide a fallback
  return 'info';
}

/**
 * Convert a LogEntry from the legacy format to a CombatLogEntry in the new format
 */
export function convertLogEntry(entry: LogEntry): CombatLogEntry {
  return {
    text: entry.text,
    timestamp: entry.timestamp,
    type: mapLogEntryType(entry.type), // Now defined above
    data: {
      originalType: entry.type
    }
  };
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
    ? legacy.combatLog.map(convertLogEntry) // Uses convertLogEntry
    : [];

  // Map currentTurn to appropriate format
  let currentTurn: 'player' | 'opponent' | null = null;
  if (legacy.currentTurn) {
    if (typeof legacy.currentTurn === 'string') {
      currentTurn = legacy.currentTurn as 'player' | 'opponent';
    } else if (typeof legacy.currentTurn === 'object') {
      // We'll use the original string type for currentTurn to match the CombatState interface
      currentTurn = 'player'; // Default to player
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
        // Convert back to the legacy LogEntry type
        type: (entry.data?.originalType as 'hit' | 'miss' | 'critical' | 'info') ||
              (entry.type === 'system' || entry.type === 'action' || entry.type === 'result' ? 'info' : entry.type),
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
    } : { /* Intentionally empty */ }),
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
    } : { /* Intentionally empty */ })
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
