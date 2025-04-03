import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
import GameStorage from '../utils/gameStorage';

interface RestoreStateOptions {
  isInitializing: boolean;
  savedStateJSON: string | null;
}

/**
 * Hook for restoring game state from storage with proper type conversion.
 * Handles both new game initialization and saved game restoration.
 * 
 * Key responsibilities:
 * - Proper type conversion of saved data
 * - Deep copying of complex objects (inventory, combat state)
 * - Validation of restored data
 * - Error handling for corrupt or invalid saves
 * - Fallback to localStorage for missing state data
 * 
 * Used by CampaignStateManager to handle state initialization.
 */
export const useCampaignStateRestoration = ({ 
  isInitializing, 
  savedStateJSON 
}: RestoreStateOptions): GameState => {
  // Initialize with proper structure for new games
  if (isInitializing) {
    // Get initial character state from any saved progress or create new
    const characterState = GameStorage.getCharacter();
    
    // Ensure character has inventory items
    if (characterState.player && 
        (!characterState.player.inventory || 
         !characterState.player.inventory.items || 
         characterState.player.inventory.items.length === 0)) {
      characterState.player.inventory = {
        items: GameStorage.getDefaultInventoryItems()
      };
    }
    
    // Return initial state with character data and narrative generation flag
    return {
      ...initialGameState,
      isClient: true,
      character: characterState,
      narrative: {
        ...initialGameState.narrative,
        narrativeHistory: [
          'Your adventure begins in the rugged frontier town of Boot Hill...',
          'The dusty streets are lined with wooden buildings, a saloon, and a general store.',
          'What would you like to do?'
        ],
        needsInitialGeneration: true // Flag to trigger AI narrative generation
      },
      suggestedActions: GameStorage.getSuggestedActions()
    };
  }

  if (!savedStateJSON) {
    console.warn('No saved state found, attempting to recover from localStorage');
    
    // Try to reconstruct from fragmented localStorage
    // Get character from any available source
    const characterState = GameStorage.getCharacter();
    
    // Ensure character has inventory items
    if (characterState.player && 
        (!characterState.player.inventory || 
         !characterState.player.inventory.items || 
         characterState.player.inventory.items.length === 0)) {
      characterState.player.inventory = {
        items: GameStorage.getDefaultInventoryItems()
      };
    }
    
    // Return initial state with recovered data and narrative generation flag
    return {
      ...initialGameState,
      isClient: true,
      character: characterState,
      narrative: {
        ...initialGameState.narrative,
        narrativeHistory: [GameStorage.getNarrativeText()],
        needsInitialGeneration: true // Flag to trigger AI narrative generation
      },
      suggestedActions: GameStorage.getSuggestedActions()
    };
  }

  try {
    let savedState: unknown;
    try {
      savedState = JSON.parse(savedStateJSON);
    } catch (e) {
      console.error('Error parsing saved state:', e);
      
      // Recover what we can from localStorage
      const characterState = GameStorage.getCharacter();
      
      // Ensure character has inventory items
      if (characterState.player && 
          (!characterState.player.inventory || 
           !characterState.player.inventory.items || 
           characterState.player.inventory.items.length === 0)) {
        characterState.player.inventory = {
          items: GameStorage.getDefaultInventoryItems()
        };
      }
      
      // Return initial state with recovered data
      return {
        ...initialGameState,
        isClient: true,
        character: characterState,
        narrative: {
          ...initialGameState.narrative,
          narrativeHistory: [GameStorage.getNarrativeText()],
          needsInitialGeneration: true // Flag to trigger AI narrative generation
        },
        suggestedActions: GameStorage.getSuggestedActions()
      };
    }
    
    // Process the state with adapters to ensure backward compatibility 
    const normalizedState = savedState as Partial<GameState>;
    
    // Check if we need to trigger narrative generation
    const needsNarrativeGeneration = 
      !normalizedState.narrative || 
      !normalizedState.narrative.narrativeHistory || 
      normalizedState.narrative.narrativeHistory.length <= 1 || 
      normalizedState.narrative.narrativeHistory[0] === 'Your adventure begins in the rugged frontier town of Boot Hill...';
    
    // Check if combat has isActive property to avoid property access error
    const combatIsActive = Boolean(normalizedState.combat?.isActive);

    // Ensure character state is properly structured
    let characterState = normalizedState.character 
      ? (typeof normalizedState.character === 'object' && 'player' in normalizedState.character
          ? normalizedState.character
          : { player: normalizedState.character, opponent: null })
      : null;
    
    // If character state is still null, try to recover from localStorage
    if (!characterState || !characterState.player) {
      console.log('Character state missing or invalid, attempting recovery from localStorage');
      characterState = GameStorage.getCharacter();
    }
    
    // Inventory check will be done after merging below

    // Merge the loaded state with initial state to ensure all properties exist
    const restoredState: GameState = {
      ...initialGameState,
      ...normalizedState,
      // Ensure nested slices are also merged correctly
      character: characterState,
      combat: {
        ...initialGameState.combat,
        ...(normalizedState.combat || {}),
        // Ensure isActive is correctly set based on loaded data
        isActive: combatIsActive,
      },
      inventory: {
        ...initialGameState.inventory,
        ...(normalizedState.inventory || {}),
      },
      journal: {
        ...initialGameState.journal,
        ...(normalizedState.journal || {}),
      },
      narrative: {
        ...initialGameState.narrative,
        ...(normalizedState.narrative || {}),
        // Add flag to trigger narrative generation if needed
        needsInitialGeneration: needsNarrativeGeneration
      },
      ui: {
        ...initialGameState.ui,
        ...(normalizedState.ui || {}),
      },
      // Ensure suggested actions are available
      suggestedActions: normalizedState.suggestedActions || GameStorage.getSuggestedActions(),
      // Ensure isClient and savedTimestamp are correctly set
      isClient: true,
      savedTimestamp: typeof normalizedState.savedTimestamp === 'number'
        ? normalizedState.savedTimestamp
        : Date.now(),
    };
    
    // Ensure character has inventory items AFTER merging state
    // This prevents loaded empty inventory from overwriting defaults
    if (restoredState.character?.player &&
        (!restoredState.character.player.inventory ||
         !restoredState.character.player.inventory.items ||
         restoredState.character.player.inventory.items.length === 0)) {
      // Ensure inventory object exists before assigning items
      if (!restoredState.character.player.inventory) {
          restoredState.character.player.inventory = { items: [] };
      }
      restoredState.character.player.inventory.items = GameStorage.getDefaultInventoryItems();
    }
    return restoredState;
    
  } catch (error) {
    console.error('Error restoring state:', error);
    
    // Recovery path for error cases
    // Get character from any available source
    const characterState = GameStorage.getCharacter();
    
    // Ensure character has inventory items
    if (characterState.player && 
        (!characterState.player.inventory || 
         !characterState.player.inventory.items || 
         characterState.player.inventory.items.length === 0)) {
      characterState.player.inventory = {
        items: GameStorage.getDefaultInventoryItems()
      };
    }
    
    // Return initial state with recovered data
    return {
      ...initialGameState,
      isClient: true,
      character: characterState,
      narrative: {
        ...initialGameState.narrative,
        narrativeHistory: [GameStorage.getNarrativeText()],
        needsInitialGeneration: true // Flag to trigger AI narrative generation
      },
      suggestedActions: GameStorage.getSuggestedActions()
    };
  }
};
