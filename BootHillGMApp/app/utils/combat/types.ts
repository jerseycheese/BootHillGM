export interface CombatModifiers {
  speedMod: number;
  accuracyMod: number;
}

export interface WeaponSpeedCategory {
  type: 'verySlow' | 'slow' | 'belowAverage' | 'average' | 'fast' | 'veryFast';
  modifier: number;
}