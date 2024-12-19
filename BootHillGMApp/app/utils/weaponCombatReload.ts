import { Character } from '../types/character';
import { Weapon, WeaponCombatResult } from '../types/combat';
import { RELOAD_MESSAGE } from './weaponCombatMessages';

// Resolves a reload action
export const resolveReloadAction = (attacker: Character, weapon: Weapon): WeaponCombatResult => {
  return {
    type: 'reload',
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: RELOAD_MESSAGE(attacker.name, weapon.name)
  };
};
