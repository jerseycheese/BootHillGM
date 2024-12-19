import { Weapon } from '../../types/combat';

export const calculateRangeModifier = (weapon: Weapon, range: number): number => {
  const effectiveRange = weapon.modifiers.range;
  
  // Boot Hill v2 range brackets
  if (range <= effectiveRange * 0.25) return 5;  // Point blank bonus
  if (range <= effectiveRange * 0.5) return 0;   // Normal range
  if (range <= effectiveRange) return -10;       // Long range penalty
  if (range <= effectiveRange * 1.5) return -20; // Extended range severe penalty
  return -30; // Extreme range
};