/**
 * Combat-related mock states for testing
 * Provides pre-configured combat states for test scenarios
 */
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';

/**
 * Creates a mock state with active combat between player and opponent
 * 
 * @returns {BaseMockState} A state with active combat and related properties
 */
export function createCombatMockState(): BaseMockState {
  const baseState: BaseMockState = createBasicMockState();
  const currentTime: number = Date.now();
  
  return {
    ...baseState,
    character: {
      player: {
        id: 'player1',
        name: 'Test Character',
        attributes: { 
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 7,
          baseStrength: 7,
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
        inventory: { items: [] },
        isNPC: false,
        isPlayer: true
      },
      opponent: {
        id: 'opponent1',
        name: 'Test Opponent',
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 6,
          baseStrength: 6,
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
        inventory: { items: [] },
        isNPC: true,
        isPlayer: false
      }
    },
    combat: {
      isActive: true,
      rounds: 1,
      playerTurn: true,
      combatType: 'brawling',
      playerCharacterId: 'player1',
      opponentCharacterId: 'opponent1',
      combatLog: [],
      roundStartTime: currentTime,
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: 'player',
      winner: null,
      participants: []
    },
    currentPlayer: 'player1',
    npcs: ['opponent1']
  };
}