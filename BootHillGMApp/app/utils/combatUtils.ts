import { Character } from '../types/character';
import { cleanText } from './textCleaningUtils';

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
  
  // Remove any remaining narrative indicators
  cleanedName = cleanedName.replace(/important:.*$/, '');
  
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

export const calculateCombatDamage = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};
