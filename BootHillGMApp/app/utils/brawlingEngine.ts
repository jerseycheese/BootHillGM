import { BrawlingResult, PUNCHING_TABLE, GRAPPLING_TABLE } from './brawlingSystem';

interface BrawlingCalculation {
  roll: number;
  modifier: number;
  isPunching: boolean;
}

export class BrawlingEngine {
  /**
   * Calculates the outcome of a brawling action (punch or grapple)
   * Uses Boot Hill v2 rules for determining hits, damage, and effects
   * Applies modifiers and ensures results stay within valid ranges
   */
  static calculateBrawlingResult(params: BrawlingCalculation): BrawlingResult {
    const { roll, modifier, isPunching } = params;
    const table = isPunching ? PUNCHING_TABLE : GRAPPLING_TABLE;
    
    // Calculate adjusted roll with modifier
    const adjustedRoll = Math.max(2, Math.min(6, roll + modifier));
    const result = table[adjustedRoll];

    if (!result) {
      // Fallback for invalid results
      return {
        roll: adjustedRoll,
        result: 'Miss',
        damage: 0,
        location: 'head',
        nextRoundModifier: -2
      };
    }

    return {
      roll: adjustedRoll,
      ...result
    };
  }

  /**
   * Creates a standardized combat message showing the action and its results
   * Formats: "[Attacker] [action] with [result] (Roll: X) dealing Y damage to [location]"
   */
  static formatCombatMessage(
    attacker: string,
    result: BrawlingResult,
    isPunching: boolean
  ): string {
    const action = isPunching ? 'punches' : 'grapples';
    return `${attacker} ${action} with ${result.result} (Roll: ${result.roll}) dealing ${result.damage} damage to ${result.location}`;
  }

  /**
   * Determines if an attack will result in a knockout
   * A knockout occurs when remaining strength would be reduced to 0
   */
  static isKnockout(currentStrength: number, damage: number): boolean {
    const remainingStrength = Math.max(0, currentStrength - damage);
    return remainingStrength === 0;
  }

  /**
   * Calculates new strength value after taking damage
   * Ensures strength never goes below 0
   */
  static calculateUpdatedStrength(currentStrength: number, damage: number): number {
    return Math.max(0, currentStrength - damage);
  }
}
