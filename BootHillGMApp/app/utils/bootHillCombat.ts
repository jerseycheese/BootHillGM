import { getWeaponSpeedModifier } from './combat/weaponSpeed';
import { calculateRangeModifier } from './combat/rangeModifier';
import { calculateBrawlingDamage } from './combat/brawlingDamage';
import { getBraveryModifiers } from './combat/braveryModifiers';
import { getExperienceModifier } from './combat/experienceModifiers';
import { determineWoundLocation, WoundResult } from './combat/woundDetermination';
import { getHitModifiers, CombatSituation } from './combat/hitModifiers';
import { resolveCombatRound, CombatResult } from './combat/combatResolver';
import { getFirstShotOrder } from './combat/firstShotOrder';

export {
  getWeaponSpeedModifier,
  calculateRangeModifier,
  calculateBrawlingDamage,
  getBraveryModifiers,
  getExperienceModifier,
  determineWoundLocation,
  getHitModifiers,
  resolveCombatRound,
  getFirstShotOrder,
};

export type {
  WoundResult,
  CombatSituation,
  CombatResult
}
