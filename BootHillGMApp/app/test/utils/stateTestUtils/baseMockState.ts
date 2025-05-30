/**
 * Contains the basic empty state template
 * This provides the foundation for all other mock states
 */
import { BaseMockState } from './types';

/**
 * Creates a basic initial state with default empty values
 * 
 * @returns {BaseMockState} A state object with all required properties initialized to empty/default values
 */
export function createBasicMockState(): BaseMockState {
  return {
    character: {
      player: null,
      opponent: null
    },
    inventory: {
      items: [],
      equippedWeaponId: null
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
        storyPoints: { /* Intentionally empty */ },
        narrativeArcs: { /* Intentionally empty */ },
        impactState: {
          reputationImpacts: { /* Intentionally empty */ },
          relationshipImpacts: { /* Intentionally empty */ },
          worldStateImpacts: { /* Intentionally empty */ },
          storyArcImpacts: { /* Intentionally empty */ },
          lastUpdated: 0
        },
        narrativeBranches: { /* Intentionally empty */ },
        pendingDecisions: [],
        decisionHistory: []
      }
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: [],
      activeTab: 'character' // Add missing activeTab property
    },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  };
}