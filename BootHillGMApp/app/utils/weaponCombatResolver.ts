import { Character } from '../types/character';
import { WeaponCombatAction, WeaponCombatResult, Weapon } from '../types/combat';
import { calculateHitChance, isCritical } from './combatRules';
import { calculateRangeModifier, getWeaponSpeedModifier } from './bootHillCombat';
import { parseWeaponDamage } from '../types/combat';

interface ResolveWeaponActionParams {
  action: WeaponCombatAction;
  attacker: Character;
  defender: Character;
  weapon: Weapon;
  currentRange: number;
  aimBonus: number;
  debugMode?: boolean;
}

const resolveAimAction = (attacker: Character, currentAimBonus: number): WeaponCombatResult => {
  const newAimBonus = currentAimBonus + 10;
  if (newAimBonus <= 20) {
    return {
      type: 'aim',
      hit: false,
      roll: 0,
      modifiedRoll: 0,
      targetNumber: 0,
      message: `${attacker.name} takes aim carefully`
    };
  }
  return {
    type: 'aim',
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: `${attacker.name} cannot aim any more carefully`
  };
};

const resolveFireAction = ({
  attacker,
  defender,
  weapon,
  currentRange,
  aimBonus,
  debugMode = false
}: Omit<ResolveWeaponActionParams, 'action'>): WeaponCombatResult => {
  const baseChance = calculateHitChance(attacker);
  const rangeModifier = calculateRangeModifier(weapon, currentRange);
  const weaponSpeedMod = getWeaponSpeedModifier(weapon);
  const totalBonus = aimBonus + rangeModifier + weapon.modifiers.accuracy + weaponSpeedMod;
  
  const roll = debugMode ? 1 : Math.floor(Math.random() * 100) + 1;
  const modifiedRoll = roll - totalBonus;
  const targetNumber = baseChance;

  if (roll >= weapon.modifiers.reliability) {
    return {
      type: 'malfunction',
      hit: false,
      roll,
      modifiedRoll,
      targetNumber,
      weaponMalfunction: true,
      message: `${attacker.name}'s ${weapon.name} malfunctions!`
    };
  }

  const hit = modifiedRoll <= targetNumber;
  const critical = isCritical(roll);

  if (hit) {
    let damage = parseWeaponDamage(weapon.modifiers.damage);
    if (critical) damage *= 2;

    const newStrength = defender.attributes.strength - damage;

    return {
      type: 'fire',
      hit: true,
      damage,
      critical,
      roll,
      modifiedRoll,
      targetNumber,
      newStrength,
      message: `${attacker.name} hits ${defender.name} with ${weapon.name} for ${damage} damage!`
    };
  }

  return {
    type: 'fire',
    hit: false,
    roll,
    modifiedRoll,
    targetNumber,
    message: `${attacker.name} misses with ${weapon.name}`
  };
};

const resolveMoveAction = (attacker: Character, targetRange?: number): WeaponCombatResult | null => {
  if (targetRange === undefined) return null;
  
  return {
    type: 'move',
    targetRange,
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: `${attacker.name} moves to ${targetRange} yards distance`
  };
};

const resolveReloadAction = (attacker: Character, weapon: Weapon): WeaponCombatResult => {
  return {
    type: 'reload',
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: `${attacker.name} reloads ${weapon.name}`
  };
};

export const resolveWeaponAction = ({
  action,
  attacker,
  defender,
  weapon,
  currentRange,
  aimBonus,
  debugMode = false
}: ResolveWeaponActionParams): WeaponCombatResult | null => {
  if (!weapon) return null;

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
        debugMode
      });
    case 'move':
      return resolveMoveAction(attacker, action.targetRange);
    case 'reload':
      return resolveReloadAction(attacker, weapon);
    default:
      return null;
  }
};
