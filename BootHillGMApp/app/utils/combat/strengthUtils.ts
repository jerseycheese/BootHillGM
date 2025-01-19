import { ValidationResult } from '../../types/interfaces';

export const MAX_STRENGTH = 100;
export const MIN_STRENGTH = 1;

/**
 * Validates and normalizes strength values
 * @param {number} value - Raw strength value to validate.
 * @returns {ValidationResult} Validated result with metadata
 */
export function validateStrength(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return {
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'non-finite-value'
    };
  }

  if (value < MIN_STRENGTH) {
    return {
      value: MIN_STRENGTH,
      wasAdjusted: true,
      reason: 'below-minimum'
    };
  }

  if (value > MAX_STRENGTH) {
    return {
      value: MAX_STRENGTH,
      wasAdjusted: true,
      reason: 'above-maximum'
    };
  }

  return {
    value,
    wasAdjusted: false,
    reason: null
  };
}