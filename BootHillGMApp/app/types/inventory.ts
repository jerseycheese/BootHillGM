// BootHillGMApp/app/types/inventory.ts

export type ItemCategory = 'weapon' | 'general' | 'consumable';

export interface ItemRequirements {
  minStrength?: number;
  location?: string[];
  combatOnly?: boolean;
}

export interface ItemEffect {
  type: 'heal' | 'buff' | 'utility';
  value?: number;
  duration?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  category: ItemCategory;
  requirements?: ItemRequirements;
  effect?: ItemEffect;
  usePrompt?: string;
}

export interface ItemValidationResult {
  valid: boolean;
  reason?: string;
}
