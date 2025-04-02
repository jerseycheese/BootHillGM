// /app/utils/gameInitializationUtils.ts
import { InventoryState } from "../types/state/inventoryState";
import { InventoryItem } from "../types/item.types";
import { LocationType } from "../services/locationService";
import { GameState } from "../types/gameState";
import { initialGameState } from "../types/gameState";
import { StoryPointType, NarrativeDisplayMode, NarrativeState } from "../types/narrative.types";
import { getStartingInventory } from "../utils/startingInventory";
import { Character } from "../types/character"; // Added import

/**
 * Maximum time to wait for initialization before forcing completion
 * Used to prevent infinite loading states that could block the UI
 */
export const MAX_INITIALIZATION_TIME = 10000; // 10 seconds

/**
 * Extracts items from inventory state or returns as-is if it's an array
 * This function handles both inventory state objects and raw item arrays
 * 
 * @param inventory - The inventory to extract items from (state object or items array)
 * @returns Array of inventory items
 */
export const getItemsFromInventory = (inventory: InventoryState | InventoryItem[] | undefined): InventoryItem[] => {
  if (!inventory) return [];
  if (Array.isArray(inventory)) return inventory;
  return inventory.items || [];
};

/**
 * Creates an inventory state from items
 * Wraps the items array in the proper inventory state structure
 * 
 * @param items - Array of inventory items
 * @returns A properly structured inventory state
 */
export const createInventoryState = (items: InventoryItem[]): InventoryState => {
  return { items };
};

/**
 * Creates a properly typed location object
 * Maps string location types to their correct typed representations
 * 
 * @param type - String representing the location type
 * @param name - Name or description of the location
 * @returns A properly typed location object
 */
export const createLocation = (type: string, name: string): LocationType => {
  // Handle known location types
  if (type === 'town') {
    return { type: 'town' as const, name };
  } else if (type === 'wilderness') {
    return { type: 'wilderness' as const, description: name };
  } else if (type === 'landmark') {
    return { type: 'landmark' as const, name };
  } else {
    // Default to unknown if type doesn't match known types
    return { type: 'unknown' as const };
  }
};

/**
 * Processes location from AI response
 * Safely extracts type and name information and creates a valid location
 * 
 * @param location - Unknown data structure from AI response
 * @returns A properly typed location object
 */
export const processLocation = (location: unknown): LocationType => {
  if (!location) return { type: 'unknown' as const };

  if (typeof location === 'object' && location !== null) {
    // Check if 'type' exists and is a string
    const typeValue = 'type' in location && typeof location.type === 'string' ? location.type : '';
    const locationType = typeValue.toLowerCase();

    // Check if 'name' exists and is a string
    const name = 'name' in location && typeof location.name === 'string' ? location.name : 'Unknown';

    return createLocation(locationType, name);
  }

  return { type: 'unknown' as const };
};

/**
 * Creates an emergency recovery state when initialization fails
 * Provides a minimal but functional game state with default values
 * 
 * @returns A complete game state for emergency recovery
 */
export const createEmergencyState = (): GameState => {
  console.warn("Creating emergency recovery state");

  return {
    ...initialGameState,
    character: {
      player: {
        id: `emergency_${Date.now()}`,
        name: "Traveler",
        attributes: {
          speed: 10, gunAccuracy: 10, throwingAccuracy: 10,
          strength: 10, baseStrength: 10, bravery: 10, experience: 5
        },
        minAttributes: {
          speed: 1, gunAccuracy: 1, throwingAccuracy: 1,
          strength: 1, baseStrength: 1, bravery: 1, experience: 0
        },
        maxAttributes: {
          speed: 20, gunAccuracy: 20, throwingAccuracy: 20,
          strength: 20, baseStrength: 20, bravery: 20, experience: 10
        },
        isNPC: false,
        isPlayer: true,
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] }
      },
      opponent: null
    },
    narrative: {
      currentStoryPoint: {
        id: 'emergency',
        type: 'exposition' as StoryPointType,
        title: 'Emergency Start',
        content: "You find yourself in Boothill with a fresh start ahead of you.",
        choices: [],
      },
      availableChoices: [],
      visitedPoints: ['emergency'],
      narrativeHistory: ["You find yourself in Boothill with a fresh start ahead of you."],
      displayMode: 'standard' as NarrativeDisplayMode,
      context: "",
    },
    inventory: createInventoryState(getStartingInventory()),
    location: { type: 'town' as const, name: 'Boothill' },
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: [
      { id: 'emergency-1', title: "Look around", description: "Get your bearings", type: 'optional' },
      { id: 'emergency-2', title: "Find the sheriff", description: "Learn about the town", type: 'optional' },
      { id: 'emergency-3', title: "Visit the general store", description: "Buy supplies", type: 'optional' }
    ]
  } as GameState;
};

/**
 * Creates fallback state for new character initialization
 * Used when the AI response fails or times out
 * 
 * @param characterData - The character data from creation or null
 * @returns Fallback game state for a new character
 */
export const createFallbackNewCharacterState = (characterData: Character | null): GameState => {
  const fallbackNarrative = `${characterData?.name || 'You'} arrive in the dusty town of Boothill, ready to make your mark on the frontier.`;
  
  // Save fallback narrative for reset
  localStorage.setItem("initial-narrative", JSON.stringify({ narrative: fallbackNarrative }));

  return {
    ...initialGameState,
    currentPlayer: characterData?.name || "",
    character: {
      player: characterData,
      opponent: null
    },
    narrative: {
      currentStoryPoint: {
        id: 'intro_fallback',
        type: 'exposition' as StoryPointType,
        title: 'Introduction',
        content: fallbackNarrative,
        choices: [],
      },
      availableChoices: [],
      visitedPoints: ['intro_fallback'],
      narrativeHistory: [fallbackNarrative],
      displayMode: 'standard' as NarrativeDisplayMode,
      context: "",
    },
    location: { type: 'town' as const, name: 'Boothill' },
    inventory: createInventoryState(getStartingInventory()),
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: [
      { id: 'fallback-init-1', title: "Explore the town", description: "Get to know Boothill", type: 'optional' },
      { id: 'fallback-init-2', title: "Visit the saloon", description: "Find information and refreshment", type: 'optional' },
      { id: 'fallback-init-3', title: "Look for work", description: "Earn some money", type: 'optional' }
    ]
  } as GameState;
};

/**
 * Creates fallback state for existing character
 * Used when the AI response fails or times out when resuming a game
 * 
 * @param state - The current game state
 * @returns Fallback game state for an existing character
 */
export const createFallbackExistingCharacterState = (state: GameState): GameState => {
  const fallbackNarrative = `${state.character?.player?.name || 'You'} continue your journey through the western frontier.`;

  const fallbackNarrativeState: NarrativeState = {
    currentStoryPoint: {
      id: 'resume_fallback',
      type: 'exposition' as StoryPointType,
      title: 'Resuming Game',
      content: fallbackNarrative,
      choices: [],
    },
    availableChoices: [],
    visitedPoints: ['resume_fallback'],
    narrativeHistory: [fallbackNarrative],
    displayMode: 'standard' as NarrativeDisplayMode,
    context: "",
  };

  return {
    ...state,
    narrative: fallbackNarrativeState,
    location: { type: 'town' as const, name: 'Boothill' },
    inventory: createInventoryState(getStartingInventory()),
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: [
      { id: 'fallback-existing-char-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
      { id: 'fallback-existing-char-2', title: "Visit the saloon", description: "Find information and refreshment", type: 'optional' },
      { id: 'fallback-existing-char-3', title: "Check your inventory", description: "See what you're carrying", type: 'optional' }
    ]
  } as GameState;
};

/**
 * Creates a basic recovery state with default character
 * Used when no character data can be found but game needs to continue
 * 
 * @returns A basic game state with a default character
 */
export const createBasicRecoveryState = (): GameState => {
  const characterData = {
    isNPC: false,
    isPlayer: true,
    id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: "Default Character",
    inventory: { items: [] },
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5,
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
  };

  return {
    ...initialGameState,
    character: {
      player: characterData,
      opponent: null
    },
    inventory: createInventoryState(getStartingInventory()),
    narrative: {
      currentStoryPoint: {
        id: 'error_recovery',
        type: 'exposition' as StoryPointType,
        title: 'Game Recovery',
        content: `You find yourself in a dusty saloon, trying to remember how you got here. The bartender nods as you approach.`,
        choices: [],
      },
      availableChoices: [],
      visitedPoints: ['error_recovery'],
      narrativeHistory: [`You find yourself in a dusty saloon, trying to remember how you got here. The bartender nods as you approach.`],
      displayMode: 'standard' as NarrativeDisplayMode,
      context: "",
    },
    location: { type: 'town' as const, name: 'Recovery Town' },
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: [
      { id: 'error-recovery-1', title: "Talk to the bartender", description: "Ask about the town", type: 'optional' },
      { id: 'error-recovery-2', title: "Order a drink", description: "Quench your thirst", type: 'optional' },
      { id: 'error-recovery-3', title: "Leave the saloon", description: "Explore elsewhere", type: 'optional' }
    ],
  } as GameState;
};

/**
 * Creates a final fallback state with generic suggestions
 * Used as a last resort when other recovery mechanisms fail
 * 
 * @param state - The current game state
 * @returns A game state with fallback suggestions
 */
export const createFinalFallbackState = (state: GameState): GameState => {
  return {
    ...state,
    suggestedActions: [
      { id: 'final-fallback-1', title: "Look around", description: "Survey your surroundings", type: 'optional' },
      { id: 'final-fallback-2', title: "Check your inventory", description: "See what you're carrying", type: 'optional' },
      { id: 'final-fallback-3', title: "Ask for directions", description: "Find out where to go", type: 'optional' }
    ],
  } as GameState;
};
