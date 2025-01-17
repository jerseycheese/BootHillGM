/**
 * Strength Calculation Utilities
 * 
 * Handles all strength-related calculations for combat participants
 */

import { CombatParticipant } from '../types/combat';
import { Character } from '../types/character';

/**
 * Calculates the reduced strength after applying wound penalties
 * @param participant The combat participant
 * @returns The current strength value after applying wound penalties
 */
export function calculateReducedStrength(participant: CombatParticipant): number {
  const isCharacter = (
    participant: CombatParticipant
  ): participant is Character => {
    return participant.hasOwnProperty('attributes');
  };

  const baseStrength = isCharacter(participant)
    ? participant.attributes.baseStrength
    : participant.strength;
  const woundPenalty = participant.wounds.reduce(
    (sum, wound) => sum + wound.strengthReduction,
    0
  );
  return Math.max(1, baseStrength - woundPenalty);
}

/**
 * Validates that strength values are within acceptable ranges
 * @param strength The strength value to validate
 * @returns true if strength is valid, false otherwise
 */
export function validateStrength(strength: number): boolean {
  return strength >= 1 && strength <= 20;
}

/**
 * Calculates the strength modifier for combat actions
 * @param strength The current strength value
 * @returns The combat modifier based on strength
 */
export function calculateStrengthModifier(strength: number): number {
  if (strength <= 3) return -2;
  if (strength <= 6) return -1;
  if (strength <= 12) return 0;
  if (strength <= 15) return 1;
  return 2;
}
