/**
 * @typedef {Object} ValidationResult
 * @property {number} value - The validated strength value
 * @property {boolean} wasAdjusted - Whether the value was modified
 * @property {string|null} reason - Reason for adjustment, if any
 */
export interface ValidationResult {
  value: number;
  wasAdjusted: boolean;
  reason: string | null;
}

/**
 * @typedef {Object} StrengthReductionResult
 * @property {number} newStrength - Updated strength value
 * @property {number} reduction - Actual reduction applied
 * @property {boolean} wasAdjusted - Whether validation adjusted the value
 */
export interface StrengthReductionResult {
  newStrength: number;
  reduction: number;
  wasAdjusted: boolean;
}