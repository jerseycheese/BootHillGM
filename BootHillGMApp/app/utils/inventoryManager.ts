import { InventoryItem, ItemValidationResult } from '../types/inventory';
import { Character } from '../types/character';
import { CampaignState } from '../types/campaign';

/**
 * Manages inventory-related operations including item validation and usage prompts.
 * Handles validation of item requirements based on character stats, location,
 * and combat state restrictions.
 */
export class InventoryManager {
  /**
   * Validates whether an item can be used based on:
   * - Item existence and quantity
   * - Character strength requirements
   * - Location restrictions
   * - Combat-only limitations
   */
  static validateItemUse(
    item: InventoryItem,
    character: Character,
    gameState: CampaignState & { isCombatActive: boolean }
  ): ItemValidationResult {
    if (!item) {
      return { valid: false, reason: 'Item not found' };
    }

    if (item.quantity <= 0) {
      return { valid: false, reason: 'Item not available' };
    }

    if (item.requirements) {
      const { requirements } = item;

      if (requirements.minStrength && 
          character.attributes.strength < requirements.minStrength) {
        return {
          valid: false,
          reason: `Requires ${requirements.minStrength} strength`
        };
      }

      if (requirements.location && 
          !requirements.location.includes(gameState.location)) {
        return {
          valid: false,
          reason: 'Cannot use this item here'
        };
      }

      if (requirements.combatOnly && !gameState.isCombatActive) {
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
      existingItem.quantity += item.quantity;
    } else {
      inventory.push(item);
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
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
    console.log('Item being equipped:', item);
    console.log('Character equipped weapon before:', character.equippedWeapon);

    if (item.category !== 'weapon') {
      console.error('Item is not a valid weapon');
      return;
    }

    character.equippedWeapon = item;

    console.log('Character equipped weapon after:', character.equippedWeapon);
  }

  /**
   * Unequips the current weapon from the character.
   * @param character - The character to unequip the weapon from.
   */
  static unequipWeapon(character: Character): void {
    character.equippedWeapon = undefined;
  }
}
