import { Character } from '../types/character';
import { Wound } from '../types/wound';

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
export const calculateCurrentStrength = (character: Character, allowZero: boolean = false): number => {
  const totalStrengthReduction = character.wounds.reduce(
    (total: number, wound: Wound) => total + wound.strengthReduction,
    0
  );
  const calculatedStrength = character.attributes.baseStrength - totalStrengthReduction;
  // Minimum strength is 1 unless checking defeat conditions
  return allowZero ? calculatedStrength : Math.max(1, calculatedStrength);
};

/**
 * Determines if a character is defeated based on Boot Hill v2 rules.
 * A character is defeated if they are unconscious, have a mortal wound, or their current strength is 0 or less.
 * @param character The character being checked for defeat.
 * @returns True if the character is defeated, false otherwise.
 */
export const isCharacterDefeated = (character: Character): boolean => {
  const currentStrength = calculateCurrentStrength(character, true);
  return character.isUnconscious ||
         character.wounds.some((w: Wound) => w.severity === 'mortal') ||
         currentStrength <= 0;
};

/**
 * Determines if an attack will result in a knockout
 * A knockout occurs when remaining strength would be reduced to 0
 */
export const isKnockout = (currentStrength: number, damage: number): boolean => {
  const remainingStrength = Math.max(0, currentStrength - damage);
  return remainingStrength === 0;
};

/**
 * Calculates new strength value after taking damage
 * Ensures strength never goes below 0
 */
export const calculateUpdatedStrength = (currentStrength: number, damage: number): number => {
  return Math.max(0, currentStrength - damage);
};
