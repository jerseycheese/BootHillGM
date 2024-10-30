import { Character } from '../types/character';

export interface CombatMessageParams {
  attackerName: string;
  defenderName: string;
  weaponName: string;
  damage: number;
  roll: number;
  hitChance: number;
}

export const cleanCharacterName = (name: string): string => {
  return name
    .replace(/\s*ACQUIRED_ITEMS:\s*REMOVED_ITEMS:\s*/g, ' ')
    .replace(/\s*ACQUIRED_ITEMS:\s*/g, ' ')
    .replace(/\s*REMOVED_ITEMS:\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getWeaponName = (character: Character): string => {
  return character.weapon?.name || 'fists';
};

export const isCritical = (roll: number): boolean => {
  return roll <= 5 || roll >= 96;
};

export const formatHitMessage = ({
  attackerName,
  defenderName,
  weaponName,
  damage,
  roll,
  hitChance
}: CombatMessageParams): string => {
  const isCriticalHit = isCritical(roll);
  return `${attackerName} hits ${defenderName} with ${weaponName} for ${damage} damage! [Roll: ${roll}/${hitChance}${isCriticalHit ? ' - Critical!' : ''}]`;
};

export const formatMissMessage = (
  attackerName: string,
  defenderName: string,
  roll: number,
  hitChance: number
): string => {
  return `${attackerName} misses ${defenderName}! [Roll: ${roll}/${hitChance}]`;
};

export const calculateCombatDamage = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};
