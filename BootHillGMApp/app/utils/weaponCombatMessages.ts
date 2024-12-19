export const AIM_SUCCESS_MESSAGE = (name: string) => `${name} takes aim carefully`;
export const AIM_MAX_BONUS_MESSAGE = (name: string) => `${name} cannot aim any more carefully`;
export const MOVE_MESSAGE = (name: string, targetRange: number) => `${name} moves to ${targetRange} yards distance`;
export const RELOAD_MESSAGE = (name: string, weaponName: string) => `${name} reloads ${weaponName}`;
export const MALFUNCTION_MESSAGE = (name: string, weaponName: string) => `${name}'s ${weaponName} malfunctions!`;
export const HIT_MESSAGE = (attackerName: string, defenderName: string, weaponName: string, damage: number) =>
  `${attackerName} hits ${defenderName} with ${weaponName} for ${damage} damage!`;
export const MISS_MESSAGE = (name: string, weaponName: string) => `${name} misses with ${weaponName}`;