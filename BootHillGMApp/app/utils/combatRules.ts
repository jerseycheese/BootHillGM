import { Character } from '../types/character';

// First Shot Determination = Speed + Bravery Speed Modifier + Weapon Speed Modifier (base 50)
export const calculateFirstShot = (character: Character): number => {
  // Simple MVP implementation that can be expanded later
  const baseNumber = 50;
  const speedModifier = character.attributes.speed;

  // For MVP, using simplified bravery modifier
  const braveryMod = character.attributes.bravery >= 50 ? 2 : 0;

  // TODO: Add weapon modifier when weapon system is implemented
  const weaponMod = 0;

  return baseNumber + speedModifier + braveryMod + weaponMod;
};

// Hit Determination = Gun Accuracy + Bravery Modifier + Experience Modifier + 50
export const calculateHitChance = (character: Character): number => {
  const baseNumber = 50;
  const accuracyMod = character.attributes.gunAccuracy;

  // Simple bravery and experience modifiers for MVP
  const braveryMod = character.attributes.bravery >= 50 ? 3 : 0;
  const experienceMod = character.attributes.experience >= 5 ? 2 : -5;

  let woundModifier = 0;
  if (character.wounds && character.wounds.length > 0) {
    woundModifier = character.wounds.reduce((sum, wound) => sum + wound.strengthReduction, 0);
    console.debug(`Wound modifier: ${woundModifier}`);
  }

  return baseNumber + accuracyMod + braveryMod + experienceMod - woundModifier;
};

export const rollD100 = (): number => {
  return Math.floor(Math.random() * 100) + 1;
};

export const isCritical = (roll: number): boolean => {
  return roll === 1 || roll === 2;
};

/**
 * Calculates combat damage based on attacker and weapon.
 *
 * @param attacker The attacking character
 * @returns The calculated damage value
 */
export const calculateCombatDamage = (attacker: Character): number => {
  let damage = 5; // Base damage

  // Add strength bonus (simplified for MVP)
  damage += Math.floor(attacker.attributes.strength / 2);

  // Add weapon damage (if weapon is equipped and has modifiers.damage property)
  if (attacker.weapon && attacker.weapon.modifiers && attacker.weapon.modifiers.damage) {
    damage += parseInt(attacker.weapon.modifiers.damage, 10); // Parse damage string to int
  }

  // Add a random element (d4 - values 1 to 4)
  damage += Math.floor(Math.random() * 4) + 1;

  return Math.max(0, damage); // Ensure damage is not negative
};
