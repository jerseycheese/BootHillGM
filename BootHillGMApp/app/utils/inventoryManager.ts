import { InventoryItem, ItemCategory, createInventoryItem } from '../types/item.types';
import { ItemValidationResult } from '../types/validation.types';
import { Character } from '../types/character';
import { GameState } from '../types/gameState'; // Import GameState
import { LocationType } from '../services/locationService';

/**
 * Manages inventory-related operations including item validation and usage prompts.
 * Handles validation of item requirements based on character stats, location,
 * and combat state restrictions.
 */

// Type guard to check if an object is a LocationType
function isLocationType(location: unknown): location is LocationType {
  if (typeof location !== 'object' || location === null) {
    return false;
  }
  const loc = location as Record<string, unknown>;
  if (typeof loc.type !== 'string') {
    return false;
  }
  // Check for required properties based on type
  switch (loc.type) {
    case 'town':
    case 'landmark':
      return typeof loc.name === 'string';
    case 'wilderness':
      // Wilderness might only have a description, not necessarily a name
      return typeof loc.description === 'string';
    case 'unknown':
      // Unknown type might not have other properties
      return true;
    default:
      // Unrecognized type
      return false;
  }
}

// Removed outdated isCampaignState type guard

export class InventoryManager {
  /**
   * Determines the category of an item based on its properties.
   */
  static determineItemCategory(item: InventoryItem): ItemCategory {
    if (item.category) {
      return item.category;
    }

    if (InventoryManager.determineIfWeapon(item)) {
      return 'weapon';
    }

    if (item.effect?.type === 'heal' || item.category === 'medical') {
      return 'medical';
    }

    return 'general';
  }

  static determineIfWeapon(item: InventoryItem): boolean {
    return !!item.weapon;
  }

  /**
   * Validates whether an item can be used based on:
   * - Item existence and quantity
   * - Character strength requirements
   * - Location restrictions
   * - Combat-only limitations
   */
  static validateItemUse(
    item: InventoryItem,
    character: Character | undefined,
    gameState: GameState // Updated to use GameState
  ): ItemValidationResult {
    // Removed check for outdated isCampaignState

    if (!item) {
      return { valid: false, reason: 'Item not found' };
    }

    if (item.quantity <= 0) {
      return { valid: false, reason: 'Item not available' };
    }

    // Check if character is defined before accessing its properties
    if (character && item.requirements) {
      const { requirements } = item;

      if (requirements.minStrength &&
        character.attributes.strength < requirements.minStrength) {
        return {
          valid: false,
          reason: `Requires ${requirements.minStrength} strength`,
        };
      }

      // Check location requirements using GameState structure
      if (requirements.location && gameState.location // Check if location exists
        && isLocationType(gameState.location) // Ensure it's a valid LocationType
        && gameState.location.type === 'town' // Check if it's a town
        && !requirements.location.includes(gameState.location.name)) { // Check if town name is allowed
        return {
          valid: false,
          reason: 'Cannot use this item here'
        };
      }

      if (requirements.combatOnly && !gameState.combat.isActive) { // Check combat status via combat slice
        return {
          valid: false,
          reason: 'Can only be used during combat'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Generates an appropriate use prompt for items based on their type and effects.
   * Custom prompts can be defined per item, otherwise defaults based on item type.
   */
  static getItemUsePrompt(item: InventoryItem): string {
    if (item.usePrompt) {
      return item.usePrompt;
    }

    if (item.effect?.type === 'heal') {
      return `use ${item.name} to restore strength`;
    }

    return `use ${item.name}`;
  }

  /**
   * Adds an item to the character's inventory.
   * @param item - The item to add.
   */
  static addItem(item: InventoryItem): void {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const existingItem = inventory.find((i: InventoryItem) => i.id === item.id);

    if (existingItem) {
      const newCategory = InventoryManager.determineItemCategory(item);
      existingItem.category = newCategory;
      existingItem.quantity += item.quantity;
    } else {
      const newItem = { ...createInventoryItem(item) };
      const newCategory = InventoryManager.determineItemCategory(item);
      newItem.category = newCategory
      inventory.push(newItem);
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
  }

  /**
   * Clears the inventory from local storage.
   */
  static clearInventory(): void {
    localStorage.removeItem('inventory');
  }

  /**
   * Retrieves an item from the character's inventory by its ID.
   * @param id - The ID of the item to retrieve.
   * @returns The item if found, otherwise undefined.
   */
  static getItem(id: string): InventoryItem | undefined {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    return inventory.find((item: InventoryItem) => item.id === id);
  }

  /**
   * Equips a weapon to the character.
   * @param character - The character to equip the weapon to.
   * @param item - The weapon item to equip.
   */
  static equipWeapon(character: Character, item: InventoryItem): void {
    if (item.category !== 'weapon') {
      return;
    }

    // First unequip any currently equipped weapons
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    inventory.forEach((invItem: InventoryItem) => {
      if (invItem.category === 'weapon') {
        invItem.isEquipped = false;
      }
    });

    // Find and equip the new weapon
    const weaponToEquip = inventory.find((i: InventoryItem) => i.id === item.id);
    if (weaponToEquip) {
      weaponToEquip.isEquipped = true;
      character.equippedWeapon = weaponToEquip; // Update character's equipped weapon
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
  }

  /**
   * Unequips the current weapon from the character.
   */
  static unequipWeapon(): void {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    inventory.forEach((item: InventoryItem) => {
      if (item.category === 'weapon') {
        item.isEquipped = false;
      }
    });
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }
}
