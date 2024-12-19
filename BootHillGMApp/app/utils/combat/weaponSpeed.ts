import { Weapon } from '../../types/combat';
import { WeaponSpeedCategory } from './types';

export const WEAPON_SPEED_MODIFIERS: Record<WeaponSpeedCategory['type'], number> = {
  verySlow: -10,
  slow: -5,
  belowAverage: 0,
  average: 5,
  fast: 8,
  veryFast: 10
};

export const getWeaponSpeedModifier = (weapon: Weapon): number => {
  // Map weapon types to speed categories based on Boot Hill v2 rules
  const speedCategory = weapon.modifiers.speed >= 8 ? 'veryFast' :
                       weapon.modifiers.speed >= 5 ? 'fast' :
                       weapon.modifiers.speed >= 0 ? 'average' :
                       weapon.modifiers.speed >= -3 ? 'belowAverage' :
                       weapon.modifiers.speed >= -7 ? 'slow' : 'verySlow';
                       
  const baseModifier = WEAPON_SPEED_MODIFIERS[speedCategory];
  
  // Additional modifiers from Boot Hill v2
  let totalModifier = baseModifier;
  
  // Weapon-specific adjustments
  if (weapon.modifiers.reliability < 85) {
    totalModifier -= 2; // Less reliable weapons are slower to handle
  }
  
  if (weapon.ammunition !== undefined && weapon.ammunition === 0) {
    totalModifier -= 5; // Empty weapons are slower (need reload)
  }
  
  return totalModifier;
};