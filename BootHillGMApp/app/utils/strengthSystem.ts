/**
 * @fileoverview Strength System - Handles character strength calculations and wound effects
 * 
 * This system manages the calculation of a character's current strength based on their
 * base strength, wounds, and location-specific modifiers. It also handles defeat and
 * knockout conditions according to Boot Hill v2 rules.
 */

import { Character } from '../types/character';
import { Wound } from '../types/wound';
import { LOCATION_MODIFIERS } from '../constants/woundModifiers';

/**
 * Constants for wound severity effects on strength
 */
export const WOUND_EFFECTS = {
  LIGHT: 3,    // Light wounds reduce strength by 3
  SERIOUS: 7,  // Serious wounds reduce strength by 7
  MORTAL: Infinity // Mortal wounds are automatically fatal
} as const;

/**
 * Gets the strength modifier for a given wound location
 * Negative modifiers increase the total strength reduction
 * @param location The location of the wound
 * @returns The strength modifier for that location
 */
const getLocationModifier = (location: Wound['location']): number => {
  return LOCATION_MODIFIERS[location]?.modifier || 0;
};

/**
 * Calculates a character's current strength, accounting for wound penalties and location modifiers.
 * 
 * The calculation follows these steps:
 * 1. Start with the character's base strength
 * 2. For each wound:
 *    - Apply the wound's strength reduction
 *    - Apply the location-specific modifier (negative modifiers increase reduction)
 * 3. Ensure strength doesn't fall below 1 unless checking defeat conditions
 * 
 * @param character The character whose strength is being calculated
 * @param allowZero If true, allows strength to go below 1 (used for defeat checks)
 * @returns The character's current strength value
 */
export const calculateCurrentStrength = (character: Character, allowZero: boolean = false): number => {
  const totalStrengthReduction = character.wounds.reduce(
    (total: number, wound: Wound) => {
      const locationModifier = getLocationModifier(wound.location);
      // Location modifiers are negative numbers that should increase the total reduction
      return total + wound.strengthReduction - locationModifier; // Subtracting a negative = adding
    },
    0
  );
  const calculatedStrength = character.attributes.baseStrength - totalStrengthReduction;
  // Minimum strength is 1 unless checking defeat conditions
  return allowZero ? calculatedStrength : Math.max(1, calculatedStrength);
};

/**
 * Determines if a character is defeated based on Boot Hill v2 rules.
 * 
 * A character is considered defeated if any of these conditions are met:
 * - They are unconscious
 * - They have received a mortal wound
 * - Their current strength is 0 or less
 * 
 * @param character The character being checked for defeat
 * @returns True if the character is defeated, false otherwise
 */
export const isCharacterDefeated = (character: Character): boolean => {
  const currentStrength = calculateCurrentStrength(character, true);
  return character.isUnconscious ||
         character.wounds.some((w: Wound) => w.severity === 'mortal') ||
         currentStrength <= 0;
};

/**
 * Determines if an attack will result in a knockout.
 * 
 * According to Boot Hill rules, a knockout occurs when:
 * - The damage would reduce the character's strength to exactly 0
 * - This is checked before applying location modifiers
 * 
 * @param currentStrength The character's current strength before damage
 * @param damage The amount of damage being dealt
 * @returns True if the attack will result in a knockout
 */
export const isKnockout = (currentStrength: number, damage: number): boolean => {
  const remainingStrength = Math.max(0, currentStrength - damage);
  return remainingStrength === 0;
};

/**
 * Calculates the new strength value after taking damage.
 * 
 * This function:
 * - Subtracts damage from current strength
 * - Ensures the result never goes below 0
 * - Does not apply location modifiers (those are handled in calculateCurrentStrength)
 * 
 * @param currentStrength The character's current strength before damage
 * @param damage The amount of damage being dealt
 * @returns The new strength value after damage
 */
export const calculateUpdatedStrength = (currentStrength: number, damage: number): number => {
  return Math.max(0, currentStrength - damage);
};
