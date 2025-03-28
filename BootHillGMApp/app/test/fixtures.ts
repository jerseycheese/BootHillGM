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
  minAttributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 1,
    baseStrength: 1,
    bravery: 1,
    experience: 0
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 10
  },
  wounds: [],
  isUnconscious: false,
  inventory: { items: [] }
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
  minAttributes: {
    speed: 1,
    gunAccuracy: 1,
    throwingAccuracy: 1,
    strength: 1,
    baseStrength: 1,
    bravery: 1,
    experience: 0
  },
  maxAttributes: {
    speed: 20,
    gunAccuracy: 20,
    throwingAccuracy: 20,
    strength: 20,
    baseStrength: 20,
    bravery: 20,
    experience: 10
  },
  wounds: [],
  isUnconscious: false,
  inventory: { items: [] },
}