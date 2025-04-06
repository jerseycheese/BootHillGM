import React, { ReactNode } from 'react';
import { CampaignStateContext } from '../../hooks/useCampaignStateContext';
import { CampaignStateContextType } from '../../types/campaignState.types';
import { GameEngineAction } from '../../types/gameActions';
import { CombatState } from '../../types/state/combatState';
import { UIState } from '../../types/state/uiState';
import { CharacterState } from '../../types/state/characterState';
import { InventoryState } from '../../types/state/inventoryState';
import { JournalState } from '../../types/state/journalState';
import { GameState } from '../../types/gameState';
import { InventoryItem } from '../../types/item.types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { JournalEntry } from '../../types/journal';
import { NarrativeState, initialNarrativeState } from '../../types/state/narrativeState';
import { LocationType } from '../../services/locationService'; // Import LocationType

/**
 * Interface for a partial campaign state used in tests
 * This matches the expected shape in the components that use it
 */
interface TestCampaignState {
  currentPlayer?: string;
  npcs?: string[]; // Use string[] to match GameState type
  character?: Character | null;
  inventory?: InventoryItem[] | { items: InventoryItem[], equippedWeaponId?: string | null };
  narrative?: Partial<NarrativeState>;
  journal?: JournalEntry[];
  location?: LocationType | null; // Use imported LocationType
  isCombatActive?: boolean;
  opponent?: Character | null;
  quests?: string[]; // Use string[] to match GameState type
  gameProgress?: number;
  suggestedActions?: SuggestedAction[];
  savedTimestamp?: number;
  isClient?: boolean;
  
  // Legacy getter for backward compatibility
  player?: Character | null;
}

// Default test state with guaranteed inventory structure
const defaultCampaignState: TestCampaignState = {
  currentPlayer: 'test-player-id',
  npcs: [],
  character: {
    id: 'test-player-id',
    name: 'Test Character',
    isNPC: false,
    isPlayer: true,
    inventory: {
      items: []
    },
    attributes: {
      strength: 10,
      baseStrength: 10,
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      bravery: 5,
      experience: 0
    },
    minAttributes: {
      strength: 8,
      baseStrength: 8,
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      strength: 20,
      baseStrength: 20,
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false
  },
  inventory: [],
  narrative: {
    currentStoryPoint: {
      id: 'test-story-point',
      type: 'exposition',
      title: 'Test Story Point',
      content: 'You find yourself in Boothill with Test Character.',
      choices: []
    },
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
    displayMode: 'standard'
  },
  journal: [],
  location: { 
    type: 'town', 
    name: 'Boothill' 
  },
  isCombatActive: false,
  opponent: null,
  quests: [],
  gameProgress: 0,
  suggestedActions: [],
  
  // Accessor for backward compatibility
  get player() {
    return this.character;
  }
};

/**
 * Type-safe wrapper for the campaign state provider.
 */
export interface TestWrapperProps {
  children: ReactNode;
  initialState?: Partial<TestCampaignState>;
}

/**
 * Campaign state provider for testing that ensures all required state properties exist
 * to prevent test failures from undefined values.
 */
export const TestCampaignStateProvider: React.FC<TestWrapperProps> = ({ 
  children, 
  initialState = {} 
}) => {
  // Create a merged state by spreading the initial and default states
  const mergedState = { 
    ...defaultCampaignState,
    ...initialState
  } as TestCampaignState;

  // Add mock dispatch function that logs what's being dispatched
  const mockDispatch = jest.fn((action: GameEngineAction) => {
    // If in test environment, log dispatch calls to help with debugging
    if (process.env.NODE_ENV === 'test') {
      console.log('Test dispatch:', action.type);
    }
  });

  // Create stub functions for context methods
  const saveGame = jest.fn(() => {
    console.log('Mock saveGame called');
  });

  const loadGame = jest.fn(() => {
    console.log('Mock loadGame called');
    return null;
  });

  const cleanupState = jest.fn(() => {
    console.log('Mock cleanupState called');
  });

  // Create mock player object for legacy getter
  const player = mergedState.character;

  // Create missing required GameState properties
  const defaultCombatState: CombatState = {
    isActive: false,
    combatType: 'brawling',
    rounds: 0,
    playerTurn: true,
    playerCharacterId: player?.id || '',
    opponentCharacterId: mergedState.opponent?.id || '',
    combatLog: [],
    roundStartTime: 0,
    modifiers: {
      player: 0,
      opponent: 0
    },
    currentTurn: null,
    winner: null,
    participants: [],
    // activeTab: 'combat' // Removed: Not part of CombatState type
  };

  const defaultUIState: UIState = {
    isLoading: false,
    modalOpen: null,
    notifications: [],
    activeTab: 'narrative' // Required by the type
  };
  
  // Create a CharacterState from the campaign state
  const characterState: CharacterState = {
    player: mergedState.character || null,
    opponent: mergedState.opponent || null
  };
  
  // Handle both inventory formats from tests
  let inventoryItems: InventoryItem[] = [];
  let equippedWeaponId: string | null = null;
  
  // If we have an inventory object from tests
  if (mergedState.inventory) {
    // Direct array format
    if (Array.isArray(mergedState.inventory)) {
      inventoryItems = mergedState.inventory;
    } 
    // Object with items property
    else if (typeof mergedState.inventory === 'object' && 'items' in mergedState.inventory) {
      inventoryItems = Array.isArray(mergedState.inventory.items) 
        ? mergedState.inventory.items 
        : [];
      
      // Get equipped weapon ID if provided
      if ('equippedWeaponId' in mergedState.inventory) {
        equippedWeaponId = mergedState.inventory.equippedWeaponId ?? null;
      }
    }
  }
  
  // Create properly structured inventory and journal states
  const inventoryState: InventoryState = {
    items: inventoryItems,
    equippedWeaponId: equippedWeaponId
  };
  
  const journalState: JournalState = {
    entries: Array.isArray(mergedState.journal) ? mergedState.journal : []
  };
  
  // Create a complete GameState that has the right structure
  const gameState: GameState = {
    character: characterState,
    combat: defaultCombatState,
    ui: defaultUIState,
    inventory: inventoryState,
    journal: journalState,
    narrative: mergedState.narrative ? { ...initialNarrativeState, ...mergedState.narrative } : initialNarrativeState,
    currentPlayer: mergedState.currentPlayer || '',
    npcs: mergedState.npcs || [],
    location: mergedState.location || null,
    quests: mergedState.quests || [],
    gameProgress: mergedState.gameProgress || 0,
    savedTimestamp: mergedState.savedTimestamp,
    isClient: mergedState.isClient || false,
    suggestedActions: mergedState.suggestedActions || [],
  };
  
  // Create the context value with all required properties of CampaignStateContextType
  const contextValue: CampaignStateContextType = {
    state: gameState,
    dispatch: mockDispatch,
    saveGame: saveGame,
    loadGame: loadGame,
    cleanupState: cleanupState,
    player: player || null,
    opponent: mergedState.opponent || null,
    inventory: inventoryItems,
    entries: journalState.entries,
    isCombatActive: mergedState.isCombatActive || false,
    narrativeContext: mergedState.narrative?.narrativeContext
  };

  return (
    <CampaignStateContext.Provider value={contextValue}>
      {children}
    </CampaignStateContext.Provider>
  );
};

/**
 * Interface for TestCampaignStateProvider result with proper typing
 */
export interface ProviderWrapperResult {
  props: {
    value: CampaignStateContextType;
    children: ReactNode;
  };
  type: React.FC;
}

/**
 * This test file includes utilities that help set up test environments for
 * components and hooks that rely on the CampaignStateContext
 */
describe('TestWrappers', () => {
  it('should render with default state', () => {
    expect(TestCampaignStateProvider).toBeDefined();
  });

  it('should provide default state values', () => {
    expect(defaultCampaignState.inventory).toEqual([]);
    expect(defaultCampaignState.character).toBeDefined();
  });
  
  it('should maintain array references in test state', () => {
    const testItems = [{ 
      id: 'test1', 
      name: 'Test Item',
      description: 'A test item',
      quantity: 1,
      category: 'general' as const,
    }];
    
    const wrapper = TestCampaignStateProvider({
      children: null,
      initialState: { 
        inventory: testItems
      }
    }) as unknown as ProviderWrapperResult;
    
    // Access the value prop from the context provider
    const contextValue = wrapper.props.value;
    
    // Check that the items array is the same reference
    expect(contextValue.inventory).toBe(testItems);
  });
});
