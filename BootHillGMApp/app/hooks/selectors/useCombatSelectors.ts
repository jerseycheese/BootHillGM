/**
 * Combat-related state selector hooks
 * 
 * Contains selectors for accessing combat state in a memoized way.
 */
import { CombatType } from '../../types/combat';
import { CombatLogEntry } from '../../types/state/combatState';
import { createStateHook } from '../createStateHook';

/**
 * Returns whether combat is active
 */
export const useCombatActive = createStateHook<boolean, [boolean | undefined]>(
  (state) => state.combat?.isActive ?? false,
  (state) => [state.combat?.isActive]
);

/**
 * Returns the current combat round
 */
export const useCombatRound = createStateHook<number, [number | undefined]>(
  (state) => state.combat?.rounds ?? 0,
  (state) => [state.combat?.rounds]
);

/**
 * Returns whether it's the player's turn
 */
export const usePlayerTurn = createStateHook<boolean, [boolean | undefined]>(
  (state) => state.combat?.playerTurn ?? true,
  (state) => [state.combat?.playerTurn]
);

/**
 * Returns the combat type (brawling, weapon, etc.)
 */
export const useCombatType = createStateHook<CombatType | null, [CombatType | undefined]>(
  (state) => state.combat?.combatType ?? null,
  (state) => [state.combat?.combatType]
);

/**
 * Returns all combat log entries
 */
export const useCombatLog = createStateHook<CombatLogEntry[], [CombatLogEntry[] | undefined]>(
  (state) => state.combat?.combatLog ?? [],
  (state) => [state.combat?.combatLog]
);

/**
 * Returns the most recent combat log entry
 * NOTE: Use both function names for backwards compatibility 
 */
export const useLastCombatLogEntry = createStateHook<CombatLogEntry | undefined, [CombatLogEntry[] | undefined]>(
  (state) => {
    const log = state.combat?.combatLog ?? [];
    return log.length > 0 ? log[log.length - 1] : undefined;
  },
  (state) => [state.combat?.combatLog]
);

// Alias for backward compatibility
export const useLatestCombatLogEntry = useLastCombatLogEntry;

/**
 * Returns the combat modifiers for both player and opponent
 */
export const useCombatModifiers = createStateHook<
  { player: number; opponent: number }, 
  [{ player: number; opponent: number } | undefined]
>(
  (state) => state.combat?.modifiers ?? { player: 0, opponent: 0 },
  (state) => [state.combat?.modifiers]
);

/**
 * Returns the player's combat modifier
 */
export const usePlayerCombatModifier = createStateHook<number, [number | undefined]>(
  (state) => state.combat?.modifiers?.player ?? 0,
  (state) => [state.combat?.modifiers?.player]
);

/**
 * Returns the opponent's combat modifier
 */
export const useOpponentCombatModifier = createStateHook<number, [number | undefined]>(
  (state) => state.combat?.modifiers?.opponent ?? 0,
  (state) => [state.combat?.modifiers?.opponent]
);

/**
 * Returns the ID of the player character in combat
 */
export const usePlayerCombatId = createStateHook<string, [string | undefined]>(
  (state) => state.combat?.playerCharacterId ?? '',
  (state) => [state.combat?.playerCharacterId]
);

/**
 * Returns the ID of the opponent character in combat
 */
export const useOpponentCombatId = createStateHook<string, [string | undefined]>(
  (state) => state.combat?.opponentCharacterId ?? '',
  (state) => [state.combat?.opponentCharacterId]
);

/**
 * Returns the round start time
 */
export const useRoundStartTime = createStateHook<number, [number | undefined]>(
  (state) => state.combat?.roundStartTime ?? 0,
  (state) => [state.combat?.roundStartTime]
);

/**
 * Returns time elapsed in current combat round
 */
export const useRoundElapsedTime = createStateHook<number, [number | undefined]>(
  (state) => {
    const startTime = state.combat?.roundStartTime ?? 0;
    if (startTime === 0) return 0;
    
    return Date.now() - startTime;
  },
  (state) => [state.combat?.roundStartTime]
);

/**
 * Returns whether the current round has time remaining
 * 
 * This is based on whether roundStartTime is set and combat is active
 */
export const useHasRoundTimeRemaining = createStateHook<boolean, [number | undefined, boolean | undefined]>(
  (state) => {
    const startTime = state.combat?.roundStartTime ?? 0;
    const isActive = state.combat?.isActive ?? false;
    
    // If combat is active and there's a round start time, then there's time remaining
    return isActive && startTime > 0;
  },
  (state) => [state.combat?.roundStartTime, state.combat?.isActive]
);
