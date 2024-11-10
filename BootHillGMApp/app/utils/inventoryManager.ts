import { InventoryItem, ItemValidationResult } from '../types/inventory';
import { GameState } from '../types/campaign';
import { Character } from '../types/character';

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
    gameState: GameState
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
}
