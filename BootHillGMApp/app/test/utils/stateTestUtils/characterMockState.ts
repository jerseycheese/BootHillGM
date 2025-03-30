/**
 * Character mock states for testing
 * Provides pre-configured character states for test scenarios
 */
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';

/**
 * Creates a mock state with a player character
 * 
 * @returns {BaseMockState} A state with a configured player character and related properties
 */
export function createCharacterMockState(): BaseMockState {
  const baseState: BaseMockState = createBasicMockState();
  
  return {
    ...baseState,
    character: {
      player: {
        id: 'player1',
        name: 'Test Character',
        attributes: {
          speed: 5,
          gunAccuracy: 6,
          throwingAccuracy: 4,
          strength: 7,
          baseStrength: 7,
          bravery: 5,
          experience: 3
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
        isNPC: false,
        isPlayer: true
      },
      opponent: null
    },
    currentPlayer: 'player1'
  };
}