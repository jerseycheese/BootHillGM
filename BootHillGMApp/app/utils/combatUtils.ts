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
  
  // Remove all metadata markers and their content
  const metadataPattern = /\s*(ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|SUGGESTED_ACTIONS):\s*[^:]*/g;
  cleanedName = cleanedName.replace(metadataPattern, '');
  
  // Remove suggested actions with JSON content
  cleanedName = cleanedName.replace(/SUGGESTED_ACTIONS:\s*\[.*?\]\s*/g, '');
  
  // Remove any remaining JSON-like content
  cleanedName = cleanedName.replace(/\{[^}]*\}/g, '');
  cleanedName = cleanedName.replace(/\[[^\]]*\]/g, '');
  
  // Remove any narrative indicators
  cleanedName = cleanedName.replace(/important:.*$/, '');
  
  // Apply existing text cleaning
  cleanedName = cleanText(cleanedName);
  
  // Remove any remaining colons
  cleanedName = cleanedName.replace(/:/g, '');
  
  // Clean up any double spaces and trim
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim();
  
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
