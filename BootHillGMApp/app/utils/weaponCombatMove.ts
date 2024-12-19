import { Character } from '../types/character';
import { WeaponCombatResult } from '../types/combat';
import { MOVE_MESSAGE } from './weaponCombatMessages';

// Resolves a move action
export const resolveMoveAction = (attacker: Character, targetRange?: number): WeaponCombatResult | null => {
  if (targetRange === undefined) return null;
  
  return {
    type: 'move',
    targetRange,
    hit: false,
    roll: 0,
    modifiedRoll: 0,
    targetNumber: 0,
    message: MOVE_MESSAGE(attacker.name, targetRange)
  };
};
