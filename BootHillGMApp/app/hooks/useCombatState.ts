/**
 * Combat State Selector Hooks
 * 
 * This module provides selector hooks for accessing combat state data.
 */

import { CombatState, CombatLogEntry } from '../types/state/combatState';
import { CombatType } from '../types/combat';
import { createSelectorHook, createSlicePropertySelector } from './createSelectorHook';

// Define the turn type locally since it's not exported from combatState
type CombatTurn = 'player' | 'opponent';

/**
 * Hook that returns the entire combat state slice
 */
export const useCombatState = createSelectorHook<CombatState>(
  (state) => state.combat
);

/**
 * Hook that returns whether combat is active
 */
export const useCombatActive = createSlicePropertySelector<CombatState, boolean>(
  'combat',
  (combatState) => combatState.isActive
);

/**
 * Hook that returns the current combat type
 */
export const useCombatType = createSlicePropertySelector<CombatState, CombatType>(
  'combat',
  (combatState) => combatState.combatType
);

/**
 * Hook that returns the current round number
 */
export const useCombatRound = createSlicePropertySelector<CombatState, number>(
  'combat',
  (combatState) => combatState.rounds
);

/**
 * Hook that returns whether it's the player's turn
 */
export const useIsPlayerTurn = createSlicePropertySelector<CombatState, boolean>(
  'combat',
  (combatState) => combatState.playerTurn
);

/**
 * Hook that returns the combat log entries
 */
export const useCombatLog = createSlicePropertySelector<CombatState, CombatLogEntry[]>(
  'combat',
  (combatState) => combatState.combatLog || []
);

/**
 * Hook that returns the current turn
 */
export const useCurrentTurn = createSlicePropertySelector<CombatState, CombatTurn | null>(
  'combat',
  (combatState) => combatState.currentTurn as CombatTurn | null
);

/**
 * Hook that returns the player's combat modifier
 */
export const usePlayerCombatModifier = createSelectorHook<number>(
  (state) => state.combat.modifiers.player
);

/**
 * Hook that returns the opponent's combat modifier
 */
export const useOpponentCombatModifier = createSelectorHook<number>(
  (state) => state.combat.modifiers.opponent
);

/**
 * Hook that returns the total time spent in the current combat
 */
export const useCombatDuration = createSelectorHook<number>(
  (state) => state.combat.isActive ? Date.now() - state.combat.roundStartTime : 0
);
