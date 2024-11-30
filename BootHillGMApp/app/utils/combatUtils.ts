import { Character } from '../types/character';
import { cleanText } from './textCleaningUtils';
import { parseWeaponDamage } from '../types/combat';

export interface CombatMessageParams {
  attackerName: string;
  defenderName: string;
  weaponName: string;
  damage: number;
  roll: number;
  hitChance: number;
}

export const cleanCharacterName = (name: string): string => {
  if (!name) return '';
  
  // Get the first line only
  let cleanedName = name.split('\n')[0];
  
  // Remove any narrative text after the actual name
  cleanedName = cleanedName.split(/[.,:]/)[0];
  
  // Apply existing text cleaning
  cleanedName = cleanText(cleanedName);
  
  // Remove suggested actions
  cleanedName = cleanedName.replace(/SUGGESTED_ACTIONS: \[.*?\]/, '');
  
  // Remove metadata markers
  cleanedName = cleanedName.replace(/ACQUIRED_ITEMS:.*?$/, '');
  cleanedName = cleanedName.replace(/REMOVED_ITEMS:.*?$/, '');
  cleanedName = cleanedName.replace(/LOCATION:.*?$/, '');
  
  // Remove any remaining narrative indicators
  cleanedName = cleanedName.replace(/important:.*$/, '');
  
  // Remove any remaining metadata markers or suggested actions
  cleanedName = cleanedName.replace(/(ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|SUGGESTED_ACTIONS):.*?/, '');
  
  return cleanedName.trim();
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
  const cleanedAttacker = cleanCharacterName(attackerName);
  const cleanedDefender = cleanCharacterName(defenderName);
  
  return `${cleanedAttacker} hits ${cleanedDefender} with ${weaponName} for ${damage} damage! [Roll: ${roll}/${hitChance}${isCriticalHit ? ' - Critical!' : ''}]`;
};

export const formatMissMessage = (
  attackerName: string,
  defenderName: string,
  roll: number,
  hitChance: number
): string => {
  const cleanedAttacker = cleanCharacterName(attackerName);
  const cleanedDefender = cleanCharacterName(defenderName);
  
  return `${cleanedAttacker} misses ${cleanedDefender}! [Roll: ${roll}/${hitChance}]`;
};

export const calculateCombatDamage = (weapon?: { modifiers: { damage: string } }): number => {
  const baseDamage = Math.floor(Math.random() * 6) + 1;
  const weaponDamage = weapon ? parseWeaponDamage(weapon.modifiers.damage) : 0;
  return baseDamage + weaponDamage;
};
