/**
 * Game Storage Service
 * 
 * Centralized service for managing game data persistence.
 * Provides methods for saving, loading, and managing various game data.
 */

import { GameState, initialGameState } from '../../types/gameState';
import { Character } from '../../types/character';
import { JournalEntry } from '../../types/journal';
import { InventoryItem } from '../../types/item.types';
import { SuggestedAction } from '../../types/campaign';

// Storage keys
const STORAGE_KEYS = {
  GAME_STATE: 'bhgm-game-state',
  PLAYER_CHARACTER: 'bhgm-player-character',
  OPPONENT: 'bhgm-opponent',
  INVENTORY: 'bhgm-inventory',
  JOURNAL: 'bhgm-journal',
  NARRATIVE: 'bhgm-narrative',
  SETTINGS: 'bhgm-settings',
  SUGGESTED_ACTIONS: 'bhgm-suggested-actions',
};

/**
 * GameStorage service for managing persistent game data
 */
const GameStorage = {
  /**
   * Save complete game state to localStorage
   */
  saveGameState: (state: GameState = initialGameState): void => {
    try {
      const serialized = JSON.stringify({ ...state, lastSaved: Date.now() });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
      }
    } catch (err) {
      console.error('Failed to save game state:', err);
    }
  },

  /**
   * Load complete game state from localStorage
   */
  getGameState: (): GameState | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        if (v) return JSON.parse(v);
      }
    } catch (err) {
      console.error('Failed to load game state:', err);
    }
    return null;
  },

  /**
   * Get character data from storage
   */
  getCharacter: (): { player: Character | null; opponent: Character | null } => {
    try {
      if (typeof localStorage !== 'undefined') {
        // Legacy support: check for character-creation-progress key
        const legacy = localStorage.getItem('character-creation-progress');
        if (legacy) {
          try {
            const data = JSON.parse(legacy);
            if (data && data.character) {
              return { player: data.character as Character, opponent: null };
            }
          } catch {
            // ignore parse errors
          }
        }
        const pj = localStorage.getItem(STORAGE_KEYS.PLAYER_CHARACTER);
        const oj = localStorage.getItem(STORAGE_KEYS.OPPONENT);
        return {
          player: pj ? JSON.parse(pj) : null,
          opponent: oj ? JSON.parse(oj) : null,
        };
      }
    } catch (err) {
      console.error('Failed to load character data:', err);
    }
    return { player: null, opponent: null };
  },

  /**
   * Get default character data
   */
  getDefaultCharacter: (): Character => {
    return {
      id: `character_${Date.now()}`,
      name: "Default Character",
      isNPC: false,
      isPlayer: true,
      inventory: {
        items: GameStorage.getDefaultInventoryItems()
      },
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
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
      isUnconscious: false,
      equippedWeapon: GameStorage.getDefaultInventoryItems().find(item => item.id === 'revolver' && item.isEquipped),
      strengthHistory: { changes: [], baseStrength: 10 }
    };
  },

  /**
   * Get narrative text from storage
   */
  getNarrativeText: (): string[] => {
    try {
      if (typeof localStorage !== 'undefined') {
        const j = localStorage.getItem(STORAGE_KEYS.NARRATIVE);
        return j ? JSON.parse(j) : [];
      }
    } catch (err) {
      console.error('Failed to load narrative:', err);
    }
    return [];
  },

  /**
   * Get journal entries from storage
   */
  getJournalEntries: (): JournalEntry[] => {
    try {
      if (typeof localStorage !== 'undefined') {
        const j = localStorage.getItem(STORAGE_KEYS.JOURNAL);
        return j ? JSON.parse(j) : [];
      }
    } catch (err) {
      console.error('Failed to load journal:', err);
    }
    return [];
  },

  /**
   * Get suggested actions from storage
   */
  getSuggestedActions: (): SuggestedAction[] => {
    try {
      if (typeof localStorage !== 'undefined') {
        const a = localStorage.getItem(STORAGE_KEYS.SUGGESTED_ACTIONS);
        return a ? JSON.parse(a) : [];
      }
    } catch (err) {
      console.error('Failed to load suggested actions:', err);
    }
    return [];
  },

  /**
   * Default inventory items
   */
  getDefaultInventoryItems: (): InventoryItem[] => [
    {
      id: 'revolver',
      name: 'Revolver',
      description: 'A standard six-shooter.',
      category: 'weapon',
      quantity: 1,
      isEquipped: true,
    },
    {
      id: 'ammo',
      name: 'Bullets',
      description: 'Ammunition for your firearms.',
      category: 'consumable',
      quantity: 24,
    },
    {
      id: 'bandages',
      name: 'Bandages',
      description: 'Used to treat wounds and stop bleeding.',
      category: 'consumable',
      quantity: 3,
    },
  ],

  /**
   * Initialize a new game with default values
   */
  initializeNewGame: (): GameState => {
    const defaultState: GameState = {
      ...initialGameState,
      inventory: { items: GameStorage.getDefaultInventoryItems(), equippedWeaponId: 'revolver' },
      suggestedActions: [],
    };
    GameStorage.saveGameState(defaultState);
    return defaultState;
  },

  /**
   * Clear all game data from storage
   */
  clearGameData: (): void => {
    if (typeof localStorage !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  },
};

export default GameStorage;