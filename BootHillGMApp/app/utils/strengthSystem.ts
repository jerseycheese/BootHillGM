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
  const modifier = LOCATION_MODIFIERS[location]?.modifier || 0;
  return modifier;
};

/**
 * Calculates a character's current strength, accounting for wound penalties and location modifiers.
 * 
 * The calculation follows these steps:
 * 1. Start with the character's *current* strength (not base strength)
 * 2. For each wound:
 *    - Calculate the strength reduction based on wound damage and location
 *    - Apply the location-specific modifier (negative modifiers increase reduction)
 * 3. Ensure strength doesn't fall below 1 unless checking defeat conditions
 *
 * @param character The character whose strength is being calculated
 * @param allowZero If true, allows strength to go below 1 (used for defeat checks)
 * @returns The character's current strength value
 */
export const getCharacterStrength = (
  character: Character,
  allowZero: boolean = false
): number => {
  // Handle case where character or attributes might be undefined
  if (!character?.attributes?.strength) {
    return 1; // Return minimum strength if character data is invalid
  }

  // Start with the *current* strength, not base strength
  const currentStrength = character.attributes.strength;

  const totalStrengthReduction = (character.wounds || []).reduce(
    (total: number, wound: Wound) => {
      const locationModifier = getLocationModifier(wound.location);
      // Calculate reduction for this wound and add to total
      // Negative modifiers increase damage, so subtract the modifier
      const woundReduction = wound.strengthReduction - locationModifier;
      return total + woundReduction;
    },
    0
  );

  // Calculate final strength by subtracting total reduction from current strength
  const calculatedStrength = currentStrength - totalStrengthReduction;
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
  const currentStrength = getCharacterStrength(character, true);
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
 * Interface for tracking strength changes
 */
interface StrengthChange {
    previousValue: number;
    newValue: number;
    reason: string; // e.g., 'damage', 'healing', 'adjustment'
    timestamp: Date;
}

/**
 * Interface for a character's strength history
 */
export interface StrengthHistory {
    changes: StrengthChange[];
    baseStrength: number;
}

/**
 * Validates a proposed strength change.
 * 
 * Ensures that:
 * - New strength never exceeds base strength.
 * - New strength never exceeds current strength (unless it's a healing scenario, not implemented yet).
 * - Strength stays within the valid range (0 to baseStrength).
 * 
 * @param currentStrength The character's current strength.
 * @param newStrength The proposed new strength value.
 * @param baseStrength The character's base strength.
 * @returns True if the change is valid, false otherwise.
 */
function validateStrengthChange(
    currentStrength: number,
    newStrength: number,
    baseStrength: number
): boolean {
    // For now, we only allow strength to decrease or stay the same.
    if (newStrength > currentStrength) {
        return false;
    }
    if (newStrength > baseStrength) {
        return false;
    }
    if (newStrength < 0) {
        return false;
    }
    return true;
}

/**
 * Calculates the new strength value after taking damage, and logs the change.
 * 
 * This function:
 * - Subtracts damage from current strength
 * - Prevents strength from going below 0
 * - Validates the change to prevent increases
 * - Logs the change to the character's strength history
 * 
 * @param character The character taking damage
 * @param damage The amount of damage being dealt
 * @returns An object containing the new strength and updated strength history
 */
export const calculateUpdatedStrength = (character: Character, damage: number): { newStrength: number; updatedHistory: StrengthHistory } => {
  const currentStrength = character.attributes.strength;
  let newStrength = currentStrength - damage;

  // Ensure strength doesn't go below 0
  newStrength = Math.max(0, newStrength);

  // Validate the change
  if (!validateStrengthChange(currentStrength, newStrength, character.attributes.baseStrength)) {
    // In a real application, we might throw an error or log this differently.
    console.warn("Invalid strength change prevented. Returning current strength.");
    return { newStrength: currentStrength, updatedHistory: character.strengthHistory! };
  }

  let updatedHistory: StrengthHistory;

  // Log the change to strength history
  if (character.strengthHistory) {
      const newChange: StrengthChange = {
          previousValue: currentStrength,
          newValue: newStrength,
          reason: 'damage', // Could be more specific (e.g., 'brawling damage', 'weapon damage')
          timestamp: new Date(),
      };
    updatedHistory = {
      ...character.strengthHistory,
      changes: [...character.strengthHistory.changes, newChange],
    };
  } else {
    // Initialize strength history if it doesn't exist
    updatedHistory = {
      baseStrength: character.attributes.baseStrength,
      changes: [
        {
          previousValue: character.attributes.baseStrength, // Use baseStrength for initial value
          newValue: newStrength,
          reason: 'damage',
          timestamp: new Date(),
        },
      ],
    };
  }
  return { newStrength, updatedHistory };
};

/**
 * Validates that a strength value matches what would be calculated
 * @param strength The strength value to validate
 * @param character The character to check against
 * @returns True if the strength value is valid
 */
export const validateStrengthValue = (
  strength: number,
  character: Character,
): boolean => {
  const calculated = getCharacterStrength(character);
  return Math.abs(strength - calculated) <= 0.01; // Allow small floating point differences
};
