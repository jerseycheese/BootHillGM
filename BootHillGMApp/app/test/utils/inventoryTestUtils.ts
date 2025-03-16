import { InventoryItem } from '../../types/item.types';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';
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

export const createMockInventoryItem = (overrides: MockInventoryItemOverrides = {}): InventoryItem => ({
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
  inventory: [],
  strengthHistory: { changes: [], baseStrength: 10 },
  isNPC: false,
  isPlayer: true,
  id: 'test-character-id',
  weapon: undefined,
  equippedWeapon: undefined
};

export const createMockCharacter = (overrides: MockCharacterOverrides = {}): Character => ({
  ...defaultMockCharacter,
  ...overrides,
  attributes: {
    ...defaultMockCharacter.attributes,
    ...overrides.attributes
  }
});

interface MockCampaignStateOverrides {
  currentPlayer?: CampaignState['currentPlayer'];
  npcs?: CampaignState['npcs'];
  character?: CampaignState['character'];
  location?: CampaignState['location'];
  savedTimestamp?: CampaignState['savedTimestamp'];
  gameProgress?: CampaignState['gameProgress'];
  journal?: CampaignState['journal'];
  narrative?: CampaignState['narrative'];
  inventory?: CampaignState['inventory'];
  quests?: CampaignState['quests'];
  isCombatActive?: CampaignState['isCombatActive'];
  opponent?: CampaignState['opponent'];
  isClient?: CampaignState['isClient'];
  suggestedActions?: CampaignState['suggestedActions'];
  combatState?: CampaignState['combatState'];
}

// Create a factory for the mock state with the getter included
const createDefaultMockCampaignState = (): CampaignState => {
  return {
    currentPlayer: 'test-player',
    npcs: [],
    character: defaultMockCharacter,
    location: { type: 'town', name: 'Test Town' } as LocationType,
    savedTimestamp: undefined,
    gameProgress: 0,
    journal: [],
    narrative: initialNarrativeState,
    inventory: [],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false,
    suggestedActions: [],
    combatState: undefined,
    
    // Add the required player getter for backward compatibility
    get player() {
      return this.character;
    }
  };
};

export const createMockCampaignState = (overrides: MockCampaignStateOverrides = {}): CampaignState => {
  // Start with the default state that includes the getter
  const baseState = createDefaultMockCampaignState();
  
  // Apply overrides
  const mergedState = {
    ...baseState,
    ...overrides,
    character: overrides.character ? createMockCharacter(overrides.character) : baseState.character
  };
  
  // Return with the player getter preserved
  return mergedState;
};
