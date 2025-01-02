/**
 * Boot Hill v2 Brawling System
 * 
 * Implements authentic Boot Hill brawling mechanics:
 * - Two rounds per combat turn
 * - Punch and grapple options
 * - Location-based damage
 * - Strength reduction from wounds
 * - Combat modifiers based on previous actions
 */

import { rollDice } from './diceUtils';

/**
 * Represents the result of a brawling round.
 */
export type BrawlingResult = {
  /** The total dice roll, including modifiers. */
  roll: number;
  /** Description of the brawling result (e.g., "Miss", "Solid Hit"). */
  result: string;
  /** Damage inflicted in the round. */
  damage: number;
  /** Location of the hit. */
  location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";
  /** Modifier to apply to the next round. */
  nextRoundModifier: number;
};

/**
 * Represents a brawling table mapping dice rolls to results.
 */
export type BrawlingTable = {
  [key: number]: {
    result: string;
    damage: number;
    location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";
    nextRoundModifier: number;
  };
};

/**
 * Brawling table for punching attacks.
 */
export const PUNCHING_TABLE: BrawlingTable = {
  2: { result: 'Miss', damage: 0, location: 'head', nextRoundModifier: -2 },
  3: { result: 'Glancing Blow', damage: 1, location: 'leftArm', nextRoundModifier: -1 },
  4: { result: 'Solid Hit', damage: 2, location: 'chest', nextRoundModifier: 0 },
  5: { result: 'Strong Hit', damage: 3, location: 'head', nextRoundModifier: 1 },
  6: { result: 'Critical Hit', damage: 4, location: 'head', nextRoundModifier: 2 }
};

/**
 * Brawling table for grappling attacks.
 */
export const GRAPPLING_TABLE: BrawlingTable = {
  2: { result: 'Miss', damage: 0, location: 'chest', nextRoundModifier: -2 },
  3: { result: 'Weak Hold', damage: 1, location: 'leftArm', nextRoundModifier: -1 },
  4: { result: 'Firm Grip', damage: 2, location: 'chest', nextRoundModifier: 0 },
  5: { result: 'Strong Lock', damage: 3, location: 'leftLeg', nextRoundModifier: 1 },
  6: { result: 'Submission Hold', damage: 4, location: 'head', nextRoundModifier: 2 }
};

/**
 * Resolves a brawling round based on the provided modifier and attack type.
 * 
 * Implements Boot Hill v2 brawling rules:
 * - Rolls 1d6 with modifiers
 * - Clamps results between 2 and 6
 * - Uses separate tables for punching and grappling
 * - Applies modifiers before clamping to ensure proper minimums
 * 
 * @param modifier - Modifier to the dice roll (positive or negative)
 * @param isPunching - True for punching attack, false for grappling
 * @param forceRoll - Optional parameter to force a specific roll value (for testing)
 * @returns BrawlingResult containing roll outcome, damage, and location
 * @example
 * // Resolve a punching attack with +2 modifier
 * const result = resolveBrawlingRound(2, true);
 */
export const resolveBrawlingRound = (
  modifier: number, 
  isPunching: boolean,
  forceRoll?: number
): BrawlingResult => {
  // Get base roll (forced value for testing or random roll)
  const baseRoll = forceRoll !== undefined ? forceRoll : rollDice({ count: 1, sides: 6 });
  
  // Apply modifier and clamp result between 2 and 6
  // Note: Modifier is applied before clamping to ensure proper minimums
  const modifiedRoll = baseRoll + modifier;
  const roll = Math.max(2, Math.min(6, modifiedRoll));
    
  const table = isPunching ? PUNCHING_TABLE : GRAPPLING_TABLE;
  const result = table[roll];

  return {
    roll,
    ...result
  };
};
