import { Character } from '../../types/character';

// Initial character state for testing
export const initialCharacter: Character = {
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
  },
  minAttributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 20,
  },
  wounds: [],
  isUnconscious: false,
  inventory: { items: [] },
  isNPC: false,
  isPlayer: true
};

export const defaultCharacter: Character = {
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Default Character',
  attributes: {
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 10,
    baseStrength: 10,
    bravery: 10,
    experience: 5,
  },
  minAttributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    bravery: 0,
    experience: 0,
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 20,
  },
  wounds: [],
  isUnconscious: false,
  inventory: { items: [] },
  isNPC: false,
  isPlayer: true,
};

// Dynamically generate mock character with AI-generated name
export function createMockCharacter(overrides: Partial<Character> = {}): Character {
  const names = [
    'Billy the Kid',
    'Wyatt Earp',
    'Annie Oakley',
    'Doc Holliday',
    'Jesse James',
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];

  const defaultCharacter: Character = {
    id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5,
    },
    minAttributes: {
      speed: 0,
      gunAccuracy: 0,
      throwingAccuracy: 0,
      strength: 0,
      baseStrength: 0,
      bravery: 0,
      experience: 0,
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 20,
    },
    wounds: [],
    isUnconscious: false,
    inventory: { items: [] },
    isNPC: false,
    isPlayer: true,
  };

  return {
    ...defaultCharacter,
    ...overrides,
  };
}