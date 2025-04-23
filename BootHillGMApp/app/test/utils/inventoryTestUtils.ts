import { InventoryItem } from '../../types/item.types';
import { Character } from '../../types/character';
import { GameState } from '../../types/gameState'; // Use GameState instead of CampaignState
// Import necessary slice types and initial states
import {
  CharacterState,
  CombatState,
  InventoryState,
  JournalState,
  NarrativeState,
  UIState,
  initialCharacterState,
  initialCombatState,
  initialInventoryState,
  initialJournalState,
  initialUIState
} from '../../types/state';
import { LocationType } from '../../services/locationService';
import { initialNarrativeState } from '../../types/narrative.types';

interface MockInventoryItemOverrides {
  id?: string;
  name?: string;
  quantity?: number;
  description?: string;
  category?: InventoryItem['category'];
  requirements?: InventoryItem['requirements'];
  effect?: InventoryItem['effect'];
  weapon?: InventoryItem['weapon'];
  isEquipped?: boolean;
}

export const createMockInventoryItem = (overrides: MockInventoryItemOverrides = { /* Intentionally empty */ }): InventoryItem => ({
  id: 'test-item',
  name: 'Test Item',
  quantity: 1,
  description: 'Test description',
  category: 'general',
  ...overrides
});

interface MockCharacterOverrides {
  name?: Character['name'];
  attributes?: Partial<Character['attributes']>;
  wounds?: Character['wounds'];
  isUnconscious?: Character['isUnconscious'];
  inventory?: Character['inventory'];
  strengthHistory?: Character['strengthHistory'];
  isNPC?: Character['isNPC'];
  isPlayer?: Character['isPlayer'];
  id?: Character['id'];
  weapon?: Character['weapon'];
  equippedWeapon?: Character['equippedWeapon'];
}

const defaultMockCharacter: Character = {
  name: 'Test Character',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 10,
    baseStrength: 10,
    bravery: 5,
    experience: 0
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
  strengthHistory: { changes: [], baseStrength: 10 },
  isNPC: false,
  isPlayer: true,
  id: 'test-character-id',
  weapon: undefined,
  equippedWeapon: undefined
};

export const createMockCharacter = (overrides: MockCharacterOverrides = { /* Intentionally empty */ }): Character => ({
  ...defaultMockCharacter,
  ...overrides,
  attributes: {
    ...defaultMockCharacter.attributes,
    ...overrides.attributes
  }
});

// Rename and update interface to reflect GameState structure
interface MockGameStateOverrides {
  currentPlayer?: GameState['currentPlayer'];
  npcs?: GameState['npcs'];
  character?: Partial<CharacterState>; // Override slice
  location?: GameState['location'];
  savedTimestamp?: GameState['savedTimestamp'];
  gameProgress?: GameState['gameProgress'];
  journal?: Partial<JournalState>; // Override slice
  narrative?: Partial<NarrativeState>; // Override slice
  inventory?: Partial<InventoryState>; // Override slice
  quests?: GameState['quests'];
  combat?: Partial<CombatState>; // Override slice
  ui?: Partial<UIState>; // Override slice
  isClient?: GameState['isClient'];
  suggestedActions?: GameState['suggestedActions'];
  // Remove obsolete properties like isCombatActive, opponent, combatState (now part of slices)
}

// Create a factory for the mock state with the getter included
export const createDefaultMockGameState = (): GameState => {
  return {
    currentPlayer: 'test-player',
    npcs: [],
    character: { // Use character slice
      ...initialCharacterState,
      player: defaultMockCharacter,
      opponent: null
    },
    location: { type: 'town', name: 'Test Town' } as LocationType,
    savedTimestamp: undefined,
    gameProgress: 0,
    journal: initialJournalState, // Use journal slice
    narrative: initialNarrativeState, // Use narrative slice
    inventory: initialInventoryState, // Use inventory slice
    quests: [],
    combat: { // Use combat slice
      ...initialCombatState,
      isActive: false
    },
    ui: initialUIState, // Use ui slice
    isClient: false,
    suggestedActions: [],
  };
};

// Rename and update function to work with GameState and MockGameStateOverrides
export const createMockGameState = (overrides: MockGameStateOverrides = { /* Intentionally empty */ }): GameState => {
  // Start with the default GameState
  const baseState = createDefaultMockGameState();
  
  // Apply overrides, merging slice overrides correctly
  const mergedState: GameState = {
    ...baseState,
    ...overrides, // Spread top-level overrides first
    // Deep merge slice overrides
    character: {
      ...baseState.character,
      ...overrides.character, // Override character slice properties
      // Ensure player/opponent are handled if character override exists but doesn't specify them
      // Safely access player/opponent from baseState.character, providing null fallback
      player: overrides.character?.player !== undefined ? overrides.character.player : baseState.character?.player ?? null,
      opponent: overrides.character?.opponent !== undefined ? overrides.character.opponent : baseState.character?.opponent ?? null,
    },
    combat: {
      ...baseState.combat,
      ...overrides.combat,
    },
    inventory: {
      ...baseState.inventory,
      ...overrides.inventory,
    },
    journal: {
      ...baseState.journal,
      ...overrides.journal,
    },
    narrative: {
      ...baseState.narrative,
      ...overrides.narrative,
    },
    ui: {
      ...baseState.ui,
      ...overrides.ui,
    },
  };

  return mergedState;
};
