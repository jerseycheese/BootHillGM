import { Character } from '../types/character';

export interface CombatMessageParams {
  attackerName: string;
  defenderName: string;
  weaponName: string;
  damage: number;
  roll: number;
  hitChance: number;
}

export const cleanMetadataMarkers = (text: string): string => {
  return text
    // Remove suggested actions JSON
    .replace(/\s*SUGGESTED_ACTIONS:\s*\[[^\]]*\]/g, '')
    // Remove empty brackets
    .replace(/\[\s*\]/g, '')
    // Remove important markers
    .replace(/\s*important:\s*[^.!?]*[.!?]/g, '')
    // Clean up location markers
    .replace(/\s*LOCATION:\s*[^.!?\n]*/g, '')
    // Remove acquired/removed items markers
    .replace(/\s*ACQUIRED_ITEMS:\s*(?:\[[^\]]*\]|\s*[^\n]*)/g, '')
    .replace(/\s*REMOVED_ITEMS:\s*(?:\[[^\]]*\]|\s*[^\n]*)/g, '')
    // Clean up extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const cleanCharacterName = (name: string): string => {
  return cleanMetadataMarkers(name);
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
  const cleanedAttacker = cleanMetadataMarkers(attackerName);
  const cleanedDefender = cleanMetadataMarkers(defenderName);
  
  return `${cleanedAttacker} hits ${cleanedDefender} with ${weaponName} for ${damage} damage! [Roll: ${roll}/${hitChance}${isCriticalHit ? ' - Critical!' : ''}]`;
};

export const formatMissMessage = (
  attackerName: string,
  defenderName: string,
  roll: number,
  hitChance: number
): string => {
  const cleanedAttacker = cleanMetadataMarkers(attackerName);
  const cleanedDefender = cleanMetadataMarkers(defenderName);
  
  return `${cleanedAttacker} misses ${cleanedDefender}! [Roll: ${roll}/${hitChance}]`;
};

export const calculateCombatDamage = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};
