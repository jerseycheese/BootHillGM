/**
 * GameStorage utility
 * 
 * Centralized utility for accessing game-related data from localStorage
 * with fallback and resilience mechanisms.
 * 
 * This utility helps ensure that components can retrieve critical game data
 * even when state initialization is incomplete or fragmented.
 */

import { Character } from '../types/character';
import { GameState } from '../types/gameState';
import { CharacterState, initialCharacterState } from '../types/state/characterState';
import { SuggestedAction } from '../types/campaign';
import { JournalEntry } from '../types/journal';
import { NarrativeState } from '../types/narrative.types'; // Import NarrativeState
import { InventoryItem } from '../types/item.types';

export const GameStorage = {
  // Key mappings for all game-related localStorage entries
  keys: {
    GAME_STATE: 'saved-game-state',
    CAMPAIGN_STATE: 'campaignState',
    NARRATIVE_STATE: 'narrativeState',
    CHARACTER_PROGRESS: 'character-creation-progress',
    INITIAL_NARRATIVE: 'initial-narrative',
    COMPLETED_CHARACTER: 'completed-character',
    LAST_CHARACTER: 'lastCreatedCharacter'
  },
  
  /**
   * Get character data from any available source with type checking
   * @returns Character state with proper structure or null
   */
  getCharacter: (): CharacterState => {
    if (typeof window === 'undefined') return initialCharacterState;
    
    // Try all possible sources for character data
    const sources = [
      GameStorage.keys.GAME_STATE,
      GameStorage.keys.CAMPAIGN_STATE,
      GameStorage.keys.CHARACTER_PROGRESS,
      GameStorage.keys.COMPLETED_CHARACTER,
      GameStorage.keys.LAST_CHARACTER
    ];
    
    // First, try to get character using the new CharacterState structure
    for (const source of sources) {
      const data = localStorage.getItem(source);
      if (!data) continue;
      
      try {
        const parsed = JSON.parse(data);
        
        // Look for character.player structure (new format)
        if (parsed.character && 
            typeof parsed.character === 'object' && 
            'player' in parsed.character &&
            parsed.character.player) {
          return {
            player: parsed.character.player,
            opponent: parsed.character.opponent
          };
        }
      } catch (e) {
        console.error(`Error parsing ${source} for character state:`, e);
      }
    }
    
    // Second pass: look for direct character object
    let playerCharacter: Character | null = null;
    
    for (const source of sources) {
      const data = localStorage.getItem(source);
      if (!data) continue;
      
      try {
        const parsed = JSON.parse(data);
        
        // Character is directly in source
        if (source === GameStorage.keys.CHARACTER_PROGRESS || 
            source === GameStorage.keys.COMPLETED_CHARACTER ||
            source === GameStorage.keys.LAST_CHARACTER) {
          
          // Check if it has the expected Character structure
          if (parsed && 
              typeof parsed === 'object' && 
              'attributes' in parsed) {
            playerCharacter = parsed;
            break;
          }
        }
        // Character is inside a nested property
        else if (parsed.character && 
                typeof parsed.character === 'object' && 
                'attributes' in parsed.character) {
          playerCharacter = parsed.character;
          break;
        }
      } catch (e) {
        console.error(`Error parsing ${source} for player character:`, e);
      }
    }
    
    // If we found a player character, return proper CharacterState
    if (playerCharacter) {
      return {
        player: playerCharacter,
        opponent: null
      };
    }
    
    // Return default character if nothing found
    return initialCharacterState;
  },
  
  /**
   * Get narrative text from any available source
   * @returns Narrative text string or empty string
   */
  getNarrativeText: (): string => {
    if (typeof window === 'undefined') return '';
    
    // Try all possible sources for narrative data
    const sources = [
      GameStorage.keys.NARRATIVE_STATE,
      GameStorage.keys.INITIAL_NARRATIVE,
      GameStorage.keys.GAME_STATE,
      GameStorage.keys.CAMPAIGN_STATE
    ];
    
    for (const source of sources) {
      const data = localStorage.getItem(source);
      if (!data) continue;
      
      try {
        const parsed = JSON.parse(data);
        
        // Check different narrative structures
        if (source === GameStorage.keys.NARRATIVE_STATE) {
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((entry: Record<string, unknown>) => entry.text || '').join('\n');
          }
          if (parsed.narrative || parsed.narrativeHistory) {
            const narrativeArray = parsed.narrativeHistory || 
                                  parsed.narrative || 
                                  [];
            if (Array.isArray(narrativeArray)) {
              return narrativeArray.join('\n');
            }
          }
        } 
        
        else if (source === GameStorage.keys.INITIAL_NARRATIVE) {
          if (typeof parsed === 'string') {
            return parsed;
          }
          if (parsed.narrative && typeof parsed.narrative === 'string') {
            return parsed.narrative;
          }
        } 
        
        else if (source === GameStorage.keys.GAME_STATE || 
                 source === GameStorage.keys.CAMPAIGN_STATE) {
          
          if (parsed.narrative) {
            if (typeof parsed.narrative === 'string') {
              return parsed.narrative;
            }
            
            // Check for nested narrative structures
            const narrativeData = parsed.narrative;
            if (narrativeData.narrativeHistory && 
                Array.isArray(narrativeData.narrativeHistory)) {
              return narrativeData.narrativeHistory.join('\n');
            }
            
            if (narrativeData.initialNarrative && 
                typeof narrativeData.initialNarrative === 'string') {
              return narrativeData.initialNarrative;
            }
          }
        }
      } catch (e) {
        console.error(`Error parsing ${source} for narrative:`, e);
      }
    }
    
    // Return default narrative if nothing found
    return 'Your adventure begins in the rugged frontier town of Boot Hill...';
  },
  
  /**
   * Get suggested actions from any available source
   * @returns Array of suggested actions
   */
  getSuggestedActions: (): SuggestedAction[] => {
    if (typeof window === 'undefined') return [];
    
    // Try all possible sources for suggested actions
    const sources = [
      GameStorage.keys.GAME_STATE,
      GameStorage.keys.CAMPAIGN_STATE
    ];
    
    for (const source of sources) {
      const data = localStorage.getItem(source);
      if (!data) continue;
      
      try {
        const parsed = JSON.parse(data);
        
        if (parsed.suggestedActions && 
            Array.isArray(parsed.suggestedActions) && 
            parsed.suggestedActions.length > 0) {
          return parsed.suggestedActions;
        }
      } catch (e) {
        console.error(`Error parsing ${source} for suggested actions:`, e);
      }
    }
    
    // Return default actions with a variety of types to test all styling
    return [
      { 
        id: 'action-look-around', 
        title: 'Look around', 
        description: 'Examine your surroundings to get a better sense of where you are.', 
        type: 'basic'
      },
      { 
        id: 'action-check-inventory', 
        title: 'Check inventory', 
        description: 'Take stock of what you have with you.', 
        type: 'main'
      },
      { 
        id: 'action-talk-to-someone', 
        title: 'Find someone to talk to', 
        description: 'Look for another person to interact with.', 
        type: 'interaction'
      },
      { 
        id: 'action-explore', 
        title: 'Explore the area', 
        description: 'Move around to discover what\'s nearby.', 
        type: 'side'
      },
      { 
        id: 'action-challenge-stranger', 
        title: 'Challenge a stranger', 
        description: 'Pick a fight with someone you don\'t know.', 
        type: 'chaotic'
      }
    ];
  },
  
  /**
   * Get journal entries from any available source
   * @returns Array of journal entries
   */
  getJournalEntries: (): JournalEntry[] => {
    if (typeof window === 'undefined') return [];
    
    // Try all possible sources for journal entries
    const sources = [
      GameStorage.keys.GAME_STATE,
      GameStorage.keys.CAMPAIGN_STATE
    ];
    
    for (const source of sources) {
      const data = localStorage.getItem(source);
      if (!data) continue;
      
      try {
        const parsed = JSON.parse(data);
        
        // Check different journal structures
        if (parsed.journal) {
          if (Array.isArray(parsed.journal)) {
            return parsed.journal;
          }
          
          if (typeof parsed.journal === 'object' && 
              'entries' in parsed.journal && 
              Array.isArray(parsed.journal.entries)) {
            return parsed.journal.entries;
          }
        }
      } catch (e) {
        console.error(`Error parsing ${source} for journal entries:`, e);
      }
    }
    
    // Return empty array if nothing found
    return [];
  },
  
  /**
   * Save the entire game state
   * @param gameState The complete game state to save
   */
  saveGameState: (gameState: Record<string, unknown>): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Save the complete game state
      localStorage.setItem(GameStorage.keys.GAME_STATE, JSON.stringify(gameState));
      
      // Also save campaign state for backward compatibility
      localStorage.setItem(GameStorage.keys.CAMPAIGN_STATE, JSON.stringify(gameState));
      
      // Save individual components for backward compatibility
      if (gameState.character) {
        const characterData = 'player' in (gameState.character as Record<string, unknown>)
          ? (gameState.character as Record<string, unknown>).player
          : gameState.character;
          
        if (characterData) {
          localStorage.setItem(
            GameStorage.keys.CHARACTER_PROGRESS, 
            JSON.stringify({ character: characterData })
          );
        }
      }
      
      // Save narrative state if present
      if (gameState.narrative && typeof gameState.narrative === 'object') {
        const narrativeObj = gameState.narrative as Record<string, unknown>;
        const narrativeHistory = 'narrativeHistory' in narrativeObj
          ? narrativeObj.narrativeHistory
          : [];
          
        if (narrativeHistory && Array.isArray(narrativeHistory)) {
          localStorage.setItem(
            GameStorage.keys.NARRATIVE_STATE, 
            JSON.stringify(narrativeHistory)
          );
        }
      }
    } catch (e) {
      console.error('Error saving game state:', e);
    }
  },
  
  /**
   * Get default starting inventory items
   * @returns Array of default inventory items
   */
  getDefaultInventoryItems: (): InventoryItem[] => {
    return [
      {
        id: `item-${Date.now()}-1`,
        name: "Canteen",
        description: "A dented metal canteen for carrying water",
        quantity: 1,
        category: "general" // Use 'category' instead of 'type'
      },
      {
        id: `item-${Date.now()}-2`,
        name: "Bandana",
        description: "A faded red bandana",
        quantity: 1,
        category: "general" // Use 'category' instead of 'type'
      },
      {
        id: `item-${Date.now()}-3`,
        name: "Pocket Knife",
        description: "A small folding knife",
        quantity: 1,
        category: "general" // Use 'category' instead of 'type'
      }
    ];
  },
  
  /**
   * Initialize a new game state with proper defaults
   * @returns Initialized game state
   */
  initializeNewGame: (): Partial<GameState> => {
    if (typeof window === 'undefined') return {};
    
    try {
      // Create default character structure with starting inventory items
      const characterState: CharacterState = {
        player: {
          isNPC: false,
          isPlayer: true,
          id: `player-${Date.now()}`,
          name: 'New Character',
          inventory: { 
            items: GameStorage.getDefaultInventoryItems()
          },
          attributes: {
            speed: 12,
            gunAccuracy: 12,
            throwingAccuracy: 12,
            strength: 12,
            baseStrength: 12,
            bravery: 12,
            experience: 0
          },
          minAttributes: {
            speed: 1,
            gunAccuracy: 1,
            throwingAccuracy: 1,
            strength: 8,
            baseStrength: 8,
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
            experience: 11
          },
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      };
      
      // Create default narratives
      // Create a fully compliant NarrativeState object
      const narrativeState: NarrativeState = {
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        narrativeHistory: [
          'Your adventure begins in the rugged frontier town of Boot Hill...',
          'The dusty streets are lined with wooden buildings, a saloon, and a general store.',
          'What would you like to do?'
        ],
        displayMode: 'standard',
        context: '',
        needsInitialGeneration: true,
        // Add other required fields from NarrativeState if necessary (e.g., lore, storyProgression)
        lore: undefined, // Or initialLoreState
        storyProgression: undefined, // Or initialStoryProgressionState
        currentDecision: undefined,
        error: null,
        selectedChoice: undefined,
        narrativeContext: undefined,
      };
      
      // Default suggested actions with varied types to showcase different button styles
      const suggestedActions: SuggestedAction[] = [
        {
          id: 'action-look-around',
          title: 'Look around',
          description: 'Examine your surroundings to get a better sense of where you are.',
          type: 'basic'
        },
        {
          id: 'action-check-inventory',
          title: 'Check inventory',
          description: 'Take stock of what you have with you.',
          type: 'main'
        },
        {
          id: 'action-talk-to-someone',
          title: 'Find someone to talk to',
          description: 'Look for another person to interact with.',
          type: 'interaction'
        },
        {
          id: 'action-explore',
          title: 'Explore the area',
          description: 'Move around to discover what\'s nearby.',
          type: 'side'
        },
        {
          id: 'action-challenge-stranger',
          title: 'Challenge a stranger',
          description: 'Pick a fight with someone you don\'t know.',
          type: 'chaotic'
        }
      ];
      
      // Create partial game state with all critical components
      const newGameState: Partial<GameState> = {
        character: characterState,
        narrative: narrativeState,
        suggestedActions: suggestedActions,
        currentPlayer: characterState.player?.name || 'New Character',
        isClient: true,
        savedTimestamp: Date.now()
      };
      
      // Save to localStorage
      localStorage.setItem(
        GameStorage.keys.GAME_STATE, 
        JSON.stringify(newGameState)
      );
      
      // Also save individual components for backward compatibility
      localStorage.setItem(
        GameStorage.keys.CHARACTER_PROGRESS, 
        JSON.stringify({ character: characterState.player })
      );
      
      localStorage.setItem(
        GameStorage.keys.NARRATIVE_STATE, 
        JSON.stringify(narrativeState.narrativeHistory)
      );
      
      localStorage.setItem(
        GameStorage.keys.INITIAL_NARRATIVE, 
        JSON.stringify({ narrative: narrativeState.narrativeHistory[0] })
      );
      
      localStorage.setItem(
        GameStorage.keys.CAMPAIGN_STATE, 
        JSON.stringify(newGameState)
      );
      
      return newGameState;
    } catch (e) {
      console.error('Error initializing new game:', e);
      return {};
    }
  }
};

export default GameStorage;
