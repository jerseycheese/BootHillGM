import { Character } from '../types/character';

export const mockPlayerCharacter: Character = {
  isNPC: false,
  isPlayer: true,
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
}

export const mockNPC: Character = {
  isNPC: true,
  isPlayer: false,
  id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test NPC',
  attributes: {
    speed: 8,
    gunAccuracy: 7,
    throwingAccuracy: 9,
    strength: 12,
    baseStrength: 12,
    bravery: 5,
    experience: 2
  },
  wounds: [],
  isUnconscious: false,
  inventory: []
}