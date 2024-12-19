import { Character } from '../types/character';
import { WeaponCombatResult } from '../types/combat';
import { AIM_MAX_BONUS_MESSAGE, AIM_SUCCESS_MESSAGE } from './weaponCombatMessages';

export const resolveAimAction = (attacker: Character, currentAimBonus: number): WeaponCombatResult => {
  const newAimBonus = currentAimBonus + 10;
  if (newAimBonus <= 20) {
    return {
      type: 'aim',
      hit: false,
      roll: 0,
      modifiedRoll: 0,
      targetNumber: 0,
      message: AIM_SUCCESS_MESSAGE(attacker.name)
    };
  }
  return {
    type: 'aim',
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: AIM_MAX_BONUS_MESSAGE(attacker.name)
  };
};

// Always reset aim bonus after an action
export const shouldResetAim = (): boolean => {
  return true;
};
