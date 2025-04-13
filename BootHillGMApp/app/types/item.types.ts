import { Weapon } from './weapon.types';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ItemCategory;
  requirements?: ItemRequirements;
  effect?: ItemEffect;
  usePrompt?: string;
  weapon?: Weapon;
  isEquipped?: boolean;
  // Add the extended properties to the base interface
  weight?: number;
  value?: number;
  durability?: number;
}

export function createInventoryItem(itemData: Omit<InventoryItem, 'category'>): InventoryItem {
  return {
    ...itemData,
    category: itemData.weapon ? 'weapon' : 'general',
  };
}

// Update ItemCategory to include 'misc'
export type ItemCategory = 'general' | 'weapon' | 'consumable' | 'medical' | 'misc';

export interface ItemRequirements {
  minStrength?: number;
  location?: string[];
  combatOnly?: boolean;
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'other';
  value: number;
}
