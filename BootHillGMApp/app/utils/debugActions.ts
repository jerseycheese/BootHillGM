import { GameEngineAction } from "../types/gameActions";
import { Character } from "../types/character";
import { initialNarrativeState } from "../types/narrative.types";
import { CharacterState } from "../types/state/characterState";
import { InventoryState } from "../types/state/inventoryState";
import { JournalState } from "../types/state/journalState";
import { CombatState } from "../types/state/combatState";
import { StoryPointType, NarrativeDisplayMode } from "../types/narrative.types";
import { getStartingInventory } from "../utils/startingInventory";
import { LocationType } from "../services/locationService";
import { SuggestedAction } from "../types/campaign";

// Define interface for suggested action from saved state
interface SavedSuggestedAction {
  text?: string;
  type?: 'basic' | 'inventory' | 'interaction';
  context?: string;
  [key: string]: unknown;
}

/**
 * Initializes a test combat scenario with a default opponent.
 * Sets up a basic brawling combat state.
 *
 * @returns {GameEngineAction} - The action to set the game state for test combat.
 */
export const initializeTestCombat = (): GameEngineAction => {
  const testOpponent: Character = {
    id: "test_opponent",
    name: "Test Opponent",
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      baseStrength: 5,
      bravery: 5,
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
    isNPC: true,
    isPlayer: false,
    inventory: { items: [] },
  };

  // Create a combat state object using the correct interface
  const combatState: CombatState = {
    rounds: 0,
    combatType: "brawling",
    isActive: true,
    // Adding required properties from CombatState interface
    playerTurn: true,
    playerCharacterId: "", // Will be filled in by gameReducer
    opponentCharacterId: "test_opponent",
    combatLog: [],
    roundStartTime: Date.now(),
    modifiers: {
      player: 0,
      opponent: 0
    },
    currentTurn: null
  };

  // Create a character state with player and opponent
  const characterState: CharacterState = {
    player: null, // Will be set by existing player in state
    opponent: testOpponent
  };

  return {
    type: "SET_STATE",
    payload: {
      // Use the domain-specific slices
      character: characterState,
      combat: combatState,
      isClient: true,
    },
  };
};

/**
 * Creates a base character object for testing.
 *
 * @param {string} id - The character's ID.
 * @param {string} name - The character's name.
 * @returns {Character} - A base character object.
 */
export const createBaseCharacter = (id: string, name: string): Character => {
  const minAttributes = {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 1,
      baseStrength: 1,
      bravery: 1,
      experience: 0
    };

  return {
    isNPC: false,
    isPlayer: true,
    id,
    name,
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
    minAttributes: minAttributes,
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
};

/**
 * Resets the game state to its initial values.
 * Retrieves the saved initial character and narrative from localStorage if available.
 *
 * @returns {GameEngineAction} - The action to reset the game state.
 */
export const resetGame = (): GameEngineAction => {
  // Clear the main persisted state
  localStorage.removeItem('campaignState');
  
  // Initialize variables for the reset state
  let initialCharacter = null;
  let initialNarrativeText = "";
  let initialSuggestedActions: SuggestedAction[] = [];
  
  try {
    // 1. First try to get the initial narrative text
    const initialNarrativeJSON = localStorage.getItem("initial-narrative");
    if (initialNarrativeJSON) {
      try {
        const parsed = JSON.parse(initialNarrativeJSON);
        // Handle both direct text storage and narrative object storage
        if (typeof parsed === 'string') {
          initialNarrativeText = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Try to extract from nested narrative property or from direct content
          initialNarrativeText = parsed.narrative || 
                               parsed.content || 
                               (parsed.currentStoryPoint && parsed.currentStoryPoint.content) || 
                               "";
        }
      } catch (e) {
        console.error("Failed to parse initial narrative:", e);
        // Set a default narrative as fallback
        initialNarrativeText = "You find yourself back at the beginning of your adventure in Boothill.";
      }
    }
    
    // If we still don't have initial narrative text, set a default
    if (!initialNarrativeText) {
      initialNarrativeText = "You find yourself back at the beginning of your adventure in Boothill.";
      
      // Save this narrative for future resets
      localStorage.setItem("initial-narrative", JSON.stringify({ narrative: initialNarrativeText }));
    }
    
    // 2. Try to get suggested actions from saved game state
    const savedGameStateJSON = localStorage.getItem("saved-game-state");
    if (savedGameStateJSON) {
      try {
        const savedGameState = JSON.parse(savedGameStateJSON);
        
        // Extract suggested actions if they exist and are in the expected format
        if (savedGameState && savedGameState.suggestedActions && 
            Array.isArray(savedGameState.suggestedActions)) {
          initialSuggestedActions = savedGameState.suggestedActions.map((action: SavedSuggestedAction) => ({
            text: action.text || "Default Action",
            type: action.type || 'basic',
            context: action.context || ""
          }));
        }
      } catch (e) {
        console.error("Failed to parse saved game state:", e);
      }
    }
    
    // If we still don't have suggested actions, create default ones
    if (!initialSuggestedActions || initialSuggestedActions.length === 0) {
      initialSuggestedActions = [
        { text: "Look around", type: 'basic', context: "Survey your surroundings" },
        { text: "Visit the saloon", type: 'basic', context: "Find a drink and information" },
        { text: "Check your gear", type: 'inventory', context: "Make sure you have everything" }
      ];
      
      // Save these for future resets
      try {
        const savedGameState = savedGameStateJSON ? JSON.parse(savedGameStateJSON) : {};
        savedGameState.suggestedActions = initialSuggestedActions;
        localStorage.setItem("saved-game-state", JSON.stringify(savedGameState));
      } catch (e) {
        console.error("Failed to save default suggested actions:", e);
      }
    }
    
    // 3. Get character data
    const savedCharacter = localStorage.getItem("character-creation-progress");
    if (savedCharacter) {
      try {
        const parsedData = JSON.parse(savedCharacter);
        initialCharacter = parsedData.character;
        
        // Validate the character to make sure it has the required properties
        if (!initialCharacter || 
            typeof initialCharacter !== 'object' || 
            !initialCharacter.attributes ||
            typeof initialCharacter.attributes.strength !== 'number') {
          
          // Character invalid or incomplete, create a new one
          initialCharacter = createBaseCharacter(`character_${Date.now()}`, 'Your Character');
        }
      } catch (e) {
        console.error("Failed to parse character data:", e);
        // Character parsing failed, create a new one
        initialCharacter = createBaseCharacter(`character_${Date.now()}`, 'Your Character');
      }
    } else {
      // No saved character, create a new one
      initialCharacter = createBaseCharacter(`character_${Date.now()}`, 'Your Character');
    }
    
  } catch (error) {
    console.error("Failed to retrieve initial game data:", error);
    // Set defaults for all properties in case of error
    initialCharacter = createBaseCharacter(`character_${Date.now()}`, 'Your Character');
    initialNarrativeText = "You find yourself back at the beginning of your adventure in Boothill.";
    initialSuggestedActions = [
      { text: "Look around", type: 'basic', context: "Survey your surroundings" },
      { text: "Visit the saloon", type: 'basic', context: "Find a drink and information" },
      { text: "Check your gear", type: 'inventory', context: "Make sure you have everything" }
    ];
  }
  
  // Create a fully-formed character state with the initial character
  const characterState: CharacterState = {
    player: initialCharacter,
    opponent: null
  };
  
  // Get starting inventory
  const startingInventory = getStartingInventory();
  
  // Create inventory state with starting inventory
  const inventoryState: InventoryState = {
    items: startingInventory
  };
  
  // Create journal state
  const journalState: JournalState = {
    entries: []
  };
  
  // Create empty combat state with all required properties
  const combatState: CombatState = {
    rounds: 0,
    combatType: 'brawling',
    isActive: false,
    playerTurn: true,
    playerCharacterId: initialCharacter ? initialCharacter.id : '',
    opponentCharacterId: '',
    combatLog: [],
    roundStartTime: 0,
    modifiers: {
      player: 0,
      opponent: 0
    },
    currentTurn: null
  };

  // Create a proper narrative state by spreading initialNarrativeState to ensure all properties are set
  const narrativeState = {
    ...initialNarrativeState,
    currentStoryPoint: {
      id: 'reset_intro',
      type: 'exposition' as StoryPointType,
      title: 'Introduction',
      content: initialNarrativeText,
      choices: [],
    },
    visitedPoints: ['reset_intro'],
    narrativeHistory: [initialNarrativeText],
    displayMode: 'standard' as NarrativeDisplayMode,
  };
  
  // Set default location for the reset state
  const initialLocation: LocationType = { type: 'town', name: 'Boothill' };

  // Create a complete payload for the reset action
  const payload = {
    // Domain-specific state slices
    character: characterState,
    inventory: inventoryState,
    journal: journalState,
    narrative: narrativeState,
    combat: combatState,
    
    // Top-level properties
    currentPlayer: initialCharacter ? initialCharacter.name : '',
    location: initialLocation,
    gameProgress: 0,
    npcs: [],
    quests: [],
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: initialSuggestedActions,
    
    // Additional flag to explicitly mark this as a reset operation
    isReset: true
  };
  
  return {
    type: "SET_STATE",
    payload: payload,
  };
};
