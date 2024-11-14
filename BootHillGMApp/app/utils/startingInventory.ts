import { InventoryItem } from '../types/inventory';

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
 * Creates a randomized selection of starting inventory items for new characters.
 * Returns 4-5 non-combat items appropriate for the Western setting.
 */
export function getStartingInventory(): InventoryItem[] {
  // Randomly select 4-5 items from the starting items list
  const numItems = Math.floor(Math.random() * 2) + 4; // 4 or 5 items
  const selectedItems = [...STARTING_ITEMS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numItems);

  // Generate unique IDs for each item
  return selectedItems.map(item => ({
    ...item,
    id: `starting_${item.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
  }));
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
