import { Character } from '../types/character';

export const mockCharacter: Character = {
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
  skills: {
    shooting: 50,
    riding: 50,
    brawling: 50
  },
  wounds: [],
  isUnconscious: false,
  inventory: []
};
