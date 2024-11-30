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
  
  console.log('Initial name:', name);
  
  // Get the first line only
  let cleanedName = name.split('\n')[0];
  console.log('After line split:', cleanedName);
  
  // Remove all metadata markers and their content
  const metadataPattern = /\s*(ACQUIRED_ITEMS|REMOVED_ITEMS|LOCATION|SUGGESTED_ACTIONS):\s*[^:]*/g;
  cleanedName = cleanedName.replace(metadataPattern, '');
  console.log('After metadata removal:', cleanedName);
  
  // Remove suggested actions section completely
  cleanedName = cleanedName.replace(/SUGGESTED_ACTIONS:.*?(?=\s+\w+|$)/g, '');
  console.log('After suggested actions removal:', cleanedName);
  
  // Try to remove any remaining JSON-like content
  cleanedName = cleanedName.replace(/\[[^\]]*\]/g, '');
  console.log('After bracket content removal:', cleanedName);
  
  // Remove any remaining quoted strings
  cleanedName = cleanedName.replace(/"[^"]*"/g, '');
  console.log('After quoted content removal:', cleanedName);
  
  // Remove any narrative indicators
  cleanedName = cleanedName.replace(/important:.*$/, '');
  console.log('After narrative indicator removal:', cleanedName);
  
  // Apply existing text cleaning
  cleanedName = cleanText(cleanedName);
  console.log('After text cleaning:', cleanedName);
  
  // Remove any remaining colons and special characters
  cleanedName = cleanedName.replace(/[:{}\[\]]/g, '');
  console.log('After special char removal:', cleanedName);
  
  // Clean up any double spaces and trim
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim();
  console.log('Final result:', cleanedName);
  
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
