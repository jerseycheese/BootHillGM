import { GameEngineAction } from '../types/gameActions';
import { CombatState, CombatTurn, CombatLogEntry } from '../types/state/combatState';
import { NarrativeAction, StoryProgressionData } from '../types/narrative.types';

/**
 * Type for SET_NARRATIVE action in the game reducer
 */
export type SetNarrativeAction = {
  type: 'SET_NARRATIVE';
  payload:
    | {
        text: string;
        storyProgression?: StoryProgressionData;
      }
    | string;
};

/**
 * Define a type for combat update payload to match CombatState structure
 */
export interface CombatUpdatePayload {
  isActive?: boolean;
  combatType?: 'brawling' | 'weapon' | null;
  rounds?: number;
  playerTurn?: boolean;
  playerCharacterId?: string;
  opponentCharacterId?: string;
  combatLog?: CombatLogEntry[];
  roundStartTime?: number;
  modifiers?: {
    player: number;
    opponent: number;
  };
  currentTurn?: CombatTurn | null | string;
  [key: string]: unknown;
}

/**
 * Union type for all possible actions in the game reducer
 */
export type GameReducerAction = 
  | GameEngineAction 
  | SetNarrativeAction
  | NarrativeAction;

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard to check if a normalized state has a character property
 */
export function hasCharacter(state: unknown): state is { character: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).character);
}

/**
 * Type guard to check if a normalized state has a combat property
 */
export function hasCombat(state: unknown): state is { combat: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).combat);
}

/**
 * Type guard to check if a normalized state has a journal property
 */
export function hasJournal(state: unknown): state is { journal: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).journal);
}

/**
 * Type guard to check if a normalized state has a narrative property
 */
export function hasNarrative(state: unknown): state is { narrative: Record<string, unknown> } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).narrative);
}

/**
 * Type guard to check if a combatState is present
 */
export function hasCombatState(state: unknown): state is { combatState: CombatState } {
  return isNonNullObject(state) && isNonNullObject((state as Record<string, unknown>).combatState);
}