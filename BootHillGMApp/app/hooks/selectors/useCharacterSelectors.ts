/**
 * Character-related state selector hooks
 * 
 * Contains selectors for accessing character state in a memoized way.
 */
import { Character } from '../../types/character';
import { Wound } from '../../types/wound';
import { createStateHook } from '../createStateHook';
import { createParameterizedHook } from '../createParameterizedHook';

/**
 * Returns the player character
 */
export const usePlayerCharacter = createStateHook<Character | null, [Character | null | undefined]>(
  (state) => state.character?.player ?? null,
  (state) => [state.character?.player]
);

/**
 * Returns the opponent character
 */
export const useOpponentCharacter = createStateHook<Character | null, [Character | null | undefined]>(
  (state) => state.character?.opponent ?? null,
  (state) => [state.character?.opponent]
);

/**
 * Returns the specified player character attribute
 */
export const usePlayerAttribute = createParameterizedHook<number, keyof Character['attributes'] | string>(
  (state, attributeName) => state.character?.player?.attributes?.[attributeName as keyof Character['attributes']] ?? 0
);

/**
 * Returns the player character's name
 */
export const usePlayerName = createStateHook<string | undefined, [string | undefined]>(
  (state) => state.character?.player?.name,
  (state) => [state.character?.player?.name]
);

/**
 * Returns the player character's strength attribute
 */
export const usePlayerStrength = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.strength ?? 0,
  (state) => [state.character?.player?.attributes?.strength]
);

/**
 * Returns the player character's base strength attribute
 */
export const usePlayerBaseStrength = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.baseStrength ?? 0,
  (state) => [state.character?.player?.attributes?.baseStrength]
);

/**
 * Returns the player character's speed attribute
 */
export const usePlayerSpeed = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.speed ?? 0,
  (state) => [state.character?.player?.attributes?.speed]
);

/**
 * Returns the player character's gun accuracy attribute
 */
export const usePlayerGunAccuracy = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.gunAccuracy ?? 0,
  (state) => [state.character?.player?.attributes?.gunAccuracy]
);

/**
 * Returns the player character's throwing accuracy attribute
 */
export const usePlayerThrowingAccuracy = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.throwingAccuracy ?? 0,
  (state) => [state.character?.player?.attributes?.throwingAccuracy]
);

/**
 * Returns the player character's bravery attribute
 */
export const usePlayerBravery = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.bravery ?? 0,
  (state) => [state.character?.player?.attributes?.bravery]
);

/**
 * Returns the player character's experience attribute
 */
export const usePlayerExperience = createStateHook<number, [number | undefined]>(
  (state) => state.character?.player?.attributes?.experience ?? 0,
  (state) => [state.character?.player?.attributes?.experience]
);

/**
 * Returns all player character attributes
 */
export const usePlayerAttributes = createStateHook<Record<string, number>, [Record<string, number> | undefined]>(
  (state) => state.character?.player?.attributes ?? { /* Intentionally empty */ },
  (state) => [state.character?.player?.attributes]
);

/**
 * Returns calculated player health (accounting for wounds)
 */
export const usePlayerHealth = createStateHook<number, [number | undefined, Wound[] | undefined]>(
  (state) => {
    const player = state.character?.player;
    if (!player) return 0;

    const baseHealth = player.attributes?.baseStrength ?? 0;
    const wounds = Array.isArray(player.wounds) ? player.wounds : [];

    // Calculate health by subtracting wound penalties
    const woundPenalty = wounds.reduce((total, wound) => total + Number(wound.severity ?? 0), 0);
    return Math.max(0, baseHealth - woundPenalty);
  },
  (state) => [state.character?.player?.attributes?.baseStrength, state.character?.player?.wounds]
);

/**
 * Returns the player character's wounds
 */
export const usePlayerWounds = createStateHook<Wound[], [Wound[] | undefined]>(
  (state) => state.character?.player?.wounds ?? [],
  (state) => [state.character?.player?.wounds]
);

/**
 * Returns whether the player character has any wounds
 */
export const useIsPlayerWounded = createStateHook<boolean, [Wound[] | undefined]>(
  (state) => {
    const wounds = state.character?.player?.wounds ?? [];
    return wounds.length > 0;
  },
  (state) => [state.character?.player?.wounds]
);

/**
 * Returns the opponent character's name
 */
export const useOpponentName = createStateHook<string | undefined, [string | undefined]>(
  (state) => state.character?.opponent?.name,
  (state) => [state.character?.opponent?.name]
);

/**
 * Returns the opponent character's strength attribute
 */
export const useOpponentStrength = createStateHook<number, [number | undefined]>(
  (state) => state.character?.opponent?.attributes?.strength ?? 0,
  (state) => [state.character?.opponent?.attributes?.strength]
);

/**
 * Returns calculated opponent health
 */
export const useOpponentHealth = createStateHook<number, [number | undefined, Wound[] | undefined]>(
  (state) => {
    const opponent = state.character?.opponent;
    if (!opponent) return 0;

    const baseHealth = opponent.attributes?.baseStrength ?? 0;
    const wounds = Array.isArray(opponent.wounds) ? opponent.wounds : [];
    
    const woundPenalty = wounds.reduce((total, wound) => total + Number(wound.severity ?? 0), 0);
    return Math.max(0, baseHealth - woundPenalty);
  },
  (state) => [state.character?.opponent?.attributes?.baseStrength, state.character?.opponent?.wounds]
);
