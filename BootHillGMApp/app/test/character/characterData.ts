import { Character } from '../../types/character';

// Initial character state for testing
export const initialCharacter: Character = {
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
  wounds: [],
  isUnconscious: false,
  inventory: []
};

// Dynamically generate mock character with AI-generated name
export async function createMockCharacter(): Promise<Character> {
  const names = ['Billy the Kid', 'Wyatt Earp', 'Annie Oakley', 'Doc Holliday', 'Jesse James'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  return {
    name: randomName,
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
}

export const getMockInitialState = () => ({
  character: initialCharacter,
  currentStep: 0,
  lastUpdated: Date.now()
});