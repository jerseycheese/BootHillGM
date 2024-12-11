import { WeaponCombatState } from '../types/combat';

export const getCombatCapabilities = (
  isProcessing: boolean,
  aimBonus: number,
  weaponState: WeaponCombatState
) => {
  return {
    canAim: !isProcessing && aimBonus < 20,
    canFire: !isProcessing && weaponState.playerWeapon !== null,
    canReload: !isProcessing,
    canMove: !isProcessing
  };
};
