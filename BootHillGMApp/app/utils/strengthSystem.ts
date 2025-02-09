/**
 * @fileoverview Strength System - Handles character strength calculations and wound effects
 * 
 * This system manages the calculation of a character's current strength based on their
 * base strength, wounds, and location-specific modifiers. It also handles defeat and
 * knockout conditions according to Boot Hill v2 rules.
 */

import { Character } from '../types/character';
import { Wound } from '../types/wound';
import { CombatState } from '../types/combat';
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
  const modifier = LOCATION_MODIFIERS[location]?.modifier || 0;
  return modifier;
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

  // Handle case where character or attributes might be undefined
  if (!character?.attributes?.baseStrength) {
    return 1; // Return minimum strength if character data is invalid
  }

  const totalStrengthReduction = (character.wounds || []).reduce(
    (total: number, wound: Wound) => {
      const locationModifier = getLocationModifier(wound.location);
      const reduction = total + wound.strengthReduction - locationModifier;
      return reduction;
    },
    0
  );

  const calculatedStrength = character.attributes.baseStrength - totalStrengthReduction;
  const finalStrength = allowZero ? calculatedStrength : Math.max(1, calculatedStrength);

  return finalStrength;
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
  const hasMortalWound = (character.wounds || []).some((w: Wound) => w.severity === 'mortal');
  
  return Boolean(character?.isUnconscious) || hasMortalWound || currentStrength <= 0;
};

/**
 * Determines if an attack will result in a knockout.
 * 
 * According to Boot Hill rules, a knockout occurs when:
 * - The damage would reduce the character's strength to exactly 0
 * - This is checked before applying location modifiers
 * - Values below 0 are considered defeats, not knockouts
 * 
 * @param currentStrength The character's current strength before damage
 * @param damage The amount of damage being dealt
 * @returns True if the attack will result in a knockout
 */
export const isKnockout = (currentStrength: number, damage: number): boolean => {
  const remainingStrength = currentStrength - damage;
  return remainingStrength === 0;
};

/**
 * Calculates the new strength value after taking damage.
 * 
 * This function:
 * - Subtracts damage from current strength
 * - Allows negative values for defeat validation
 * - Does not apply location modifiers (those are handled in calculateCurrentStrength)
 * 
 * @param currentStrength The character's current strength before damage
 * @param damage The amount of damage being dealt
 * @returns The new strength value after damage, can be negative
 */
export const calculateUpdatedStrength = (currentStrength: number, damage: number): number => {
  const newStrength = currentStrength - damage;
  return newStrength;
};

/**
 * Gets the combat-specific strength reduction for a character
 * @param {Character} character The character to check for combat effects
 * @param {CombatState} combatState The current combat state
 * @returns {number} The total strength reduction from combat effects
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCombatStrengthReduction = (character: Character, combatState: CombatState): number => {
  // TODO: Implement combat-specific modifiers based on character state and combat conditions
  // For now, return 0 until combat modifiers are defined in the combat system
  return 0;
};

/**
 * Gets a character's current strength value, accounting for both base calculations
 * and any combat-specific modifiers
 * @param character The character whose strength to calculate
 * @param combatState Optional combat state for combat-specific modifiers
 * @returns The character's current strength value
 */
export const getCharacterStrength = (character: Character, combatState?: CombatState): number => {
  const baseStrength = calculateCurrentStrength(character);
  if (combatState) {
    // Apply combat-specific modifiers
    const combatReduction = getCombatStrengthReduction(character, combatState);
    return Math.max(1, baseStrength - combatReduction);
  }
  return baseStrength;
};

/**
 * Validates that a strength value matches what would be calculated
 * @param strength The strength value to validate
 * @param character The character to check against
 * @param combatState Optional combat state for combat-specific modifiers
 * @returns True if the strength value is valid
 */
export const validateStrengthValue = (
  strength: number,
  character: Character,
  combatState?: CombatState
): boolean => {
  const calculated = getCharacterStrength(character, combatState);
  return Math.abs(strength - calculated) <= 0.01; // Allow small floating point differences
};
