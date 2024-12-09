import { Character } from '../types/character';
import { Weapon, WEAPON_STATS } from '../types/combat';
import { WEAPONS } from './weaponDefinitions';

// Weapon type constants
const MELEE_KEYWORDS = ['knife', 'tomahawk', 'lance', 'hammer'] as const;
const DEFAULT_AMMO = 6;

export function isMeleeWeapon(weapon: Weapon): boolean {
  return weapon.modifiers.range === 1;
}

export function isValidWeapon(weapon: unknown): weapon is Weapon {
  return typeof weapon === 'object' && weapon !== null &&
    typeof (weapon as Weapon).name === 'string' &&
    typeof (weapon as Weapon).id === 'string';
}

function similarityScore(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;
  const maxLength = Math.max(str1.length, str2.length);
  const commonLength = Array.from(str1).reduce((acc, char) => 
    acc + (str2.includes(char) ? 1 : 0), 0);
  return commonLength / maxLength;
}

function determineWeaponCategory(weaponName: string): 'shotgun' | 'melee' | 'other' {
  const nameLower = weaponName.toLowerCase();
  if (nameLower.includes('shotgun')) return 'shotgun';
  if (MELEE_KEYWORDS.some(keyword => nameLower.includes(keyword))) return 'melee';
  return 'other';
}

export function findClosestWeapon(weaponName: string): Weapon {
  // Check for exact match first
  if (WEAPONS[weaponName]) {
    console.debug(`[findClosestWeapon] Exact match found for ${weaponName}:`, WEAPONS[weaponName]);
    return WEAPONS[weaponName];
  }

  const weaponKeys = Object.keys(WEAPONS);
  const category = determineWeaponCategory(weaponName);
  
  // Get default weapon and filter criteria based on category
  const { defaultWeapon, filterFn } = {
    'shotgun': {
      defaultWeapon: WEAPONS['Shotgun'],
      filterFn: (key: string) => key.toLowerCase().includes('shotgun')
    },
    'melee': {
      defaultWeapon: WEAPONS['Other Melee Weapon'],
      filterFn: (key: string) => isMeleeWeapon(WEAPONS[key])
    },
    'other': {
      defaultWeapon: WEAPONS['Other Carbines'],
      filterFn: (key: string) => !isMeleeWeapon(WEAPONS[key]) && !key.toLowerCase().includes('shotgun')
    }
  }[category];

  // Find closest match within category
  const weaponNameLower = weaponName.toLowerCase();
  const closestMatch = weaponKeys
    .filter(filterFn)
    .reduce((best, key) => {
      const score = similarityScore(weaponNameLower, key.toLowerCase());
      return score > best.score ? { weapon: WEAPONS[key], score } : best;
    }, { weapon: defaultWeapon, score: -1 });

  console.debug(`[findClosestWeapon] Closest match found for ${weaponName}: ${closestMatch.weapon.name}`, closestMatch.weapon);
  return closestMatch.weapon;
}

export const getDefaultWeapon = (): Weapon => ({
  id: 'opponent-default-colt',
  name: 'Colt Revolver',
  modifiers: WEAPON_STATS['Colt Revolver'],
  ammunition: DEFAULT_AMMO,
  maxAmmunition: DEFAULT_AMMO
});

export const getOpponentWeapon = (opponent: Character): Weapon => {
  if (!opponent.weapon || !isValidWeapon(opponent.weapon)) {
    return getDefaultWeapon();
  }

  const weaponStats = WEAPON_STATS[opponent.weapon.name] || WEAPON_STATS['Colt Revolver'];
  return {
    id: opponent.weapon.id || 'default-opponent-weapon',
    name: opponent.weapon.name,
    modifiers: weaponStats,
    ammunition: weaponStats?.ammunition || DEFAULT_AMMO,
    maxAmmunition: weaponStats?.maxAmmunition || DEFAULT_AMMO
  };
};
