/**
 * Strength Calculation Utilities
 * 
 * Handles all strength-related calculations for combat participants
 */

import { validateStrength, MIN_STRENGTH } from './combat/strengthUtils';
import { CombatParticipant } from '../types/combat';
import { Character } from '../types/character';
import { StrengthReductionResult } from '../types/interfaces';

/**
 * Calculates new strength after damage
 * @param {number} currentStrength - Current strength value
 * @param {number} damage - Damage amount
 * @returns {StrengthReductionResult} New strength details
 */
export function calculateStrengthReduction(
  currentStrength: number,
  damage: number
): StrengthReductionResult {

  // Clamp damage to minimum 0
  const effectiveDamage = Math.max(0, damage);
  const rawNewStrength = currentStrength - effectiveDamage;
  const validated = validateStrength(rawNewStrength);

  // Special case: If we're exactly at MIN_STRENGTH, consider it adjusted
  const isExactlyMin = validated.value === MIN_STRENGTH &&
    rawNewStrength <= MIN_STRENGTH;

  return {
    newStrength: validated.value,
    reduction: currentStrength - validated.value,
    wasAdjusted: validated.wasAdjusted || isExactlyMin
  };
}

/**
 * Calculates the reduced strength after applying wound penalties
 * @param participant The combat participant
 * @returns The current strength value after applying wound penalties
 */
export function calculateReducedStrength(
  participant: CombatParticipant
): number {
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
