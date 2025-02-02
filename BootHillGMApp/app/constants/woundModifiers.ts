/**
 * @fileoverview Location-based wound modifier configuration
 * 
 * This module defines the strength modifiers and severity ranges for different wound locations.
 * Modifiers are applied in addition to base wound penalties to reflect the impact of hits
 * to different body parts.
 * 
 * Modifier values:
 * - Negative values increase the total strength reduction
 * - Head wounds (-2): Most severe impact on fighting ability
 * - Torso wounds (-1): Significant but less severe than head wounds
 * - Limb wounds (0): No additional penalty beyond base wound effects
 */

interface SeverityRange {
  min: number;
  max: number;
}

interface LocationConfig {
  modifier: number;
  severityRanges: {
    light: SeverityRange;
    moderate: SeverityRange;
    severe: SeverityRange;
    critical: SeverityRange;
  };
}

export const LOCATION_MODIFIERS: Record<string, LocationConfig> = {
  head: {
    modifier: -2,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  chest: {
    modifier: -1,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  abdomen: {
    modifier: -1,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  leftArm: {
    modifier: 0,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  rightArm: {
    modifier: 0,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  leftLeg: {
    modifier: 0,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
  rightLeg: {
    modifier: 0,
    severityRanges: {
      light: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      severe: { min: 7, max: 9 },
      critical: { min: 10, max: Infinity },
    },
  },
};
