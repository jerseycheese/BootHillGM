import { Character } from '../types/character';
import { WeaponCombatAction, WeaponCombatResult, Weapon, parseWeaponDamage } from '../types/combat'; // Combined imports
import { calculateHitChance, isCritical } from './combatRules';
import { calculateRangeModifier, getWeaponSpeedModifier } from './bootHillCombat';
import { WOUND_EFFECTS } from './strengthSystem';
import { resolveAimAction } from './weaponCombatAim';
import { resolveMoveAction } from './weaponCombatMove';
import { resolveReloadAction } from './weaponCombatReload';
import { MALFUNCTION_MESSAGE, HIT_MESSAGE, MISS_MESSAGE } from './weaponCombatMessages';

interface ResolveWeaponActionParams {
  action: WeaponCombatAction;
  attacker: Character;
  defender: Character;
  weapon: Weapon;
  currentRange: number;
  aimBonus: number;
  debugMode?: boolean;
}

const calculateHitChanceAndRoll = (
  attacker: Character,
  weapon: Weapon,
  totalBonus: number,
  debugMode: boolean
): { hit: boolean; critical: boolean; roll: number; modifiedRoll: number; targetNumber: number } => {
  const baseChance = calculateHitChance(attacker);
  const roll = debugMode ? 1 : Math.floor(Math.random() * 100) + 1;
  const modifiedRoll = roll - totalBonus;
  const targetNumber = baseChance;
  const hit = modifiedRoll <= targetNumber;
  const critical = isCritical(roll);

  return { hit, critical, roll, modifiedRoll, targetNumber };
};

const calculateDamage = (weapon: Weapon, critical: boolean): number => {
  let damage = parseWeaponDamage(weapon.modifiers.damage);
  if (critical) damage *= 2;
  return damage;
};

const handleWeaponMalfunction = (attacker: Character, weapon: Weapon, roll: number, modifiedRoll: number, targetNumber: number): WeaponCombatResult => {
  return {
    type: 'malfunction',
    hit: false,
    roll,
    modifiedRoll,
    targetNumber,
    weaponMalfunction: true,
    message: MALFUNCTION_MESSAGE(attacker.name, weapon.name)
  };
};

// Resolves a fire action
const resolveFireAction = ({
  attacker,
  defender,
  weapon,
  currentRange,
  aimBonus,
  debugMode = false,
}: Omit<ResolveWeaponActionParams, 'action'>): WeaponCombatResult => {

  const rangeModifier = calculateRangeModifier(weapon, currentRange);
  const weaponSpeedMod = getWeaponSpeedModifier(weapon);
  const totalBonus = aimBonus + rangeModifier + weapon.modifiers.accuracy + weaponSpeedMod;

  const { hit, critical, roll, modifiedRoll, targetNumber } = calculateHitChanceAndRoll(
    attacker,
    weapon,
    totalBonus,
    debugMode,
  );

  if (roll > weapon.modifiers.reliability) {
    return handleWeaponMalfunction(attacker, weapon, roll, modifiedRoll, targetNumber);
  }

  if (hit) {
    const damage = calculateDamage(weapon, critical);
    const woundSeverity = damage >= 7 ? 'MORTAL' : damage >= 3 ? 'SERIOUS' : 'LIGHT';
    const strengthReduction = WOUND_EFFECTS[woundSeverity];
    const newStrength = defender.attributes.strength - strengthReduction;

    return {
      type: 'fire',
      hit: true,
      damage,
      critical,
      roll,
      modifiedRoll,
      targetNumber,
      newStrength,
      message: HIT_MESSAGE(attacker.name, defender.name, weapon.name, damage),
    };
  }

  return {
    type: 'fire',
    hit: false,
    roll,
    modifiedRoll,
    targetNumber,
    message: MISS_MESSAGE(attacker.name, weapon.name),
  };
};

export const resolveWeaponAction = ({
  action,
  attacker,
  defender,
  weapon,
  currentRange,
  aimBonus,
  debugMode = false,
}: ResolveWeaponActionParams): WeaponCombatResult | null => {
  if (!weapon) {
    return null;
  }

  switch (action.type) {
    case 'aim':
      return resolveAimAction(attacker, aimBonus);
    case 'fire':
      return resolveFireAction({
        attacker,
        defender,
        weapon,
        currentRange,
        aimBonus,
        debugMode,
      });
    case 'move':
      return resolveMoveAction(attacker, action.targetRange);
    case 'reload':
      return resolveReloadAction(attacker, weapon);
    case 'malfunction':
      return handleWeaponMalfunction(attacker, weapon, 0, 0, 0);
    default:
      return null;
  }
};
