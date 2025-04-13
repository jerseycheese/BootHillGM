// /app/utils/initialization/testHelpers.ts
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { InventoryItem } from '../../types/item.types';
import { NarrativeState } from '../../types/narrative.types';

/**
 * Creates a properly typed minimal GameState object for tests
 * Ensures all required properties are present
 */
export function createTestGameState(partial: Partial<GameState>): GameState {
  // Create a minimal valid game state
  const baseState: GameState = {
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
    narrative: {
      narrativeHistory: [],
      currentStoryPoint: null,
      availableChoices: [],
      visitedPoints: [],
      displayMode: 'standard',
      context: ''
    },
    combat: {
      isActive: false,
      rounds: 0,
      combatType: 'brawling',
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [],
      roundStartTime: 0,
      modifiers: {
        player: 0,
        opponent: 0
      },
      currentTurn: null
    },
    ui: {
      isLoading: false,
      modalOpen: null,
      notifications: [],
      activeTab: 'character'
    },
    quests: [],
    gameProgress: 0,
    currentPlayer: '',
    npcs: [],
    savedTimestamp: Date.now(),
    suggestedActions: [],
    location: { type: 'town', name: 'Boot Hill' },
    isClient: true
  };
  
  // Merge with partial state
  return { ...baseState, ...partial };
}

/**
 * Creates a properly typed Character object for tests
 */
export function createTestCharacter(partial: Partial<Character>): Character {
  // Create a minimal valid character
  const baseCharacter: Character = {
    id: `test-character-${Date.now()}`,
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
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
    inventory: {
      items: []
    },
    wounds: [],
    isUnconscious: false
  };
  
  // Merge with partial character
  return { ...baseCharacter, ...partial };
}

/**
 * Creates a properly typed inventory item for tests
 */
export function createTestInventoryItem(partial: Partial<InventoryItem>): InventoryItem {
  const baseItem: InventoryItem = {
    id: `test-item-${Date.now()}`,
    name: 'Test Item',
    description: 'A test item for unit tests',
    quantity: 1,
    category: 'general'
  };
  
  return { ...baseItem, ...partial };
}

/**
 * Creates a properly typed narrative state for tests
 */
export function createTestNarrativeState(partial: Partial<NarrativeState>): NarrativeState {
  const baseNarrative: NarrativeState = {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
    displayMode: 'standard',
    context: ''
  };
  
  return { ...baseNarrative, ...partial };
}

/**
 * Creates a properly typed journal entry for a narrative
 */
export function createTestNarrativeEntry(content: string, title: string = 'Test Entry', summary?: string) {
  return {
    id: `test-journal-${Date.now()}`,
    timestamp: Date.now(),
    title,
    content,
    type: 'narrative' as const,
    ...(summary ? { narrativeSummary: summary } : {})
  };
}