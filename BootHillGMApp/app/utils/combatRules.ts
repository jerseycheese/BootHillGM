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
  
  return baseNumber + accuracyMod + braveryMod + experienceMod;
};

export const rollD100 = (): number => {
  return Math.floor(Math.random() * 100) + 1;
};

export const isCritical = (roll: number): boolean => {
  return roll === 1 || roll === 2;
};
