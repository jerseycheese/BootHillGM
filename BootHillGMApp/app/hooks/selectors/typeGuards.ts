import { InventoryItem } from '../../types/item.types';
import { JournalEntry } from '../../types/journal';
import { Character } from '../../types/character';

/**
 * Safely extracts inventory items from various state structures.
 * Handles both the legacy array format and the new object format for inventory state.
 * This is to maintain backward compatibility during the state refactoring transition.
 *
 * **Legacy Format:** `InventoryItem[]` - Inventory was directly an array.
 * **New Format:** `{ items: InventoryItem[] }` - Inventory is now an object with an 'items' property.
 *
 * @param inventory - The inventory object from state
 * @returns An array of inventory items or an empty array if unavailable
 * @see Docs/technical-guides/state-compatibility.md for details on state format transition.
 */
export const getItemsFromInventory = (inventory: unknown): InventoryItem[] => {
  // Handle undefined or null
  if (!inventory) return [];

  // Handle inventory object with items property
  if (typeof inventory === 'object' && inventory !== null && 'items' in inventory) {
    const items = (inventory as { items: unknown }).items;
    // Make sure items is an array
    return Array.isArray(items) ? items : [];
  }

  // Handle case where inventory is directly an array
  if (Array.isArray(inventory)) {
    return inventory;
  }

  // Default to empty array for any other case
  return [];
};

/**
 * Safely extracts journal entries from various state structures.
 * Handles both old and new state shapes to ensure backward compatibility.
 *
 * @param journal - The journal object from state
 * @returns An array of journal entries or an empty array if unavailable
 */
export const getEntriesFromJournal = (journal: unknown): JournalEntry[] => {
  // Handle undefined or null
  if (!journal) return [];

  // Handle journal object with entries property
  if (typeof journal === 'object' && journal !== null && 'entries' in journal) {
    const entries = (journal as { entries: unknown }).entries;
    // Make sure entries is an array
    return Array.isArray(entries) ? entries : [];
  }

  // Handle case where journal is directly an array
  if (Array.isArray(journal)) {
    return journal;
  }

  // Default to empty array for any other case
  return [];
};

/**
 * Safely extracts player character from various state structures.
 * Handles both old and new state shapes to ensure backward compatibility.
 *
 * @param state - The campaign state object
 * @returns The player character or null if unavailable
 */
export const getPlayerFromState = (state: unknown) => {
  // Handle undefined or null state
  if (!state) return null;

  // Handle new state structure with character.player
  if (typeof state === 'object' && state !== null) {
    const stateObj = state as Record<string, unknown>;

    if (stateObj.character &&
        typeof stateObj.character === 'object' &&
        stateObj.character !== null &&
        'player' in stateObj.character) {
      return (stateObj.character as { player: unknown }).player;
    }

    // Handle old state structure with player at root level
    if ('player' in stateObj) {
      return stateObj.player;
    }
  }

  // Default to null for any other case
  return null;
};

/**
 * Safely extracts opponent character from various state structures.
 * Handles both old and new state shapes to ensure backward compatibility.
 *
 * @param state - The campaign state object
 * @returns The opponent character or null if unavailable
 */
export const getOpponentFromState = (state: unknown) => {
  // Handle undefined or null state
  if (!state) return null;

  // Handle new state structure with combat.opponent
  if (typeof state === 'object' && state !== null) {
    const stateObj = state as Record<string, unknown>;

    if (stateObj.combat &&
        typeof stateObj.combat === 'object' &&
        stateObj.combat !== null &&
        'opponent' in stateObj.combat) {
      return (stateObj.combat as { opponent: unknown }).opponent;
    }

    // Handle old state structure with opponent at root level
    if ('opponent' in stateObj) {
      return stateObj.opponent;
    }
  }

  // Default to null for any other case
  return null;
};

/**
 * Extracts the player information from a character object.
 * Used to determine if a character is a player character and access player data.
 *
 * @param character - The character object to extract player from
 * @returns The player character if this is a player character, or undefined if not
 */
export const getPlayerFromCharacter = (character: unknown): Character | undefined => {
  // Handle undefined or null character
  if (!character) return undefined;

  // Handle character object with player property
  if (typeof character === 'object' && character !== null) {
    const characterObj = character as Record<string, unknown>;

    // Direct player property (new structure)
    if ('player' in characterObj && characterObj.player) {
      return characterObj.player as Character;
    }

    // Check if character itself is a player (old structure)
    if ('isPlayer' in characterObj && characterObj.isPlayer === true) {
      return characterObj as unknown as Character;
    }
  }

  // Not a player character
  return undefined;
};
