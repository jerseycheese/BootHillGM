export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ItemCategory;
  requirements?: ItemRequirements;
  effect?: ItemEffect;
  usePrompt?: string;
  weapon?: Weapon; // Updated to use Weapon type
  isEquipped?: boolean; // Added isEquipped property
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

export interface WeaponModifiers {
  accuracy: number;     // Base accuracy modifier
  reliability: number; // Chance of malfunction (1-100)
  speed: number;       // Initiative modifier
  range: number;       // Effective range in yards
  damage: string;      // Damage dice (e.g. "1d6+1")
  ammunition?: number;  // Current ammunition
  maxAmmunition?: number; // Maximum ammunition capacity
}

export interface Weapon {
  id: string;
  name: string;
  modifiers: WeaponModifiers;
  ammunition?: number;
  maxAmmunition?: number;
}

export interface ItemValidationResult {
  valid: boolean;
  reason?: string;
}
