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
}

export function createInventoryItem(itemData: Omit<InventoryItem, 'category'>): InventoryItem {
  return {
    ...itemData,
    category: itemData.weapon ? 'weapon' : 'general',
  };
}

export type ItemCategory = 'general' | 'weapon' | 'consumable' | 'medical';

export interface ItemRequirements {
  minStrength?: number;
  location?: string[];
  combatOnly?: boolean;
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'other';
  value: number;
}
