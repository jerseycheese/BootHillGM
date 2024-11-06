/**
 * Boot Hill v2 Strength System
 * 
 * Handles:
 * - Base strength tracking
 * - Wound-based strength reduction
 * - Character defeat conditions
 * - Unconsciousness checks
 */
import { Character, Wound } from '../types/character';

/**
 * Constants representing the strength reduction effects of different wound severities.
 * These values are derived from the official Boot Hill v2 rules.
 */
export const WOUND_EFFECTS = {
  LIGHT: 3,
  SERIOUS: 7,
  MORTAL: Infinity
} as const;

/**
 * Calculates a character's current strength, accounting for wound penalties.
 * @param character The character whose strength is being calculated.
 * @returns The character's current strength.
 */
export const calculateCurrentStrength = (character: Character): number => {
  const totalStrengthReduction = character.wounds.reduce(
    (total: number, wound: Wound) => total + wound.strengthReduction, 
    0
  );
  return Math.max(0, character.attributes.baseStrength - totalStrengthReduction);
};

/**
 * Determines if a character is defeated based on Boot Hill v2 rules.
 * A character is defeated if they are unconscious, have a mortal wound, or their current strength is 0 or less.
 * @param character The character being checked for defeat.
 * @returns True if the character is defeated, false otherwise.
 */
export const isCharacterDefeated = (character: Character): boolean => {
  return character.isUnconscious || 
         character.wounds.some((w: Wound) => w.severity === 'mortal') ||
         calculateCurrentStrength(character) <= 0;
};
