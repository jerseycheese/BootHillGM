import { Character } from '../types/character';

export const mockCharacter: Character = {
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Character',
  attributes: {
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 10,
    baseStrength: 10,
    bravery: 10,
    experience: 5
  },
  wounds: [],
  isUnconscious: false,
  inventory: []
};
