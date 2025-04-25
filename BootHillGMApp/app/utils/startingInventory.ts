import { InventoryItem } from '../types/item.types';

/**
 * Provides a curated set of period-appropriate starting items for new characters.
 * Each item represents common gear a frontier character would reasonably possess.
 */
const STARTING_ITEMS: Omit<InventoryItem, 'id'>[] = [
  {
    name: 'Leather Canteen',
    quantity: 1,
    description: 'A sturdy canteen for carrying water, essential for survival in the frontier.',
    category: 'general'
  },
  {
    name: 'Hemp Rope (50ft)',
    quantity: 1,
    description: 'Strong rope useful for climbing, tying up horses, or securing loads.',
    category: 'general'
  },
  {
    name: 'Matchbox',
    quantity: 1,
    description: 'A box of waterproof matches for starting fires or lighting lamps.',
    category: 'general'
  },
  {
    name: 'Wool Blanket',
    quantity: 1,
    description: 'A warm blanket for cold nights on the trail or rough sleeping in towns.',
    category: 'general'
  },
  {
    name: 'Tobacco Pouch',
    quantity: 1,
    description: 'A small pouch of tobacco, useful for trade or socializing in saloons.',
    category: 'general'
  }
];

/**
 * Generates the default set of inventory items for a new character.
 * This function creates a standardized starting inventory containing basic
 * equipment needed for a new character to begin gameplay.
 * 
 * @returns {InventoryItem[]} An array of starting inventory items with 
 * appropriate properties (id, name, type, etc.) already configured.
 */
export function getStartingInventory(): InventoryItem[] {
  // Randomly select 4-5 items from the starting items list
  const numItems = Math.floor(Math.random() * 2) + 4; // 4 or 5 items
  const selectedItems = [...STARTING_ITEMS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numItems);

  // Generate unique IDs for each item
  const items = selectedItems.map(item => ({
    ...item,
    id: `starting_${item.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
  }));
  
  return items;
}

/**
 * Adds starting inventory items to a new character's game state.
 * Should be called during character creation finalization.
 */
interface AddItemAction {
  type: 'ADD_ITEM';
  payload: InventoryItem;
}

export function initializeCharacterInventory(dispatch: React.Dispatch<AddItemAction>) {
  const startingItems = getStartingInventory();
  startingItems.forEach(item => {
    dispatch({
      type: 'ADD_ITEM',
      payload: item
    });
  });
}
