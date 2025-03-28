/**
 * Mock state factory functions for testing
 */
import { GameState } from '../../../types/gameState';
import { BaseMockState } from './types';
import { StoryPointType } from '../../../types/narrative/story-point.types';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';

// Forward declaration to avoid circular dependency
// This is defined in index.ts but used here
import { prepareStateForTesting } from './index';

/**
 * Helper function to create a mock state with properly typed getters
 * Similar to React's component factory pattern
 */
function createMockState(state: BaseMockState): GameState {
  // Define a function to create getters properly
  const createGetters = (baseState: BaseMockState) => {
    // Since we can't add this parameters to getters, we'll use a reference variable
    // to maintain type safety while still benefiting from TypeScript's checking
    const self = baseState;
    
    return {
      get player() { 
        return self.character.player; 
      },
      get isCombatActive() { 
        return self.combat.isActive; 
      }
    };
  };
  
  // Create the complete state with getters
  const completeState = {
    ...state,
    ...createGetters(state)
  };
  
  // Finally, adapt the state for testing
  return prepareStateForTesting(completeState as unknown as GameState);
}

/**
 * Creates mock state objects for various test scenarios
 */
export const mockStates = {
  /**
   * Basic initial state with adapters applied
   */
  basic: () => createMockState({
    character: {
      player: null,
      opponent: null
    },
    inventory: {
      items: []
    },
    journal: {
      entries: []
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null,
      narrativeContext: {
        worldContext: '',
        characterFocus: [],
        themes: [],
        importantEvents: [],
        storyPoints: {},
        narrativeArcs: {},
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: 0
        },
        narrativeBranches: {},
        pendingDecisions: [],
        decisionHistory: []
      }
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with player character
   */
  withCharacter: () => createMockState({
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
    currentPlayer: 'player1',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: [],
    inventory: { items: [] },
    journal: { entries: [] },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    }
  }),
  
  /**
   * Mock state with active combat
   */
  withCombat: () => createMockState({
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
      roundStartTime: Date.now(),
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: 'player',
      winner: null,
      participants: []
    },
    currentPlayer: 'player1',
    npcs: ['opponent1'],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: [],
    inventory: { items: [] },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    }
  }),
  
  /**
   * Mock state with inventory items
   */
  withInventory: () => createMockState({
    inventory: {
      items: [
        { id: 'item1', name: 'Revolver', category: 'weapon', description: 'A 6-shooter', quantity: 1 },
        { id: 'item2', name: 'Bandage', category: 'medical', description: 'Heals wounds', quantity: 3 },
        { id: 'item3', name: 'Canteen', category: 'consumable', description: 'Contains water', quantity: 1 }
      ]
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with journal entries
   */
  withJournal: () => createMockState({
    journal: {
      entries: [
        { 
          content: 'Test content 1', 
          timestamp: 1615000000000, 
          type: 'narrative'
        },
        { 
          content: 'Test content 2', 
          timestamp: 1615100000000, 
          type: 'quest',
          questTitle: 'Test Quest',
          status: 'started'
        }
      ] as AppJournalEntry[]
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    inventory: { items: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  }),
  
  /**
   * Mock state with narrative context
   */
  withNarrative: () => createMockState({
    narrative: {
      narrativeContext: {
        worldContext: 'Saloon, Evening, Tense',
        characterFocus: ['player', 'sheriff'],
        themes: ['revenge', 'justice'],
        importantEvents: ['Bank robbery'],
        storyPoints: {},
        narrativeArcs: {},
        impactState: {
          reputationImpacts: {},
          relationshipImpacts: {},
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: Date.now()
        },
        narrativeBranches: {},
        pendingDecisions: [],
        decisionHistory: []
      },
      currentStoryPoint: {
        id: 'confrontation',
        title: 'Confrontation',
        content: 'A tense standoff',
        choices: [],
        type: 'action' as StoryPointType
      },
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [
        { id: 'dialogue1', speaker: 'NPC', text: 'Hello stranger', timestamp: 1615000000000 }
      ],
      displayMode: 'standard',
      error: null
    },
    character: {
      player: null,
      opponent: null
    },
    combat: {
      isActive: false,
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null, 
      combatType: 'brawling',
      winner: null,
      participants: []
    },
    inventory: { items: [] },
    journal: { entries: [] },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: []
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  })
};